<?php
header("Content-Type: application/json");
include("conexion.php");
session_start();

// Verificar sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

// Recibir datos del carrito
$input = json_decode(file_get_contents('php://input'), true);
$items = $input['items'] ?? [];

if (empty($items)) {
    echo json_encode(["error" => "Carrito vacío"]);
    exit;
}

$consumidor_id = $_SESSION['user_id'];
$total_general = 0;

$conexion->begin_transaction();
$errores = [];

try {
    // 1. Calcular total de la compra
    foreach ($items as $item) {
        $total_general += floatval($item['subtotal']);
    }

    // 2. Crear la compra principal
    $stmt = $conexion->prepare("INSERT INTO compras (consumidor_id, total) VALUES (?, ?)");
    $stmt->bind_param("id", $consumidor_id, $total_general);
    $stmt->execute();
    $compra_id = $conexion->insert_id;
    $stmt->close();

    // 3. Procesar cada item y actualizar inventario
    foreach ($items as $item) {
        $producto_id = intval($item['id']);
        $cantidad_vendida = floatval($item['cantidad']);
        $precio_unitario = floatval($item['precio']);
        $subtotal = floatval($item['subtotal']);

        // Verificar stock actual (con bloqueo para concurrencia)
        $stmt = $conexion->prepare("SELECT cantidad, nombre, disponibilidad FROM productos WHERE id = ? FOR UPDATE");
        $stmt->bind_param("i", $producto_id);
        $stmt->execute();
        $resultado = $stmt->get_result();
        $producto = $resultado->fetch_assoc();
        $stmt->close();

        if (!$producto) {
            throw new Exception("Producto #{$producto_id} no encontrado");
        }

        $stock_actual = floatval($producto['cantidad']);

        if ($stock_actual < $cantidad_vendida) {
            throw new Exception("Stock insuficiente para {$producto['nombre']}: disponible {$stock_actual} kg, solicitado {$cantidad_vendida} kg");
        }

        // 4. Actualizar inventario: RESTAR lo vendido
        $nueva_cantidad = $stock_actual - $cantidad_vendida;
        $nueva_disponibilidad = ($nueva_cantidad > 0) ? 1 : 0; // Si llega a 0, marcar como no disponible

        $stmt = $conexion->prepare("UPDATE productos SET cantidad = ?, disponibilidad = ? WHERE id = ?");
        $stmt->bind_param("dii", $nueva_cantidad, $nueva_disponibilidad, $producto_id);
        $stmt->execute();
        $stmt->close();

        // 5. Guardar detalle de la compra
        $stmt = $conexion->prepare("INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iidd", $compra_id, $producto_id, $cantidad_vendida, $precio_unitario);
        $stmt->execute();
        $stmt->close();
    }

    $conexion->commit();
    echo json_encode([
        "ok" => true, 
        "mensaje" => "Compra procesada correctamente",
        "compra_id" => $compra_id,
        "total" => $total_general
    ]);

} catch (Exception $e) {
    $conexion->rollback();
    echo json_encode(["error" => $e->getMessage()]);
}

$conexion->close();
?>