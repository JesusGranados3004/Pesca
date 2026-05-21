<?php

$host = "shinkansen.proxy.rlwy.net";
$usuario = "root";
$password = "HeYMRyxPvRNWFgGDGoBSuLkXwMLhLLLx";
$bd = "railway";
$puerto = 56697;

// Crear conexión
$conexion = new mysqli($host, $usuario, $password, $bd, $puerto);

// Verificar conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Configurar caracteres UTF-8
$conexion->set_charset("utf8");

?>
