<?php
$servidor = "localhost";
$usuario = "Admin";
$password = "1234";
$base_datos = "Contactosdb";
$conn = new mysqli($servidor, $usuario, $password, $base_datos);
if ($conn->connect_error) {
 die("Error de conexión: " . $conn->connect_error);
}
?>
