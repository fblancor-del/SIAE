<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getPDO();

    if ($method === 'GET') {
        $stmt = $pdo->query(
            'SELECT id, titulo, descripcion, fecha_evento, hora_evento, lugar, tipo, flyer
             FROM eventos
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

        $titulo = trim((string)($input['titulo'] ?? ''));
        $descripcion = ($input['descripcion'] ?? null) ?: null;
        $fechaEvento = trim((string)($input['fecha_evento'] ?? ''));
        $horaEvento = ($input['hora_evento'] ?? null) ?: null;
        $lugar = ($input['lugar'] ?? null) ?: null;
        $tipo = trim((string)($input['tipo'] ?? 'otro'));
        $flyer = ($input['flyer'] ?? null) ?: null;

        if ($titulo === '' || $fechaEvento === '') {
            jsonResponse(['success' => false, 'message' => 'Titulo y fecha del evento son obligatorios'], 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO eventos (titulo, descripcion, fecha_evento, hora_evento, lugar, tipo, flyer)
             VALUES (:titulo, :descripcion, :fecha_evento, :hora_evento, :lugar, :tipo, :flyer)'
        );

        $stmt->execute([
            'titulo' => $titulo,
            'descripcion' => $descripcion,
            'fecha_evento' => $fechaEvento,
            'hora_evento' => $horaEvento,
            'lugar' => $lugar,
            'tipo' => $tipo,
            'flyer' => $flyer,
        ]);

        jsonResponse(['success' => true, 'message' => 'Evento creado correctamente', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    if ($method === 'PUT') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de evento invalido'], 422);
        }

        $input = readJsonBody();

        $titulo = trim((string)($input['titulo'] ?? ''));
        $descripcion = ($input['descripcion'] ?? null) ?: null;
        $fechaEvento = trim((string)($input['fecha_evento'] ?? ''));
        $horaEvento = ($input['hora_evento'] ?? null) ?: null;
        $lugar = ($input['lugar'] ?? null) ?: null;
        $tipo = trim((string)($input['tipo'] ?? 'otro'));

        if ($titulo === '' || $fechaEvento === '') {
            jsonResponse(['success' => false, 'message' => 'Titulo y fecha del evento son obligatorios'], 422);
        }

        if (array_key_exists('flyer', $input)) {
            $flyer = ($input['flyer'] ?? null) ?: null;
            $stmt = $pdo->prepare(
                'UPDATE eventos
                 SET titulo = :titulo,
                     descripcion = :descripcion,
                     fecha_evento = :fecha_evento,
                     hora_evento = :hora_evento,
                     lugar = :lugar,
                     tipo = :tipo,
                     flyer = :flyer
                 WHERE id = :id AND activo = 1'
            );

            $stmt->execute([
                'titulo' => $titulo,
                'descripcion' => $descripcion,
                'fecha_evento' => $fechaEvento,
                'hora_evento' => $horaEvento,
                'lugar' => $lugar,
                'tipo' => $tipo,
                'flyer' => $flyer,
                'id' => $id,
            ]);
        } else {
            $stmt = $pdo->prepare(
                'UPDATE eventos
                 SET titulo = :titulo,
                     descripcion = :descripcion,
                     fecha_evento = :fecha_evento,
                     hora_evento = :hora_evento,
                     lugar = :lugar,
                     tipo = :tipo
                 WHERE id = :id AND activo = 1'
            );

            $stmt->execute([
                'titulo' => $titulo,
                'descripcion' => $descripcion,
                'fecha_evento' => $fechaEvento,
                'hora_evento' => $horaEvento,
                'lugar' => $lugar,
                'tipo' => $tipo,
                'id' => $id,
            ]);
        }

        jsonResponse(['success' => true, 'message' => 'Evento actualizado correctamente']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de evento invalido'], 422);
        }

        $stmt = $pdo->prepare('UPDATE eventos SET activo = 0 WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse(['success' => true, 'message' => 'Evento eliminado correctamente']);
    }

    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error en el servicio de eventos'], 500);
}
