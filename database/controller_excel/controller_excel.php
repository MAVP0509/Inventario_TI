<?php
//TODO PHP para generación de documentos en excel y PDF
require __DIR__ . '/../../libraries/vendor/autoload.php';  //*Importamos el autoload del composer para acceder a la librería PHP SpreadSheet

//* Importación de utilidades de la librería
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = resguardo($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = cargar_plantilla($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = bajas($clientejson);
}

print(json_encode($respuesta_servidor));

//* Función para generación de resguardos
function resguardo($valores)
{
    

    //todo Desglosamos la información recibida del JS
    //* Array de los equipos del usuario seleccionado
    $datos = $valores->datos;
    //* Accedemos al nombre del usuario 
    $usuario = $datos[0]->usuario ?? '';
    //*Accedemos al cargo que tiene el usuario
    $cargo = $datos[0]->posicion ?? '';
    //*Si se ingresó un comentario, se accede a éste
    $comentario = $datos[0]->comentario ?? '';
    //*Se accede a la fecha en la que se configuró el resguardo
    $fecha = $datos[0]->fecha ?? date('Y-m-d');
    $fechaFormato =  (new DateTime($fecha))->format('d/m/Y');
    //*Se accede a la región en la que se está haciendo el resguardo
    $region = $datos[0]->region ?? '';
    //* Se accede a que supervisor tiene esa región y el cargo de éste
    $supervisor = $datos[0]->supervisor ?? '';
    $cargoSupervisor = $datos[0]->cargo ?? '';

    $area = $datos[0]->area ?? '';
    $ubicacion = $datos[0]->ubicacion ?? '';

    $userPemex = $datos[0]->userPemex ?? '';
    $userPemexCargo = $datos[0]->userPemexCargo ?? '';

    //*Variable que indica si es un resguardo de celular "1" indica que si es , "0" indica que no es
    $cel = $datos[0]->cel ?? 0;
    //var_dump($cel);


    $spreadsheet = IOFactory::load('FO-DSP-TI-01 Resguardo de herramientas TI Rev.00.xlsx'); //*Cargando la plantilla del Excel
    $worksheet = $spreadsheet->getActiveSheet();

    /* 
    TODO Configuración de impresión
    * Es necesario para dar un formato, delimitar márgenes para cuando se exporte a pdf, el pdf no este descuadrado
    */
    $pageSetup = $worksheet->getPageSetup();
    $pageSetup->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
    $pageSetup->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $pageSetup->setFitToPage(true);
    $pageSetup->setFitToWidth(1);
    $pageSetup->setFitToHeight(0);

    //* ajustando márgenes
    $pageMargins = $worksheet->getPageMargins();
    $pageMargins->setTop(0.5);
    $pageMargins->setBottom(0.5);
    $pageMargins->setLeft(0.5);
    $pageMargins->setRight(0.5);


    $fila = 17;        //* Fila desde donde se empezará a generar la tabla en el formato, funcionará como contador
    $num = 1;          //* Número visual en la tabla, funcionará como contador
    $filaInicio = 17;  //* Se guarda la fila de inicio para hacer cálculos después de generar la tabla del resguardo

    //* For para generar las filas de la tabla en el resguardo
    foreach ($datos as  $item) {

        //* Insertando una fila,  el 1 indica cuantas filas se insertarán
        $worksheet->insertNewRowBefore($fila, 1);

        /* 
         TODO Reaplicar las combinaciones de celdas en la nueva fila
         * Al insertar nuevas filas, no respeta las combinaciones de celdas de la plantilla
         */
        //$worksheet->mergeCells("D$fila:E$fila");
        $worksheet->mergeCells("E$fila:F$fila");
        $worksheet->mergeCells("G$fila:H$fila");
        $worksheet->mergeCells("I$fila:J$fila");

        //* Copiando el estilo de la fila anterior para mantener el estilo de la plantilla
        $worksheet->duplicateStyle($worksheet->getStyle("B17:J17"), "B$fila:J$fila");

        // Activar el ajuste de texto para el rango de celdas (por ejemplo, toda la fila)
        $worksheet->getStyle("B$fila:J$fila")->getAlignment()->setWrapText(true);
        $worksheet->getRowDimension($fila)->setRowHeight(-1);

        $worksheet->getStyle("B$fila:J$fila")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FFFFFF');
        $worksheet->getStyle("B$fila:J$fila")->getFont()->getColor()->setRGB('000000');

        //* Al copiar el estilo de la fila, el texto lo configura en negritas, asi que se le quita las negritas
        $worksheet->getStyle("A$fila:I$fila")->getFont()->setBold(false);

        //* Rellenamos la fila con sus datos correspondientes 
        if ($cel == 0) {
            $worksheet->setCellValue("B$fila", $num);
            $worksheet->setCellValue("C$fila", $item->tipo);
            $worksheet->setCellValue("D$fila", $item->marca);
            $worksheet->setCellValue("E$fila", $item->modelo);
            $worksheet->setCellValue("G$fila", $item->num_serie ?? 'NA'); //* Si el equipo no tiene num_serie, se le pone NA
            $worksheet->setCellValue("I$filaInicio", $comentario); // H e I combinadas

            $fila++; //* Aumentamos el contador para avanzar a la siguiente fila

            //* Verificamos si el equipo tiene un TAG asignado
            if ($item->tag != null && $item->tag != "NA") {

                //*Si tiene tag, se asigna una nueva fila
                $worksheet->insertNewRowBefore($fila, 1);

                //* Reaplicar las combinaciones de celdas en la nueva fila
                $worksheet->mergeCells("E$fila:F$fila");
                $worksheet->mergeCells("G$fila:H$fila");
                $worksheet->mergeCells("I$fila:J$fila");

                //*  Copiar el estilo de la fila anterior 
                $worksheet->duplicateStyle($worksheet->getStyle("B17:J17"), "B$fila:J$fila");

                //* Activar negrita solo para la celda del tag
                $worksheet->getStyle("E$fila")->getFont()->setBold(true);

                //* Insertando el tag en la fila correspondiente
                $worksheet->setCellValue("E$fila", $item->tag);

                $fila++; //* Aumentamos el contador para avanzar a la siguiente fila
            }
        } else if ($cel == 1) {
            $worksheet->setCellValue("B$fila", $num);
            $worksheet->setCellValue("C$fila", $item->tipo);
            $worksheet->setCellValue("D$fila", $item->marca);
            $worksheet->setCellValue("E$fila", $item->modelo);
            $worksheet->setCellValue("G$fila", $item->imei);
            $worksheet->setCellValue("I$filaInicio", $comentario); // H e I combinadas

            $fila++; //* Aumentamos el contador para avanzar a la siguiente fila
        }



        $num++; //*Aumentamos nuestro contador visual de la tabla
    }
    $worksheet->removeRow($fila); //* Elimina la fila extra insertada al final

    if ($cel == 1) {
        $worksheet->setCellValue("E$fila","Linea: $item->linea" ); //*añadiendo la linea abajo del modelo
        $worksheet->getStyle("E$fila")->getFont()->setBold(true);
        $worksheet->getStyle("E$fila")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
    }



    $filaFin = $fila - 1; //* Se guarda la fila final para hacer cálculos

    //* Combinando las filas generadas en la columna de Comentario
    $worksheet->mergeCells("I$filaInicio:J$filaFin");

    //*Asignando la fecha al resguardo
    $worksheet->getCell('J8')->setValue($fechaFormato);

    //*Configurando en el resguardo la información del usuario
    $worksheet->setCellValue('C8', $usuario);
    $worksheet->setCellValue('C10', $area);
    $worksheet->setCellValue('F10', $region);
    $worksheet->setCellValue('J10', $ubicacion);

    //* Calculando las celdas de la información del supervisor y configurando su información
    $filaSupervisor = 18 + $fila;
    $filaCargoSupervisor = $filaSupervisor + 1;
    $worksheet->setCellValue("C$filaSupervisor", $supervisor);
    $worksheet->setCellValue("C$filaCargoSupervisor", $cargoSupervisor);

    $worksheet->setCellValue("H$filaCargoSupervisor", $cargo);

    if (!empty($userPemex)) {
        $filaHeaderPemex = $filaCargoSupervisor + 5;
        $filaPemex = $filaCargoSupervisor + 7;
        $filaUserPemex = $filaPemex + 2;
        $filaCargoPemex = $filaUserPemex + 1;

        $worksheet->setCellValue("F$filaHeaderPemex", "ACEPTA Y RECIBE:");
        $worksheet->getStyle("F$filaHeaderPemex")->getFont()->setBold(true);
        $worksheet->getStyle("F$filaHeaderPemex")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $worksheet->getStyle("E$filaPemex:G$filaPemex")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THIN)->setColor(new Color(Color::COLOR_BLACK));

        $worksheet->setCellValue("F$filaUserPemex", $userPemex);
        $worksheet->getStyle("F$filaUserPemex")->getFont()->setBold(true);
        $worksheet->getStyle("F$filaUserPemex")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $worksheet->setCellValue("F$filaCargoPemex", $userPemexCargo);
        $worksheet->getStyle("F$filaCargoPemex")->getFont()->setBold(true);
        $worksheet->getStyle("F$filaCargoPemex")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    }



    //TODO Exportando el nuevo archivo excel

    //* Al archivo se le pone el nombre del usuario, para ello, quitamos los espacios y unimos el nombre de la persona con "_"
    $UserName = explode(" ", $usuario);
    $UserName = join("_", $UserName);

    //* Configuramos la ruta donde se guarda el excel
    $excelFilePath = 'C:\xampp\htdocs\Inventario_TI\database\controller_excel\Resguardo_' . $UserName . '.xlsx';
    //* Especificamos la extención del archivo
    $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
    //* Indicamos como se llama el archivo
    $writer->save('Resguardo_' . $UserName . '.xlsx');

    //* Mandamos a exportar a pdf el excel
    exportar_pdf($excelFilePath);

    //*Retornamos la ruta del excel
    return $excelFilePath;
}

