<?php
header('Content-Type: text/plain');

include("conexion.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "error: Método debe ser POST";
    exit;
}

if (empty($_POST['tipo']) || empty($_POST['email']) || empty($_POST['password'])) {
    echo "error: Faltan datos obligatorios";
    exit;
}

$tipo = $_POST['tipo'];
$nombre = $_POST['nombre'] ?? '';
$apellido1 = $_POST['apellido1'] ?? '';
$apellido2 = $_POST['apellido2'] ?? '';
$direccion = $_POST['direccion'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$correo = $_POST['email'];
$password = $_POST['password']; 

if ($tipo === 'consumidor') {
    $check = $conexion->prepare("SELECT id FROM consumidores WHERE correo = ?");
    $check->bind_param("s", $correo);
    $check->execute();
    $check->store_result();
    
    if ($check->num_rows > 0) {
        echo "Este correo ya está registrado";
        $check->close();
        exit;
    }
    $check->close();

    $stmt = $conexion->prepare("INSERT INTO consumidores 
        (nombre, apellido1, apellido2, direccion, telefono, correo, contraseña) 
        VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("sssssss", $nombre, $apellido1, $apellido2, $direccion, $telefono, $correo, $password);
    
} elseif ($tipo === 'vendedor') {
    $fecha = $_POST['fecha_nacimiento'] ?? null;

    $check = $conexion->prepare("SELECT id FROM vendedores WHERE correo = ?");
    $check->bind_param("s", $correo);
    $check->execute();
    $check->store_result();
    
    if ($check->num_rows > 0) {
        echo "Este correo ya está registrado";
        $check->close();
        exit;
    }
    $check->close();

    $stmt = $conexion->prepare("INSERT INTO vendedores 
        (nombre, apellido1, apellido2, fecha_nacimiento, direccion, telefono, correo, contraseña) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("ssssssss", $nombre, $apellido1, $apellido2, $fecha, $direccion, $telefono, $correo, $password);
    
} else {
    echo "error: Tipo inválido";
    exit;
}

if ($stmt->execute()) {
    echo "ok";
} else {
    echo "error SQL: " . $stmt->error;
}

$stmt->close();
$conexion->close();
?>