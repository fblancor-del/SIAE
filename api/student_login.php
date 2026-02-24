<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
}

$input = readJsonBody();
$numeroControl = trim((string)($input['numero_control'] ?? ''));
$fechaNacimiento = trim((string)($input['fecha_nacimiento'] ?? ''));

if ($numeroControl === '' || $fechaNacimiento === '') {
    jsonResponse(['success' => false, 'message' => 'Numero de control y fecha de nacimiento son obligatorios'], 422);
}

try {
    $pdo = getPDO();
    $stmt = $pdo->prepare(
        'SELECT a.id,
                a.numero_control,
                a.nombre_completo,
                a.fecha_nacimiento,
                a.email,
                a.telefono,
                a.direccion,
                a.seccion,
                a.especialidad_id,
                a.semestre_actual,
                a.foto,
                a.emergencia_nombre,
                a.emergencia_telefono,
                e.nombre AS especialidad_nombre
         FROM alumnos a
         LEFT JOIN especialidades e ON e.id = a.especialidad_id
         WHERE a.numero_control = :numero_control
           AND a.fecha_nacimiento = :fecha_nacimiento
           AND a.activo = 1
         LIMIT 1'
    );

    $stmt->execute([
        'numero_control' => $numeroControl,
        'fecha_nacimiento' => $fechaNacimiento,
    ]);

    $student = $stmt->fetch();

    if (!$student) {
        jsonResponse(['success' => false, 'message' => 'Credenciales incorrectas'], 401);
    }

    jsonResponse([
        'success' => true,
        'student' => $student,
    ]);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error en login de estudiante'], 500);
}