//*Función para exportar excel a PDF
function exportar_pdf($file)
{
    //* Ruta a LibreOffice
    $libreOfficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.bin"';

    //* Comando para convertir el archivo Excel a PDF
    $command = "{$libreOfficePath} --headless --convert-to pdf {$file} >> out.txt 2>&1";

    //* Ejecutar el comando
    exec($command, $output);

    return true;
}

function cargar_plantilla()
{
    $respuesta = new stdClass();
    if (isset($_FILES['resguardo']) && $_FILES['resguardo']['error'] === UPLOAD_ERR_OK) {
        $nombreOriginal = $_FILES['resguardo']['name'];
        $tmpPath = $_FILES['resguardo']['tmp_name'];
        $nombreArchivo = explode(" ", $nombreOriginal);
        $nombreArchivo = join("_", $nombreArchivo);

        // Validar extensión .xlsx
        $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
        if ($ext !== 'xlsx') {
            $respuesta->error = "Tipo de archivo no permitido. Solo .xlsx";
            return $respuesta;
        }

        // Generar nombre único para evitar colisiones
        $nuevoNombre = time() . '_' . basename($nombreArchivo);

        // Ruta destino, __DIR__ es carpeta donde está este script PHP
        $destino = __DIR__ . '/aFormato_Resguardo' . $nuevoNombre;

        if (move_uploaded_file($tmpPath, $destino)) {
            $respuesta->mensaje = "Archivo guardado correctamente";
            $respuesta->ruta = 'C:\xampp\htdocs\Inventario_TI\database\controller_excel\aFormato_Resguardo' . $nuevoNombre;
        } else {
            $respuesta->error = "No se pudo mover el archivo.";
        }
    } else {
        $respuesta->error = "No se recibió ningún archivo válido.";
    }
    $excelFilePath = 'C:\xampp\htdocs\Inventario_TI\database\controller_excel\aFormato_Resguardo' . $nuevoNombre;
    exportar_pdf($excelFilePath);
    //var_dump($excelFilePath);
    return $respuesta;
}

