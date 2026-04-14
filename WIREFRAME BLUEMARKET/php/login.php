<?php
header('Content-Type: application/json');

session_start();
include("conexion.php");

$response = ["success" => false, "message" => ""];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response["message"] = "Método no permitido";
    echo json_encode($response);
    exit;
}

$correo = $_POST['email'] ?? '';
$contraseña = $_POST['password'] ?? '';

if (empty($correo) || empty($contraseña)) {
    $response["message"] = "Correo y contraseña son obligatorios";
    echo json_encode($response);
    exit;
}


$stmt = $conexion->prepare("SELECT id, nombre, contraseña FROM consumidores WHERE correo = ? AND contraseña = ?");
$stmt->bind_param("ss", $correo, $contraseña); 
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_type'] = 'consumidor';
    $_SESSION['user_name'] = $user['nombre'];
    
    $response["success"] = true;
    $response["tipo"] = "consumidor";
    $response["message"] = "Bienvenido " . $user['nombre'];
    echo json_encode($response);
    exit;
}
$stmt->close();

$stmt = $conexion->prepare("SELECT id, nombre, contraseña FROM vendedores WHERE correo = ? AND contraseña = ?");
$stmt->bind_param("ss", $correo, $contraseña);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_type'] = 'vendedor';
    $_SESSION['user_name'] = $user['nombre'];
    
    $response["success"] = true;
    $response["tipo"] = "vendedor";
    $response["message"] = "Bienvenido " . $user['nombre'];
    echo json_encode($response);
    exit;
}
$stmt->close();

$response["message"] = "Correo o contraseña incorrectos";
echo json_encode($response);
?>