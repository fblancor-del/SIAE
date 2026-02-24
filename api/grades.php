<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getPDO();

    if ($method === 'GET') {
        $stmt = $pdo->query(
            'SELECT c.id,
                    a.nombre_completo AS alumno_nombre,
                    a.numero_control,
                    m.nombre AS materia_nombre,
                    c.calificacion,
                    c.semestre,
                    c.parcial
             FROM calificaciones c
             INNER JOIN alumnos a ON a.id = c.alumno_id
             INNER JOIN materias m ON m.id = c.materia_id
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

        $alumnoId = (int)($input['alumno_id'] ?? 0);
        $materiaId = (int)($input['materia_id'] ?? 0);
        $docenteId = isset($input['docente_id']) && $input['docente_id'] !== null ? (int)$input['docente_id'] : null;
        $calificacion = (float)($input['calificacion'] ?? -1);
        $semestre = (int)($input['semestre'] ?? 0);
        $parcial = (int)($input['parcial'] ?? 0);

        if ($alumnoId <= 0 || $materiaId <= 0 || $semestre < 1 || $semestre > 6 || $parcial < 1 || $parcial > 3 || $calificacion < 0 || $calificacion > 10) {
            jsonResponse(['success' => false, 'message' => 'Datos de calificacion invalidos'], 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO calificaciones (alumno_id, materia_id, docente_id, calificacion, semestre, parcial)
             VALUES (:alumno_id, :materia_id, :docente_id, :calificacion, :semestre, :parcial)'
        );

        $stmt->execute([
            'alumno_id' => $alumnoId,
            'materia_id' => $materiaId,
            'docente_id' => $docenteId,
            'calificacion' => $calificacion,
            'semestre' => $semestre,
            'parcial' => $parcial,
        ]);

        jsonResponse(['success' => true, 'message' => 'Calificacion registrada correctamente', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        jsonResponse(['success' => false, 'message' => 'Relacion invalida: revisa alumno, materia o docente'], 409);
    }

    jsonResponse(['success' => false, 'message' => 'Error de base de datos'], 500);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error interno del servidor'], 500);
}
