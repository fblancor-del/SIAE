<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getPDO();

    if ($method === 'GET') {
        $stmt = $pdo->query(
            'SELECT a.id, a.numero_control, a.nombre_completo, a.fecha_nacimiento, a.email, a.telefono, a.direccion, a.seccion, a.especialidad_id, a.semestre_actual, e.nombre AS especialidad_nombre
             FROM alumnos a
             LEFT JOIN especialidades e ON e.id = a.especialidad_id
             WHERE a.activo = 1
             ORDER BY a.id DESC'
        );

        jsonResponse([
            'success' => true,
            'data' => $stmt->fetchAll(),
        ]);
    }

    if ($method === 'POST') {
        $input = readJsonBody();

        $numeroControl = trim((string)($input['numero_control'] ?? ''));
        $nombreCompleto = trim((string)($input['nombre_completo'] ?? ''));
        $fechaNacimiento = trim((string)($input['fecha_nacimiento'] ?? ''));
        $email = ($input['email'] ?? null) ?: null;
        $telefono = ($input['telefono'] ?? null) ?: null;
        $direccion = ($input['direccion'] ?? null) ?: null;
        $seccion = ($input['seccion'] ?? null) ?: null;
        $especialidadId = ($input['especialidad_id'] ?? null) !== null && $input['especialidad_id'] !== '' ? (int)$input['especialidad_id'] : null;
        $semestre = (int)($input['semestre_actual'] ?? 1);

        if ($numeroControl === '' || $nombreCompleto === '' || $fechaNacimiento === '') {
            jsonResponse(['success' => false, 'message' => 'Faltan datos obligatorios del alumno'], 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO alumnos (numero_control, nombre_completo, fecha_nacimiento, email, telefono, direccion, seccion, especialidad_id, semestre_actual)
             VALUES (:numero_control, :nombre_completo, :fecha_nacimiento, :email, :telefono, :direccion, :seccion, :especialidad_id, :semestre_actual)'
        );

        $stmt->execute([
            'numero_control' => $numeroControl,
            'nombre_completo' => $nombreCompleto,
            'fecha_nacimiento' => $fechaNacimiento,
            'email' => $email,
            'telefono' => $telefono,
            'direccion' => $direccion,
            'seccion' => $seccion,
            'especialidad_id' => $especialidadId,
            'semestre_actual' => max(1, min(6, $semestre)),
        ]);

        jsonResponse(['success' => true, 'message' => 'Alumno creado correctamente', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    if ($method === 'PUT') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de alumno invalido'], 422);
        }

        $input = readJsonBody();

        $numeroControl = trim((string)($input['numero_control'] ?? ''));
        $nombreCompleto = trim((string)($input['nombre_completo'] ?? ''));
        $fechaNacimiento = trim((string)($input['fecha_nacimiento'] ?? ''));
        $email = ($input['email'] ?? null) ?: null;
        $telefono = ($input['telefono'] ?? null) ?: null;
        $direccion = ($input['direccion'] ?? null) ?: null;
        $seccion = ($input['seccion'] ?? null) ?: null;
        $especialidadId = ($input['especialidad_id'] ?? null) !== null && $input['especialidad_id'] !== '' ? (int)$input['especialidad_id'] : null;
        $semestre = (int)($input['semestre_actual'] ?? 1);

        if ($numeroControl === '' || $nombreCompleto === '' || $fechaNacimiento === '') {
            jsonResponse(['success' => false, 'message' => 'Faltan datos obligatorios del alumno'], 422);
        }

        $stmt = $pdo->prepare(
            'UPDATE alumnos
             SET numero_control = :numero_control,
                 nombre_completo = :nombre_completo,
                 fecha_nacimiento = :fecha_nacimiento,
                 email = :email,
                 telefono = :telefono,
                 direccion = :direccion,
                 seccion = :seccion,
                 especialidad_id = :especialidad_id,
                 semestre_actual = :semestre_actual
             WHERE id = :id AND activo = 1'
        );

        $stmt->execute([
            'numero_control' => $numeroControl,
            'nombre_completo' => $nombreCompleto,
            'fecha_nacimiento' => $fechaNacimiento,
            'email' => $email,
            'telefono' => $telefono,
            'direccion' => $direccion,
            'seccion' => $seccion,
            'especialidad_id' => $especialidadId,
            'semestre_actual' => max(1, min(6, $semestre)),
            'id' => $id,
        ]);

        jsonResponse(['success' => true, 'message' => 'Alumno actualizado correctamente']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de alumno invalido'], 422);
        }

        $stmt = $pdo->prepare('UPDATE alumnos SET activo = 0 WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse(['success' => true, 'message' => 'Alumno eliminado correctamente']);
    }

    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        jsonResponse(['success' => false, 'message' => 'Numero de control duplicado o relacion invalida'], 409);
    }

    jsonResponse(['success' => false, 'message' => 'Error de base de datos'], 500);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error interno del servidor'], 500);
}
