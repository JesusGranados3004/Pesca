<?php
header("Content-Type: application/json");
include("conexion.php");

// JOIN para traer también el teléfono del vendedor
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
    p.imagen,           -- <-- IMAGEN AGREGADA
    p.vendedor_id,
    v.telefono as vendedor_telefono,  -- <-- TELÉFONO DEL VENDEDOR
    v.nombre as vendedor_nombre
FROM productos p
LEFT JOIN vendedores v ON p.vendedor_id = v.id
WHERE p.disponibilidad = 1";

$resultado = $conexion->query($sql);

$productos = [];

while($fila = $resultado->fetch_assoc()){
    $productos[] = $fila;
}

echo json_encode($productos);
?>