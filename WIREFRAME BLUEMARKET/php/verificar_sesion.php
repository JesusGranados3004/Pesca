<?php
header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");

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