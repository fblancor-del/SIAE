<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Metodo no permitido'], 405);
}

$input = readJsonBody();
$specialtyId = (int)($input['specialty_id'] ?? 0);
$cuadernillos = $input['cuadernillos'] ?? [];
$formatos = $input['formatos'] ?? [];

if ($specialtyId <= 0) {
    jsonResponse(['success' => false, 'message' => 'Especialidad invalida'], 422);
}

if (!is_array($cuadernillos)) {
    $cuadernillos = [];
}
if (!is_array($formatos)) {
    $formatos = [];
}

if (count($cuadernillos) === 0 && count($formatos) === 0) {
    jsonResponse(['success' => false, 'message' => 'No hay materiales para guardar'], 422);
}

try {
    $pdo = getPDO();
    $pdo->beginTransaction();

    $checkSpecialty = $pdo->prepare('SELECT id FROM especialidades WHERE id = :id AND activa = 1 LIMIT 1');
    $checkSpecialty->execute(['id' => $specialtyId]);
    if (!$checkSpecialty->fetch()) {
        $pdo->rollBack();
        jsonResponse(['success' => false, 'message' => 'Especialidad no encontrada'], 404);
    }

    $insertCuad = $pdo->prepare('INSERT INTO cuadernillos (especialidad_id, nombre, url) VALUES (:especialidad_id, :nombre, :url)');
    $insertFormato = $pdo->prepare('INSERT INTO formatos (especialidad_id, nombre, url) VALUES (:especialidad_id, :nombre, :url)');

    $savedBooks = 0;
    foreach ($cuadernillos as $item) {
        if (!is_array($item)) continue;

        $name = trim((string)($item['name'] ?? ''));
        $url = trim((string)($item['url'] ?? ''));
        if ($name === '') continue;

        $insertCuad->execute([
            'especialidad_id' => $specialtyId,
            'nombre' => $name,
            'url' => $url === '' ? null : $url,
        ]);
        $savedBooks++;
    }

    $savedFormats = 0;
    foreach ($formatos as $item) {
        if (!is_array($item)) continue;

        $name = trim((string)($item['name'] ?? ''));
        $url = trim((string)($item['url'] ?? ''));
        if ($name === '') continue;

        $insertFormato->execute([
            'especialidad_id' => $specialtyId,
            'nombre' => $name,
            'url' => $url === '' ? null : $url,
        ]);
        $savedFormats++;
    }

    $pdo->commit();

    jsonResponse([
        'success' => true,
        'message' => 'Material cargado correctamente',
        'saved_cuadernillos' => $savedBooks,
        'saved_formatos' => $savedFormats,
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse(['success' => false, 'message' => 'Error al guardar materiales'], 500);
}
