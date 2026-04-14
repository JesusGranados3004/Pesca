<?php
header('Content-Type: application/json');

session_start();

$response = [
    "logueado" => false,
    "tipo" => null,
    "nombre" => null
];

if (isset($_SESSION['user_id'])) {
    $response["logueado"] = true;
    $response["tipo"] = $_SESSION['user_type'];
    $response["nombre"] = $_SESSION['user_name'];
    $response["user_id"] = $_SESSION['user_id'];
}

echo json_encode($response);
?>