function bajas($valores)
{
    $datos = $valores->tabla_baja;

    $spreadsheet = IOFactory::load('Baja FO-DSP BAJA.xlsx');
    $worksheet = $spreadsheet->getActiveSheet();

    $pageSetup = $worksheet->getPageSetup();
    $pageSetup->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
    $pageSetup->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $pageSetup->setFitToPage(true);
    $pageSetup->setFitToWidth(1);
    $pageSetup->setFitToHeight(0);

    $pageMargins = $worksheet->getPageMargins();
    $pageMargins->setTop(0.5);
    $pageMargins->setBottom(0.5);
    $pageMargins->setLeft(0.5);
    $pageMargins->setRight(0.5);

    $fila_observaciones = 27;
    $Fila_nombre = 38;
    $fila_cargos = 39;
    $fila_inicial = 15;
    $fila_monto = 18;
    $fila_quincena = 19;
    $fila_reubicacion = 24;

    $cantidad_filas = count($datos);
    // $fila_final = $fila_inicial + $cantidad_filas - 1;

    foreach ($datos as $item) {
        if ($cantidad_filas != 15) {
            $worksheet->insertNewRowBefore($fila_inicial, 1);   // Solo inserta después de la primera
        }

        $worksheet->mergeCells("D$fila_inicial:H$fila_inicial");

        $worksheet->duplicateStyle($worksheet->getStyle("B16:K16"), "B$fila_inicial:K$fila_inicial");

        $worksheet->getStyle("B$fila_inicial:K$fila_inicial")->getAlignment()->setWrapText(true);
        $worksheet->getRowDimension($fila_inicial)->setRowHeight(-1);

        $worksheet->getStyle("B$fila_inicial:K$fila_inicial")->getFont()->setBold(false);

        $worksheet->setCellValue("B$fila_inicial", $item->rownum);
        $worksheet->setCellValue("C$fila_inicial", $item->motivo_baja_id);
        $worksheet->setCellValue("D$fila_inicial", $item->descripcion);
        $worksheet->setCellValue("I$fila_inicial", !empty($item->lote) ? $item->lote : '');
        $worksheet->setCellValue("J$fila_inicial", $item->ubicacion);
        $worksheet->setCellValue("K$fila_inicial", $item->af);

        $fila_inicial++;
    }

    if (count($datos) > 0) {
        $worksheet->removeRow($fila_inicial);   // Elimina la fila_inicial extra
    }

    if ($valores->motivo == '5') {
        $worksheet->setCellValue('F12', $valores->otro);
    }

    if ($valores->motivo == '3') {
        $monto = $fila_monto + ($cantidad_filas - 1);
        $worksheet->setCellValue("E$monto", $valores->monto);
        $quincena = $fila_quincena + ($cantidad_filas - 1);
        $worksheet->setCellValue("E$quincena", $valores->quincena);
    }

    if ($valores->motivo == '6') {
        $reubicacion = $fila_reubicacion + ($cantidad_filas - 1);
        $worksheet->setCellValue("E$reubicacion", $valores->reubicacion);
    }

    $observaciones = $fila_observaciones + ($cantidad_filas - 1);
    $worksheet->setCellValue("B$observaciones", $valores->observaciones);

    $nombres = $Fila_nombre + ($cantidad_filas - 1);
    $worksheet->setCellValue("C$nombres", $valores->emisor);
    $worksheet->setCellValue("E$nombres", $valores->supervisor);
    $worksheet->setCellValue("G$nombres", $valores->vobo);
    $worksheet->setCellValue("I$nombres", $valores->autorizo);
    $worksheet->getStyle("C$nombres")->getAlignment()->setWrapText(true);

    $cargos = $fila_cargos + ($cantidad_filas - 1);

    $worksheet->setCellValue("C$cargos", $valores->cg_emisor);
    $worksheet->setCellValue("E$cargos", $valores->cg_supervisor);
    $worksheet->setCellValue("G$cargos", $valores->cg_vobo);
    $worksheet->setCellValue("I$cargos", $valores->cg_autorizo);
    $worksheet->getStyle("C$cargos")->getAlignment()->setWrapText(true);

    $nombre_doc = explode(" ", $valores->motivo);
    $nombre_doc = join("_", $nombre_doc);
    $fecha = date('Ymd_His');
    $nombreArchivo = "Baja_FO_DSP_{$nombre_doc}_{$fecha}.xlsx";

    $ruta_guardado = "C:\\xampp\\htdocs\\Inventario_TI\\database\\controller_excel\\{$nombreArchivo}";
    $url_descarga = "http://localhost/Inventario_TI/database/controller_excel/{$nombreArchivo}";


    // No guardamos el archivo en disco, en vez de eso enviamos al navegador:
    /* header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header("Content-Disposition: attachment; filename=\"$nombreArchivo\"");
    header('Cache-Control: max-age=0');
    header('Expires: 0');
    header('Pragma: public'); */

    $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
    // $writer->save('php://output');
    $writer->save($ruta_guardado);

    // $excelFilePath = 'C:\xampp\htdocs\Inventario_TI\database\controller_excel\Baja_FO_DSP_' . $nombre_doc . '.xlsx';
    // $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
    // $writer->save('Baja_FO_DSP' . $nombre_doc . '.xlsx');

    return [
        'result' => true,
        'url' => $url_descarga
    ];
}

function programa_mantenimiento ($valores) {
    $datos = $valores;

    $spreadsheet = IOFactory::load('FO-DSP-TI-03 Programa de Mantenimiento Preventivo Infraestructura TI Región XX Rev.00');
}
