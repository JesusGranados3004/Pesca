<?php

$host = "shinkansen.proxy.rlwy.net";
$usuario = "root";
$password = "HeYMRyxPvRNWFgGDGoBSuLkXwMLhLLLx";
$bd = "railway";
$puerto = 56697;

$conexion = new mysqli($host, $usuario, $password, $bd, $puerto);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$conexion->set_charset("utf8");

?>
