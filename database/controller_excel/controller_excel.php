<?php
require __DIR__ . '/../../libraries/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

header('Content_Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);
//$clientejson = json_decode(file_get_contents('php://input'));

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = resguardo($clientejson);
}

print(json_encode($respuesta_servidor));

function resguardo($valores){
    $className = \PhpOffice\PhpSpreadsheet\Writer\Pdf\Dompdf::class;
    IOFactory::registerWriter('Pdf', $className);

    $datos = $valores->datos;
    //var_dump($datos);
    $usuario = $datos[0]->usuario ?? '';
    $area = $datos[0]->posicion ?? '';
    $comentario = $datos[0]->comentario ?? '';
    //$fecha = $input['fecha'] ?? date('Y-m-d');
    $fecha = date('Y-m-d');


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

    foreach ($datos as  $item) {
        
        $worksheet->insertNewRowBefore($fila, 1); // Solo insertas a partir de la segunda fila

         // Reaplicar las combinaciones de celdas en la nueva fila
         $worksheet->mergeCells("D$fila:E$fila");
         $worksheet->mergeCells("F$fila:G$fila");
         $worksheet->mergeCells("H$fila:I$fila");

          // (Opcional) Copiar el estilo de la fila anterior (plantilla)
        $worksheet->duplicateStyle($worksheet->getStyle("A18:I18"), "A$fila:I$fila");

        // Luego escribe los datos en esa nueva fila
        $worksheet->setCellValue("A$fila", $num);
        $worksheet->setCellValue("B$fila", $item->tipo);
        $worksheet->setCellValue("C$fila", $item->marca);
        $worksheet->setCellValue("D$fila", $item->modelo);
        $worksheet->setCellValue("F$fila", $item->num_serie ?? '');
        $worksheet->setCellValue("H$filaInicio", $comentario); // H e I combinadas

        $fila++; // Avanzas a la siguiente fila
        $num++;
    }
    $worksheet->removeRow($fila); // Elimina la fila extra insertada al final
    $filaFin = $fila - 1; // porque al final del bucle, $fila ya fue incrementado una más


    $worksheet->mergeCells("H$filaInicio:I$filaFin");

    $worksheet->getCell('I8')->setValue(Date::PHPToExcel(new DateTime($fecha)));
    $worksheet->getStyle('I8')->getNumberFormat()->setFormatCode('dd/mm/yyyy');


    $worksheet->setCellValue('C10', $usuario);
    $worksheet->setCellValue('C12', $area);
    $UserName = explode(" ",$usuario);
    $UserName = join("_",$UserName);
    
    $excelFilePath ='C:\xampp\htdocs\Inventario_TI\database\controller_excel\Resguardo_'.$UserName.'.xlsx';
    $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
    $writer->save('Resguardo_'.$UserName.'.xlsx');

   
    exportar_pdf($excelFilePath);
    //return 'Resguardo_'.$UserName.'.xlsx';
    return $excelFilePath;
}

function exportar_pdf($file) {
     // Ruta a LibreOffice
     $libreOfficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.bin"';
    
     // Comando para convertir el archivo Excel a PDF
     $command = "{$libreOfficePath} --headless --convert-to pdf {$file} >> out.txt 2>&1";
    //var_dump($command);
    // Ejecutar el comando
    exec($command, $output);

    return true;
}
?>