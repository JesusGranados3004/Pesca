<?php
header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
include("conexion.php");
session_start();

$origen = $_GET['origen'] ?? 'inicio';
$productos = [];

switch ($origen) {
    case 'inicio':
        $sql = "SELECT 
            p.id, p.nombre, p.descripcion, p.precio, p.origen,
            p.disponibilidad, p.pescador_responsable, p.cantidad,
            p.fecha, p.tipo_pesca, p.imagen, p.vendedor_id,
            v.telefono as vendedor_telefono, v.nombre as vendedor_nombre
        FROM productos p
        LEFT JOIN vendedores v ON p.vendedor_id = v.id
        WHERE p.disponibilidad = 1";
        
        $resultado = $conexion->query($sql);
        while($fila = $resultado->fetch_assoc()){ $productos[] = $fila; }
        break;

    case 'mis_productos':
        if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendedor') {
            http_response_code(401);
            echo json_encode(["error" => "No autorizado"]);
            exit;
        }
        $vendedor_id = $_SESSION['user_id'];
        $sql = "SELECT p.* FROM productos p WHERE p.vendedor_id = ? ORDER BY p.id DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $vendedor_id);
        $stmt->execute();
        $resultado = $stmt->get_result();
        while($fila = $resultado->fetch_assoc()){ $productos[] = $fila; }
        $stmt->close();
        break;

    case 'guardar_productos':
        header('Content-Type: text/plain');
        
        if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendedor') {
            echo "error: Debes iniciar sesión como vendedor";
            exit;
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo "error: Método debe ser POST";
            exit;
        }
        
        if (empty($_POST['nombre']) || empty($_POST['precio'])) {
            echo "error: Nombre y precio son obligatorios";
            exit;
        }
        
        $imagenPath = 'img/default-producto.svg';
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === 0) {
            $permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            $tipo = $_FILES['imagen']['type'];
            
            if (!in_array($tipo, $permitidos)) {
                echo "error: Solo imágenes JPG, PNG o WEBP";
                exit;
            }
            if ($_FILES['imagen']['size'] > 5 * 1024 * 1024) {
                echo "error: La imagen no puede superar 5MB";
                exit;
            }
            
            $uploadDir = '../uploads/productos/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
            $nombreArchivo = uniqid('prod_') . '_' . time() . '.' . $ext;
            $rutaCompleta = $uploadDir . $nombreArchivo;
            
            if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
                $imagenPath = 'uploads/productos/' . $nombreArchivo;
            } else {
                echo "error: No se pudo guardar la imagen";
                exit;
            }
        }
        
        $vendedor_id = $_SESSION['user_id'];
        $disponibilidad = intval($_POST['disponibilidad']);
        $cantidad = !empty($_POST['cantidad']) ? floatval($_POST['cantidad']) : 0.0;
        $precio = floatval($_POST['precio']);
        
        $stmt = $conexion->prepare("INSERT INTO productos 
            (nombre, descripcion, precio, imagen, origen, disponibilidad, 
             pescador_responsable, cantidad, fecha, tipo_pesca, vendedor_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("ssdssdsisss", 
            $_POST['nombre'], $_POST['descripcion'], $precio, $imagenPath,
            $_POST['origen'], $disponibilidad, $_POST['pescador_responsable'],
            $cantidad, $_POST['fecha'], $_POST['tipo_pesca'], $vendedor_id
        );
        
        if ($stmt->execute()) {
            echo "ok";
        } else {
            echo "error SQL: " . $stmt->error;
        }
        $stmt->close();
        break;
    
    case 'obtener_producto':

        if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendedor') {
            http_response_code(401);
            echo json_encode(["error" => "No autorizado"]);
            exit;
        }

        $id = intval($_GET['id']);
        $vendedor_id = $_SESSION['user_id'];

        $sql = "SELECT * FROM productos WHERE id = ? AND vendedor_id = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ii", $id, $vendedor_id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            echo json_encode(["error" => "Producto no encontrado"]);
            $stmt->close();
            exit;
        }

        $producto = $resultado->fetch_assoc();
        echo json_encode($producto);
        $stmt->close();
        exit;

        break;

    case 'editar_producto':

    header('Content-Type: text/plain');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');

    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendedor') {
        http_response_code(401);
        exit("No autorizado");
    }

    $id = intval($_POST['id']);
    $vendedor_id = $_SESSION['user_id'];
    $modo = $_POST['modo'] ?? 'correccion';

    $sqlImg = "SELECT * FROM productos WHERE id = ? AND vendedor_id = ?";
    $stmtImg = $conexion->prepare($sqlImg);
    $stmtImg->bind_param("ii", $id, $vendedor_id);
    $stmtImg->execute();
    $resImg = $stmtImg->get_result();

    if ($resImg->num_rows === 0) {
        exit("Producto no encontrado");
    }

    $productoActual = $resImg->fetch_assoc();
    $imagenPath = $productoActual['imagen'];
    $stmtImg->close();

    $hayNuevaImagen = false;
    
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === 0) {
        
        $permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!in_array($_FILES['imagen']['type'], $permitidos)) {
            exit("Solo JPG PNG WEBP");
        }
        
        if ($_FILES['imagen']['size'] > 5 * 1024 * 1024) {
            exit("La imagen no puede superar 5MB");
        }

        $uploadDir = '../uploads/productos/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
        $nombreArchivo = uniqid('prod_') . '_' . time() . '.' . $ext;
        $rutaCompleta = $uploadDir . $nombreArchivo;

        if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
            
            if (!empty($productoActual['imagen']) && $productoActual['imagen'] !== 'img/default-producto.svg') {
                $rutaAnterior = '../' . $productoActual['imagen'];
                if (file_exists($rutaAnterior)) {
                    unlink($rutaAnterior);
                }
            }
            
            $imagenPath = 'uploads/productos/' . $nombreArchivo;
            $hayNuevaImagen = true;
            
        } else {
            exit("Error subiendo imagen");
        }
    }

    
    if ($modo === 'stock' && !$hayNuevaImagen) {
        exit("Debes subir una foto del nuevo stock");
    }

    $nombre = $_POST['nombre'];
    $descripcion = $_POST['descripcion'] ?? '';
    $precio = floatval($_POST['precio']);
    $cantidad = floatval($_POST['cantidad']);
    $origen = $_POST['origen'] ?? '';
    $pescador_responsable = $_POST['pescador_responsable'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $tipo_pesca = $_POST['tipo_pesca'] ?? '';
    $disponibilidad = intval($_POST['disponibilidad']);

    $sql = "UPDATE productos SET
            nombre = ?,
            descripcion = ?,
            precio = ?,
            cantidad = ?,
            origen = ?,
            pescador_responsable = ?,
            fecha = ?,
            tipo_pesca = ?,
            disponibilidad = ?,
            imagen = ?
            WHERE id = ?
            AND vendedor_id = ?";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param(
        "ssdsssssisii",
        $nombre,
        $descripcion,
        $precio,
        $cantidad,
        $origen,
        $pescador_responsable,
        $fecha,
        $tipo_pesca,
        $disponibilidad,
        $imagenPath,
        $id,
        $vendedor_id
    );

    if ($stmt->execute()) {
        echo "ok";
    } else {
        echo "Error SQL: " . $stmt->error;
    }
    $stmt->close();
    exit;

    case 'eliminar_producto':

        if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendedor') {

            http_response_code(401);

            echo json_encode([
                "error" => "No autorizado"
            ]);

            exit;
        }

        $id = intval($_GET['id']);

        $vendedor_id = $_SESSION['user_id'];

        $sql = "DELETE FROM productos
                WHERE id = ?
                AND vendedor_id = ?";

        $stmt = $conexion->prepare($sql);

        $stmt->bind_param("ii", $id, $vendedor_id);

        if ($stmt->execute()) {

            echo json_encode([
                "success" => true
            ]);

        } else {

            echo json_encode([
                "error" => "No se pudo eliminar"
            ]);

        }

        $stmt->close();
        exit;

        break;

    default:
        http_response_code(400);
        echo json_encode(["error" => "Origen no válido"]);
        exit;
}

if ($origen !== 'guardar_productos' && $origen !== 'obtener_producto' 
    && $origen !== 'editar_producto' && $origen !== 'eliminar_producto') {
    echo json_encode($productos);
}

$conexion->close();
?>