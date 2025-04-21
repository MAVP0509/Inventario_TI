<?php

require __DIR__ . '/../../libraries/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;


function restablecer_anchos_columnas($worksheet, $anchos = []) {     //?Esto se hace, porque a la hora de generar la plantilla, el ancho de las columnas, se resetea
    foreach ($anchos as $columna => $ancho) {
        $worksheet->getColumnDimension($columna)->setWidth($ancho);
    }
}

function restablecer_altura_filas($worksheet, $altos) {               //?Esto se hace, porque a la hora de generar la plantilla, el alto de las filas, se resetea
    foreach ($altos as $fila => $alto) {
        $worksheet->getRowDimension($fila)->setRowHeight($alto);
    }
}

function ajustar_ancho_columnas($worksheet, $desdeFila, $hastaFila, $columnas) {
    foreach ($columnas as $col) {
        $maxLength = 0;

        for ($fila = $desdeFila; $fila <= $hastaFila; $fila++) {
            $valor = $worksheet->getCell("$col$fila")->getValue();
            $valor = is_string($valor) ? $valor : strval($valor);
            $longitud = strlen($valor);
            if ($longitud > $maxLength) {
                $maxLength = $longitud;
            }
        }

        // Factor de ajuste (puedes experimentar con este valor)
        $worksheet->getColumnDimension($col)->setWidth($maxLength * 0.95);
    }
}

$input = json_decode(file_get_contents('php://input'), true);
$datos = $input['datos'] ?? [];

$producto = $input['producto'] ?? 'Sin producto';
$fecha = $input['fecha'] ?? date('Y-m-d');
$usuario = $input['usuario'] ?? 'Desconocido';


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


/* restablecer_anchos_columnas($worksheet, [
    'A' => 14.84,
    'B' => 10.71,
    'C' => 10.71,
    'D' => 10.71,
    'E' => 10.71,
    'F' => 10.71,
    'G' => 10.71,
    'H' => 10.71,
    'I' => 20.86,
    // Agrega las columnas necesarias según tu plantilla
]);


restablecer_altura_filas($worksheet, [
    1 => 15,
    2 => 15,
    3 => 15,
    4 => 15,
    5 => 15,
    6 => 15,
    7 => 15,
    8 => 15,
    9 => 15,
    10 => 15,
    11 => 15,
    12 => 15,
    13 => 15,
    14 => 15,
    15 => 15,
    16 => 15,
    17 => 15,
    18 => 15,
    19 => 15,
    20 => 15,
    21 => 15,
    22 => 15,
    23 => 15,
    24 => 15,
    25 => 15,
    26 => 15,
    27 => 15,
    28 => 24,
    29 => 27,
    30 => 15,
    31 => 39,
    32 => 15,
    33 => 15,
    34 => 15,
    35 => 15,
    36 => 15,
    37 => 15,
    38 => 15,
    39 => 15,
]); */

$fila = 19;
$num = 1;


foreach ($datos as $item) {
    // Inserta una nueva fila antes de la fila actual
    $worksheet->insertNewRowBefore($fila, 1);

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
    $worksheet->setCellValue("H$fila", $item['usuario']); // H e I combinadas
   /*  $worksheet->setCellValue("G$fila", $item['usuario']);
    $worksheet->setCellValue("H$fila", $item['posicion']); */

    
    $fila++; // Avanzas a la siguiente fila
    $num++;
}

$worksheet->getCell('I8')->setValue(Date::PHPToExcel(new DateTime($fecha)));
$worksheet->getStyle('I8')->getNumberFormat()->setFormatCode('dd/mm/yyyy');

//$worksheet->getCell('C19')->setValue($producto);


// Configurar headers para descarga
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="reporte.xlsx"');
header('Cache-Control: max-age=0');

$writer = IOFactory::createWriter($spreadsheet, 'Xlsx');

$writer->save('php://output');
exit;
?>