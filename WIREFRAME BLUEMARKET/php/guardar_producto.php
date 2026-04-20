<?php
header('Content-Type: text/plain');
include("conexion.php");
session_start();

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

$imagenPath = null;
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === 0) {
    $permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    $tipo = $_FILES['imagen']['type'];
    
    if (!in_array($tipo, $permitidos)) {
        echo "error: Solo se permiten imágenes JPG, PNG o WEBP. Tipo: $tipo";
        exit;
    }
    
    if ($_FILES['imagen']['size'] > 5 * 1024 * 1024) {
        echo "error: La imagen no puede superar 5MB";
        exit;
    }
    

    $uploadDir = '../uploads/productos/';
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            echo "error: No se pudo crear la carpeta uploads/productos/";
            exit;
        }
    }
    
    // Verificar permisos
    if (!is_writable($uploadDir)) {
        chmod($uploadDir, 0777);
    }
    
    // Generar nombre único
    $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
    $nombreArchivo = uniqid('prod_') . '_' . time() . '.' . $ext;
    $rutaCompleta = $uploadDir . $nombreArchivo;
    
    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
        $imagenPath = 'uploads/productos/' . $nombreArchivo;
    } else {
        echo "error: No se pudo guardar la imagen en el servidor";
        exit;
    }
} else {
    // Si no hay imagen, usar imagen por defecto
    $imagenPath = 'img/default-producto.svg';
}

// Insertar en BD
$vendedor_id = $_SESSION['user_id'];

$stmt = $conexion->prepare("INSERT INTO productos 
    (nombre, descripcion, precio, imagen, origen, disponibilidad, 
     pescador_responsable, cantidad, fecha, tipo_pesca, vendedor_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    echo "error: Error preparando consulta: " . $conexion->error;
    exit;
}

// Convertir tipos correctamente
$disponibilidad = intval($_POST['disponibilidad']);
$cantidad = !empty($_POST['cantidad']) ? intval($_POST['cantidad']) : 0;
$precio = floatval($_POST['precio']);

$stmt->bind_param("ssdssisisss", 
    $_POST['nombre'],
    $_POST['descripcion'],
    $precio,
    $imagenPath,
    $_POST['origen'],
    $disponibilidad,
    $_POST['pescador_responsable'],
    $cantidad,
    $_POST['fecha'],
    $_POST['tipo_pesca'],
    $vendedor_id
);

if ($stmt->execute()) {
    echo "ok";
} else {
    echo "error SQL: " . $stmt->error;
}

$stmt->close();
$conexion->close();
?>