<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
}

$input = readJsonBody();
$materiaId = (int)($input['materia_id'] ?? 0);
$rows = $input['rows'] ?? [];

if ($materiaId <= 0 || !is_array($rows) || count($rows) === 0) {
    jsonResponse(['success' => false, 'message' => 'Datos de carga masiva invalidos'], 422);
}

try {
    $pdo = getPDO();
    $pdo->beginTransaction();

    $findStudentStmt = $pdo->prepare('SELECT id FROM alumnos WHERE numero_control = :numero_control AND activo = 1 LIMIT 1');
    $insertGradeStmt = $pdo->prepare(
        'INSERT INTO calificaciones (alumno_id, materia_id, docente_id, calificacion, semestre, parcial)
         VALUES (:alumno_id, :materia_id, NULL, :calificacion, :semestre, :parcial)'
    );

    $inserted = 0;
    $skipped = 0;

    foreach ($rows as $row) {
        if (!is_array($row)) {
            $skipped++;
            continue;
        }

        $numeroControl = trim((string)($row['numero_control'] ?? ''));
        $calificacion = isset($row['calificacion']) ? (float)$row['calificacion'] : -1;
        $semestre = isset($row['semestre']) ? (int)$row['semestre'] : 1;
        $parcial = isset($row['parcial']) ? (int)$row['parcial'] : 1;

        if ($numeroControl === '' || $calificacion < 0 || $calificacion > 10 || $semestre < 1 || $semestre > 6 || $parcial < 1 || $parcial > 3) {
            $skipped++;
            continue;
        }

        $findStudentStmt->execute(['numero_control' => $numeroControl]);
        $student = $findStudentStmt->fetch();

        if (!$student) {
            $skipped++;
            continue;
        }

        $insertGradeStmt->execute([
            'alumno_id' => (int)$student['id'],
            'materia_id' => $materiaId,
            'calificacion' => $calificacion,
            'semestre' => $semestre,
            'parcial' => $parcial,
        ]);

        $inserted++;
    }

    $pdo->commit();

    jsonResponse([
        'success' => true,
        'inserted' => $inserted,
        'skipped' => $skipped,
        'message' => 'Carga masiva completada',
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse(['success' => false, 'message' => 'Error al procesar carga masiva'], 500);
}
