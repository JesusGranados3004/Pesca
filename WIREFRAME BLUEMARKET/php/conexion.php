<?php
$host = "localhost";
$usuario = "root";
$password = "3004";
$bd = "pesca";
$puerto = "3306";   

$conexion = new mysqli($host, $usuario, $password, $bd, $puerto);


if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$conexion->set_charset("utf8");
?>