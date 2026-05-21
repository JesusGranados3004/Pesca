<?php
header("Content-Type: application/json");
include("conexion.php");
session_start();

// Verificar sesión
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'consumidor') {
    http_response_code(401);
    echo json_encode(["error" => "No autorizado", "redirect" => "iniciarSesion.html"]);
    exit;
}

$consumidor_id = $_SESSION['user_id'];

$sql = "SELECT 
    c.id as compra_id,
    c.fecha,
    c.total,
    dc.id as detalle_id,
    dc.cantidad,
    dc.precio as precio_unitario,
    p.id as producto_id,
    p.nombre as producto_nombre,
    p.imagen as producto_imagen,
    p.origen,
    v.nombre as vendedor_nombre,
    v.telefono as vendedor_telefono
FROM compras c
INNER JOIN detalle_compra dc ON c.id = dc.compra_id
INNER JOIN productos p ON dc.producto_id = p.id
INNER JOIN vendedores v ON p.vendedor_id = v.id
WHERE c.consumidor_id = ?
ORDER BY c.fecha DESC, c.id DESC";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $consumidor_id);
$stmt->execute();
$resultado = $stmt->get_result();

$compras = [];
while ($fila = $resultado->fetch_assoc()) {
    $compra_id = $fila['compra_id'];
    
    // Agrupar por compra
    if (!isset($compras[$compra_id])) {
        $compras[$compra_id] = [
            'id' => $compra_id,
            'fecha' => $fila['fecha'],
            'total' => floatval($fila['total']),
            'items' => []
        ];
    }
    
    $compras[$compra_id]['items'][] = [
        'producto_id' => $fila['producto_id'],
        'nombre' => $fila['producto_nombre'],
        'imagen' => $fila['producto_imagen'],
        'cantidad' => floatval($fila['cantidad']),
        'precio_unitario' => floatval($fila['precio_unitario']),
        'subtotal' => floatval($fila['cantidad']) * floatval($fila['precio_unitario']),
        'origen' => $fila['origen'],
        'vendedor' => $fila['vendedor_nombre'],
        'vendedor_telefono' => $fila['vendedor_telefono']
    ];
}

// Reindexar como array numérico
echo json_encode(array_values($compras));

$stmt->close();
$conexion->close();
?>