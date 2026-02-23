<?php
$mensaje = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    // Incluir conexión
    require 'conexion.php';

    // Obtener datos del formulario
    $nombre = $_POST['nombre'];
    $apellido = $_POST['apellido'];
    $edad = $_POST['edad'];
    $nombre_usuario = $_POST['nombre_usuario'];
    $contrasena = password_hash($_POST['contrasena'], PASSWORD_DEFAULT);

    // Crear consulta
    $sql = "INSERT INTO usuarios (nombre, apellido, edad, nombre_usuario, contrasena)
            VALUES ('$nombre', '$apellido', $edad, '$nombre_usuario', '$contrasena')";

    // Ejecutar consulta
    if ($conn->query($sql) === TRUE) {
        $mensaje = "Registro exitoso.";
    } else {
        $mensaje = "Error: " . $conn->error;
    }

    $conn->close();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Registro de Usuario</title>
</head>

<body>

<h1>Registro de Usuario</h1>

<?php
if (!empty($mensaje)) {
    echo "<p>$mensaje</p>";
}
?>

<form action="FormRegistro.php" method="post">

    <label>Nombre:</label>
    <input type="text" name="nombre" required maxlength="50">
    <br><br>

    <label>Apellido:</label>
    <input type="text" name="apellido" required maxlength="50">
    <br><br>

    <label>Edad:</label>
    <input type="number" name="edad" required min="1">
    <br><br>

    <label>Nombre de Usuario:</label>
    <input type="text" name="nombre_usuario" required maxlength="50">
    <br><br>

    <label>Contraseña:</label>
    <input type="password" name="contrasena" required>
    <br><br>

    <button type="submit">Registrar</button>

</form>

</body>
</html>