<?php

header("Content-Type: application/json");

include("conexion.php");

session_start();


// SOLO vendedores
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendedor') {

    http_response_code(401);

    echo json_encode([
        "error" => "No autorizado"
    ]);

    exit;
}

$vendedor_id = $_SESSION['user_id'];

$sql = "

SELECT
    productos.nombre AS producto,
    consumidores.nombre AS cliente,
    detalle_compra.cantidad,
    (detalle_compra.cantidad * detalle_compra.precio) AS total,
    compras.fecha

FROM detalle_compra

INNER JOIN productos
ON detalle_compra.producto_id = productos.id

INNER JOIN compras
ON detalle_compra.compra_id = compras.id

INNER JOIN consumidores
ON compras.consumidor_id = consumidores.id

WHERE productos.vendedor_id = ?

ORDER BY compras.fecha DESC

";

$stmt = $conexion->prepare($sql);

$stmt->bind_param("i", $vendedor_id);

$stmt->execute();

$resultado = $stmt->get_result();

$ventas = [];

while ($fila = $resultado->fetch_assoc()) {

    $ventas[] = $fila;

}

echo json_encode($ventas);

?>