<?php

require __DIR__ . '/../../libraries/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;


$input = json_decode(file_get_contents('php://input'), true);
$datos = $input['datos'] ?? [];

$usuario = $datos[0]['usuario'] ?? '';
$area = $datos[0]['posicion'] ?? '';
$comentario = $datos[0]['comentario'] ?? '';
$fecha = $input['fecha'] ?? date('Y-m-d');



$spreadsheet = IOFactory::load('Plantilla3.xlsx');
$worksheet = $spreadsheet->getActiveSheet();

// Configuración de impresión
$pageSetup = $worksheet->getPageSetup();
$pageSetup->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
$pageSetup->setPaperSize(PageSetup::PAPERSIZE_LETTER);
$pageSetup->setFitToPage(true);
$pageSetup->setFitToWidth(1);
$pageSetup->setFitToHeight(1);

//ajustando márgenes
$pageMargins = $worksheet->getPageMargins();
$pageMargins->setTop(0.5);
$pageMargins->setBottom(0.5);
$pageMargins->setLeft(0.5);
$pageMargins->setRight(0.5);


$fila = 19;
$num = 1;
$filaInicio = 19;

foreach ($datos as $index => $item) {

    if ($index > 0) {
        $worksheet->insertNewRowBefore($fila, 1); // Solo insertas a partir de la segunda fila
    }

     // Reaplicar las combinaciones de celdas en la nueva fila
     $worksheet->mergeCells("D$fila:E$fila");
     $worksheet->mergeCells("F$fila:G$fila");
     $worksheet->mergeCells("H$fila:I$fila");

      // (Opcional) Copiar el estilo de la fila anterior (plantilla)
    $worksheet->duplicateStyle($worksheet->getStyle("A18:I18"), "A$fila:I$fila");

    // Luego escribe los datos en esa nueva fila
    $worksheet->setCellValue("A$fila", $num);
    $worksheet->setCellValue("B$fila", $item['tipo']);
    $worksheet->setCellValue("C$fila", $item['marca']);
    $worksheet->setCellValue("D$fila", $item['modelo']);
    $worksheet->setCellValue("F$fila", $item['num_serie'] ?? '');
    $worksheet->setCellValue("H$filaInicio", $comentario); // H e I combinadas
   

    
    $fila++; // Avanzas a la siguiente fila
    $num++;
}

$filaFin = $fila - 1; // porque al final del bucle, $fila ya fue incrementado una más

$worksheet->mergeCells("H$filaInicio:I$filaFin");

$worksheet->getCell('I8')->setValue(Date::PHPToExcel(new DateTime($fecha)));
$worksheet->getStyle('I8')->getNumberFormat()->setFormatCode('dd/mm/yyyy');

$worksheet->setCellValue('C10', $usuario);
$worksheet->setCellValue('G52', $usuario);

$worksheet->setCellValue('C12', $area);
$worksheet->setCellValue('G53', $area);


// Configurar headers para descarga
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="reporte.xlsx"');
header('Cache-Control: max-age=0');

$writer = IOFactory::createWriter($spreadsheet, 'Xlsx');

$writer->save('php://output');
exit;
?>