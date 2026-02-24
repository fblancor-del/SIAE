<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getPDO();

    if ($method === 'GET') {
        $stmt = $pdo->query(
            'SELECT id, nombre_completo, email, telefono, especialidad, horario_disponibilidad
             FROM docentes
             WHERE activo = 1
             ORDER BY id DESC'
        );

        jsonResponse([
            'success' => true,
            'data' => $stmt->fetchAll(),
        ]);
    }

    if ($method === 'POST') {
        $input = readJsonBody();

        $nombreCompleto = trim((string)($input['nombre_completo'] ?? ''));
        $email = ($input['email'] ?? null) ?: null;
        $telefono = ($input['telefono'] ?? null) ?: null;
        $especialidad = ($input['especialidad'] ?? null) ?: null;
        $horario = ($input['horario_disponibilidad'] ?? null) ?: null;

        if ($nombreCompleto === '') {
            jsonResponse(['success' => false, 'message' => 'El nombre del docente es obligatorio'], 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO docentes (nombre_completo, email, telefono, especialidad, horario_disponibilidad)
             VALUES (:nombre_completo, :email, :telefono, :especialidad, :horario_disponibilidad)'
        );

        $stmt->execute([
            'nombre_completo' => $nombreCompleto,
            'email' => $email,
            'telefono' => $telefono,
            'especialidad' => $especialidad,
            'horario_disponibilidad' => $horario,
        ]);

        jsonResponse(['success' => true, 'message' => 'Docente creado correctamente', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    if ($method === 'PUT') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de docente invalido'], 422);
        }

        $input = readJsonBody();

        $nombreCompleto = trim((string)($input['nombre_completo'] ?? ''));
        $email = ($input['email'] ?? null) ?: null;
        $telefono = ($input['telefono'] ?? null) ?: null;
        $especialidad = ($input['especialidad'] ?? null) ?: null;
        $horario = ($input['horario_disponibilidad'] ?? null) ?: null;

        if ($nombreCompleto === '') {
            jsonResponse(['success' => false, 'message' => 'El nombre del docente es obligatorio'], 422);
        }

        $stmt = $pdo->prepare(
            'UPDATE docentes
             SET nombre_completo = :nombre_completo,
                 email = :email,
                 telefono = :telefono,
                 especialidad = :especialidad,
                 horario_disponibilidad = :horario_disponibilidad
             WHERE id = :id AND activo = 1'
        );

        $stmt->execute([
            'nombre_completo' => $nombreCompleto,
            'email' => $email,
            'telefono' => $telefono,
            'especialidad' => $especialidad,
            'horario_disponibilidad' => $horario,
            'id' => $id,
        ]);

        jsonResponse(['success' => true, 'message' => 'Docente actualizado correctamente']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de docente invalido'], 422);
        }

        $stmt = $pdo->prepare('UPDATE docentes SET activo = 0 WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse(['success' => true, 'message' => 'Docente eliminado correctamente']);
    }

    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
} catch (PDOException $e) {
    jsonResponse(['success' => false, 'message' => 'Error de base de datos'], 500);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error interno del servidor'], 500);
}
