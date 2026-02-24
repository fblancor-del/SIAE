<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function normalizeEstado(?string $estado): string
{
    $value = strtolower(trim((string)$estado));
    return in_array($value, ['espera', 'aceptado', 'rechazado'], true) ? $value : 'espera';
}

try {
    $pdo = getPDO();

    if ($method === 'GET') {
        $stmt = $pdo->query(
            'SELECT c.id,
                    c.alumno_id,
                    c.docente_id,
                    a.nombre_completo AS alumno_nombre,
                    d.nombre_completo AS docente_nombre,
                    c.fecha_cita,
                    c.hora_cita,
                    c.motivo,
                    c.estado
             FROM citas c
             INNER JOIN alumnos a ON a.id = c.alumno_id
             LEFT JOIN docentes d ON d.id = c.docente_id
             ORDER BY c.id DESC'
        );

        jsonResponse([
            'success' => true,
            'data' => $stmt->fetchAll(),
        ]);
    }

    if ($method === 'POST') {
        $input = readJsonBody();

        $alumnoId = isset($input['alumno_id']) && $input['alumno_id'] !== null ? (int)$input['alumno_id'] : 0;
        $numeroControl = trim((string)($input['numero_control'] ?? ''));
        $docenteId = isset($input['docente_id']) && $input['docente_id'] !== null ? (int)$input['docente_id'] : null;
        $fechaCita = trim((string)($input['fecha_cita'] ?? ''));
        $horaCita = trim((string)($input['hora_cita'] ?? ''));
        $motivo = ($input['motivo'] ?? null) ?: null;
        $estado = normalizeEstado((string)($input['estado'] ?? 'espera'));

        if ($alumnoId <= 0 && $numeroControl !== '') {
            $findStudent = $pdo->prepare('SELECT id FROM alumnos WHERE numero_control = :numero_control AND activo = 1 LIMIT 1');
            $findStudent->execute(['numero_control' => $numeroControl]);
            $studentRow = $findStudent->fetch();
            if ($studentRow) {
                $alumnoId = (int)$studentRow['id'];
            }
        }

        if ($alumnoId <= 0 || $fechaCita === '' || $horaCita === '') {
            jsonResponse(['success' => false, 'message' => 'Alumno, fecha y hora son obligatorios para la cita'], 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO citas (alumno_id, docente_id, fecha_cita, hora_cita, motivo, estado)
             VALUES (:alumno_id, :docente_id, :fecha_cita, :hora_cita, :motivo, :estado)'
        );

        $stmt->execute([
            'alumno_id' => $alumnoId,
            'docente_id' => $docenteId,
            'fecha_cita' => $fechaCita,
            'hora_cita' => $horaCita,
            'motivo' => $motivo,
            'estado' => $estado,
        ]);

        jsonResponse(['success' => true, 'message' => 'Cita creada correctamente', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    if ($method === 'PUT') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de cita invalido'], 422);
        }

        $input = readJsonBody();
        $estado = normalizeEstado((string)($input['estado'] ?? 'espera'));

        $stmt = $pdo->prepare('UPDATE citas SET estado = :estado WHERE id = :id');
        $stmt->execute([
            'estado' => $estado,
            'id' => $id,
        ]);

        jsonResponse(['success' => true, 'message' => 'Cita actualizada correctamente']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de cita invalido'], 422);
        }

        $stmt = $pdo->prepare('DELETE FROM citas WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse(['success' => true, 'message' => 'Cita eliminada correctamente']);
    }

    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        jsonResponse(['success' => false, 'message' => 'Relacion invalida de alumno o docente'], 409);
    }

    jsonResponse(['success' => false, 'message' => 'Error de base de datos en citas'], 500);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error en el servicio de citas'], 500);
}
