<?php

require __DIR__ . '/kirby/bootstrap.php';

$kirby = new Kirby();

// Get the pressebilder page
$pressebilderPage = $kirby->site()->find('pressebilder');

if (!$pressebilderPage || $pressebilderPage->images()->count() === 0) {
    die('No images found');
}

// Create a temporary zip file
$zipFilename = 'pressebilder_' . date('Y-m-d') . '.zip';
$zipPath = sys_get_temp_dir() . '/' . $zipFilename;

$zip = new ZipArchive();
if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    die('Could not create zip file');
}

// Add all images to the zip (original quality)
foreach ($pressebilderPage->images() as $image) {
    $zip->addFile($image->root(), $image->filename());
}

$zip->close();

// Send the zip file to the browser
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $zipFilename . '"');
header('Content-Length: ' . filesize($zipPath));
readfile($zipPath);

// Delete the temporary zip file
unlink($zipPath);
exit;

