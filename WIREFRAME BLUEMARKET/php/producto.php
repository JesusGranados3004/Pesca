<?php
header("Content-Type: application/json");
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

    default:
        http_response_code(400);
        echo json_encode(["error" => "Origen no válido"]);
        exit;
}

if ($origen !== 'guardar_productos') {
    echo json_encode($productos);
}

$conexion->close();
?>