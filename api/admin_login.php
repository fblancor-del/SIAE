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

if ($usuario !== $validUser) {
    jsonResponse(['success' => false, 'message' => 'Credenciales incorrectas'], 401);
}

try {
    $pdo = getPDO();

    $stmt = $pdo->prepare('SELECT id, usuario, password, nombre, email, activo FROM administradores WHERE usuario = :usuario LIMIT 1');
    $stmt->execute(['usuario' => $validUser]);
    $admin = $stmt->fetch();

    if (!$admin) {
        $passwordHash = password_hash($validPassword, PASSWORD_BCRYPT);
        $insert = $pdo->prepare('INSERT INTO administradores (usuario, password, nombre, email, activo) VALUES (:usuario, :password, :nombre, :email, 1)');
        $insert->execute([
            'usuario' => $validUser,
            'password' => $passwordHash,
            'nombre' => 'Administrador',
            'email' => null,
        ]);

        $stmt->execute(['usuario' => $validUser]);
        $admin = $stmt->fetch();
    }

    if (!$admin || (int)$admin['activo'] !== 1) {
        jsonResponse(['success' => false, 'message' => 'Credenciales incorrectas'], 401);
    }

    if (!password_verify($password, (string)$admin['password'])) {
        jsonResponse(['success' => false, 'message' => 'Credenciales incorrectas'], 401);
    }
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error de servidor en login'], 500);
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

$_SESSION['admin_id'] = 1;
$_SESSION['admin_usuario'] = $validUser;

jsonResponse([
    'success' => true,
    'user' => [
        'id' => (int)($admin['id'] ?? 1),
        'usuario' => $validUser,
        'nombre' => (string)($admin['nombre'] ?? 'Administrador'),
        'email' => (string)($admin['email'] ?? ''),
    ],
]);
