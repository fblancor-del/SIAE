<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = getPDO();

    if ($method === 'GET') {
        $stmt = $pdo->query('SELECT id, nombre, descripcion FROM especialidades WHERE activa = 1 ORDER BY id DESC');
        $specialties = $stmt->fetchAll();

        if (count($specialties) > 0) {
            $ids = array_map(fn ($row) => (int)$row['id'], $specialties);
            $placeholders = implode(',', array_fill(0, count($ids), '?'));

            $cuadStmt = $pdo->prepare("SELECT id, especialidad_id, nombre, url FROM cuadernillos WHERE especialidad_id IN ($placeholders) ORDER BY id DESC");
            $cuadStmt->execute($ids);
            $cuadernillos = $cuadStmt->fetchAll();

            $formStmt = $pdo->prepare("SELECT id, especialidad_id, nombre, url FROM formatos WHERE especialidad_id IN ($placeholders) ORDER BY id DESC");
            $formStmt->execute($ids);
            $formatos = $formStmt->fetchAll();

            $cuadBySpec = [];
            foreach ($cuadernillos as $item) {
                $specId = (int)$item['especialidad_id'];
                if (!isset($cuadBySpec[$specId])) {
                    $cuadBySpec[$specId] = [];
                }
                $cuadBySpec[$specId][] = [
                    'id' => (int)$item['id'],
                    'name' => (string)$item['nombre'],
                    'url' => (string)($item['url'] ?? ''),
                ];
            }

            $formatsBySpec = [];
            foreach ($formatos as $item) {
                $specId = (int)$item['especialidad_id'];
                if (!isset($formatsBySpec[$specId])) {
                    $formatsBySpec[$specId] = [];
                }
                $formatsBySpec[$specId][] = [
                    'id' => (int)$item['id'],
                    'name' => (string)$item['nombre'],
                    'url' => (string)($item['url'] ?? ''),
                ];
            }

            foreach ($specialties as &$specialty) {
                $id = (int)$specialty['id'];
                $specialty['cuadernillos'] = $cuadBySpec[$id] ?? [];
                $specialty['formatos'] = $formatsBySpec[$id] ?? [];
            }
            unset($specialty);
        }

        jsonResponse([
            'success' => true,
            'data' => $specialties,
        ]);
    }

    if ($method === 'POST') {
        $input = readJsonBody();
        $nombre = trim((string)($input['nombre'] ?? ''));
        $descripcion = ($input['descripcion'] ?? null) ?: null;

        if ($nombre === '') {
            jsonResponse(['success' => false, 'message' => 'El nombre de especialidad es obligatorio'], 422);
        }

        $stmt = $pdo->prepare('INSERT INTO especialidades (nombre, descripcion) VALUES (:nombre, :descripcion)');
        $stmt->execute([
            'nombre' => $nombre,
            'descripcion' => $descripcion,
        ]);

        jsonResponse(['success' => true, 'message' => 'Especialidad creada correctamente', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    if ($method === 'PUT') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de especialidad invalido'], 422);
        }

        $input = readJsonBody();
        $nombre = trim((string)($input['nombre'] ?? ''));
        $descripcion = ($input['descripcion'] ?? null) ?: null;

        if ($nombre === '') {
            jsonResponse(['success' => false, 'message' => 'El nombre de especialidad es obligatorio'], 422);
        }

        $stmt = $pdo->prepare('UPDATE especialidades SET nombre = :nombre, descripcion = :descripcion WHERE id = :id AND activa = 1');
        $stmt->execute([
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'id' => $id,
        ]);

        jsonResponse(['success' => true, 'message' => 'Especialidad actualizada correctamente']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['success' => false, 'message' => 'ID de especialidad invalido'], 422);
        }

        $stmt = $pdo->prepare('UPDATE especialidades SET activa = 0 WHERE id = :id');
        $stmt->execute(['id' => $id]);

        jsonResponse(['success' => true, 'message' => 'Especialidad eliminada correctamente']);
    }

    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Error en servicio de especialidades'], 500);
}
