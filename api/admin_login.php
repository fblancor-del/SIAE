<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
}

$input = readJsonBody();
$usuario = trim((string)($input['usuario'] ?? ''));
$password = (string)($input['password'] ?? '');

$validUser = 'Admin123';
$validPassword = '1234';

if ($usuario === '' || $password === '') {
    jsonResponse(['success' => false, 'message' => 'Usuario y contrasena son obligatorios'], 422);
}

if ($usuario !== $validUser || $password !== $validPassword) {
    jsonResponse(['success' => false, 'message' => 'Credenciales incorrectas'], 401);
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

$_SESSION['admin_id'] = 1;
$_SESSION['admin_usuario'] = $validUser;

jsonResponse([
    'success' => true,
    'user' => [
        'id' => 1,
        'usuario' => $validUser,
        'nombre' => 'Administrador',
        'email' => '',
    ],
]);
