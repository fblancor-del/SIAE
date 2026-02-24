<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
}

try {
    $pdo = getPDO();
    $stmt = $pdo->query('SELECT id, nombre FROM materias WHERE activa = 1 ORDER BY nombre ASC');

    jsonResponse([
        'success' => true,
        'data' => $stmt->fetchAll(),
    ]);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error al cargar materias'], 500);
}
