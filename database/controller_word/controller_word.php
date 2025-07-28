<?php
require_once __DIR__ . '\..\..\libraries\PhpWord\Autoloader.php';

use PhpOffice\PhpWord\TemplateProcessor;

header('Content_Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = bajas($clientejson);
}

print(json_encode($respuesta_servidor));

function bajas($valores) {

        
    $templateProcessor = new TemplateProcessor('Baja FO-DSP BAJA.docx');
}