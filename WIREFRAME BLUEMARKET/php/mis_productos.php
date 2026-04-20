<?php
header("Content-Type: application/json");
include("conexion.php");
session_start();

// Verificar que sea vendedor logueado
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendedor') {
    echo json_encode(["error" => "No autorizado"]);
    exit;
}

$vendedor_id = $_SESSION['user_id'];

$sql = "SELECT 
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.origen,
    p.disponibilidad,
    p.pescador_responsable,
    p.cantidad,
    p.fecha,
    p.tipo_pesca,
    p.imagen,
    p.vendedor_id
FROM productos p
WHERE p.vendedor_id = ?
ORDER BY p.id DESC";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $vendedor_id);
$stmt->execute();
$resultado = $stmt->get_result();

$productos = [];

while($fila = $resultado->fetch_assoc()){
    $productos[] = $fila;
}

echo json_encode($productos);

$stmt->close();
$conexion->close();
?>