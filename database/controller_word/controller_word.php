<?php
require_once __DIR__. '\..\..\libraries\PhpWord\Autoloader.php';
\PhpOffice\PhpWord\Autoloader::register();
\PhpOffice\PhpWord\Settings::setDefaultPaper('Letter'); // Papel predeterminado (A4)

// Fuente predeterminada
$phpWord = new \PhpOffice\PhpWord\PhpWord();
$phpWord->setDefaultFontName('Calibri');
//$phpWord->setDefaultFontColor('FF0000');
$phpWord->setDefaultFontSize(11);

$section = $phpWord->addSection();

$alignRight = ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::END];

// Encabezado de empresa
$section->addText("SERVICIOS PETROLEROS TERRESTRES", ['bold' => true, 'size' => 14]);
$section->addText("Código: FO-DSP-TI-01", null, $alignRight);
$section->addText("Revisión: 00", null, $alignRight);
$section->addText("Fecha actualización: 17/01/2019", null, $alignRight);

$section->addTextBreak(); // Salto de línea

// Título
$section->addText("RESGUARDO DE HERRAMIENTAS TI", ['bold' => true, 'size' => 13], ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER]);

$section->addTextBreak();

// Fecha
$section->addText("Fecha: 06/02/2024", null, $alignRight);

$section->addTextBreak();

// Datos personales
$section->addText("Nombre:\tCatalino Robles Sanchez");
$section->addTextBreak();
$section->addText("Área:\tPropuestas Técnicas\tRegión:\tSur\tUbicación:\tBase Operativa");

$section->addTextBreak();

// Texto explicativo
$section->addText(
    "Por medio de la presente hago constar que la empresa: DIAVAZ SERVICIOS DE PRODUCCIÓN S.A. DE C.V me otorga las siguientes herramientas de trabajo para desempeñar mis funciones:",
    null,
    ['alignment' => \PhpOffice\PhpWord\SimpleType\Jc::BOTH]
);

$section->addTextBreak(2);

// Estilos de tabla
$tableStyle = [
    'borderSize' => 6,
    'borderColor' => '000000',
    'cellMargin' => 50,
    'alignment' => \PhpOffice\PhpWord\SimpleType\JcTable::CENTER,
];

$cellStyle = ['valign' => 'center'];
$phpWord->addTableStyle('ToolTable', $tableStyle);

$table = $section->addTable('ToolTable');

// Encabezado
$headerFont = ['bold' => true];
$table->addRow();
$headers = ['ITEM', 'TIPO', 'MARCA', 'MODELO', 'NUMERO DE SERIE', 'OBSERVACIONES'];

$columnCount = count($headers);
$cellWidth = intval(10000 / $columnCount);

foreach ($headers as $header) {
    $table->addCell($cellWidth, $cellStyle)->addText($header, $headerFont);
}

// Filas de datos
$datos = [
    [1, 'UPS', 'KOBLENZ', '5216 R', '23-08-29699', 'Se asigna Monitor al Usuario'],
    [2, 'Monitor', 'HP', 'V22 FHD', 'CN42510QMR', ''],
];

foreach ($datos as $fila) {
    $table->addRow();
    foreach ($fila as $dato) {
        $table->addCell(2000, $cellStyle)->addText($dato);
    }
}

// Guardar documento
$objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
$objWriter->save('resguardo_herramientas.docx');

echo "Documento generado con éxito.";

echo "Documento creado con éxito.";
echo "<li><a href='resguardo_herramientas.docx' download>Descargar</a></li>";
