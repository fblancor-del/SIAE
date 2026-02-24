<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'PUT') {
    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
}

$input = readJsonBody();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(['success' => false, 'message' => 'ID de estudiante invalido'], 422);
}

try {
    $pdo = getPDO();

    $existingStmt = $pdo->prepare('SELECT id, nombre_completo, fecha_nacimiento, email, telefono, direccion, semestre_actual, foto, emergencia_nombre, emergencia_telefono FROM alumnos WHERE id = :id AND activo = 1 LIMIT 1');
    $existingStmt->execute(['id' => $id]);
    $current = $existingStmt->fetch();

    if (!$current) {
        jsonResponse(['success' => false, 'message' => 'Estudiante no encontrado'], 404);
    }

    $nombreCompleto = array_key_exists('nombre_completo', $input) ? trim((string)$input['nombre_completo']) : (string)$current['nombre_completo'];
    $fechaNacimiento = array_key_exists('fecha_nacimiento', $input) ? trim((string)$input['fecha_nacimiento']) : (string)$current['fecha_nacimiento'];
    $email = array_key_exists('email', $input) ? (($input['email'] ?? null) ?: null) : ($current['email'] ?? null);
    $telefono = array_key_exists('telefono', $input) ? (($input['telefono'] ?? null) ?: null) : ($current['telefono'] ?? null);
    $direccion = array_key_exists('direccion', $input) ? (($input['direccion'] ?? null) ?: null) : ($current['direccion'] ?? null);
    $semestre = array_key_exists('semestre_actual', $input) ? (int)$input['semestre_actual'] : (int)$current['semestre_actual'];
    $foto = array_key_exists('foto', $input) ? (($input['foto'] ?? null) ?: null) : ($current['foto'] ?? null);
    $emergenciaNombre = array_key_exists('emergencia_nombre', $input) ? (($input['emergencia_nombre'] ?? null) ?: null) : ($current['emergencia_nombre'] ?? null);
    $emergenciaTelefono = array_key_exists('emergencia_telefono', $input) ? (($input['emergencia_telefono'] ?? null) ?: null) : ($current['emergencia_telefono'] ?? null);

    if ($nombreCompleto === '' || $fechaNacimiento === '') {
        jsonResponse(['success' => false, 'message' => 'Nombre y fecha de nacimiento son obligatorios'], 422);
    }

    $semestre = max(1, min(12, $semestre));

    $stmt = $pdo->prepare(
        'UPDATE alumnos
         SET nombre_completo = :nombre_completo,
             fecha_nacimiento = :fecha_nacimiento,
             email = :email,
             telefono = :telefono,
             direccion = :direccion,
             semestre_actual = :semestre_actual,
             foto = :foto,
             emergencia_nombre = :emergencia_nombre,
             emergencia_telefono = :emergencia_telefono
         WHERE id = :id AND activo = 1'
    );

    $stmt->execute([
        'nombre_completo' => $nombreCompleto,
        'fecha_nacimiento' => $fechaNacimiento,
        'email' => $email,
        'telefono' => $telefono,
        'direccion' => $direccion,
        'semestre_actual' => $semestre,
        'foto' => $foto,
        'emergencia_nombre' => $emergenciaNombre,
        'emergencia_telefono' => $emergenciaTelefono,
        'id' => $id,
    ]);

    jsonResponse(['success' => true, 'message' => 'Perfil actualizado correctamente']);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error al actualizar perfil del estudiante'], 500);
}
