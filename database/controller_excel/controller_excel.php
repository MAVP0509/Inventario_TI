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
use PhpOffice\PhpSpreadsheet\Writer\Ods\WriterPart;

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
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = programa_mantenimiento($clientejson);
} elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = reporte_mantenimiento($clientejson);
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


        // Activar el ajuste de texto para el rango de celdas (por ejemplo, toda la fila)
        /* $worksheet->getStyle("B$fila:J$fila")->getAlignment()->setWrapText(true);
        $worksheet->getRowDimension($fila)->setRowHeight(-1); */

        $num++; //*Aumentamos nuestro contador visual de la tabla
    }
    $worksheet->removeRow($fila); //* Elimina la fila extra insertada al final

    if ($cel == 1) {
        $worksheet->setCellValue("E$fila", "Linea: $item->linea"); //*añadiendo la linea abajo del modelo
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

    // Define la ruta física donde se guardará el archivo
    $base = realpath(__DIR__ . '/../../../');
    $host = $_SERVER['HTTP_HOST'];
    $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTTPS'] !== 'off') ? 'https' : 'http';

    if ($base !== false) {
        // DIRECTORY_SEPARATOR para compatibilidad entre SO
        $ruta_guardar = $base . DIRECTORY_SEPARATOR . 'Inventario_TI' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'controller_excel' . DIRECTORY_SEPARATOR . $nombreArchivo;
        $url_descarga = "{$protocolo}://{$host}/Inventario_TI/database/controller_excel/{$nombreArchivo}";
        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        // $writer->save('php://output');
        $writer->save($ruta_guardar);
        return [
            'result' => true,
            'url' => $url_descarga
        ];
    } else {
        return array(
            'result' => false,
            'error' => 'No se pudo resolver la ruta base.'
        );
    }
}

function fecha_programa($anio, $mes)
{
    // Primer día del mes
    $fecha  = date_create("{$anio}-{$mes}-01");
    // Dia de la semana (0 = domingo, 0= sábado)
    $dia_semana = (int)$fecha->format('w');

    // Si es sábado (6), sumamos dos días. Si es domingo (0) sumamos un día
    if ($dia_semana == 6) {
        $fecha->modify('+2 days');
    } elseif ($dia_semana == 0) {
        $fecha->modify('+1 day');
    }

    return $fecha->format('Y-m-d');
}

function ConsultarOrdenMTTO()
{
    include('../conexion.php');
    $SQL = "SELECT * FROM vorden_mantenimiento ORDER BY orden";
    $query = mysqli_query($con, $SQL);
    $datos = array();
    while ($filas = mysqli_fetch_object($query)) {
        array_push($datos, $filas->tipo_id);
    }
    return $datos;
}

function programa_mantenimiento($valores)
{
    include('../conexion.php');
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    // $anio_actual = date("Y") + 1;
    $anio_actual = date("Y");
    // $orden = array_map('intval', $valores->tipo);
    $orden = ConsultarOrdenMTTO();
    // var_dump($orden);
    $tipos_ordenados = implode(',', ConsultarOrdenMTTO());

    // $orden = "";

    // var_dumkp($orden);
    // $mes = $mes_index + 1;

    // Consulta SQL que obtiene todos los registros de la vista, en un orden específico según ID
    $sql_inv = "SELECT * FROM vprograma_mantenimiento ORDER BY FIELD(equipo, $tipos_ordenados)";
    // var_dump($sql_inv);
    $query = mysqli_query($con, $sql_inv);


    $datos = []; // Crea un arreglo vacío para almacenar los datos
    while ($fila =  mysqli_fetch_assoc($query)) { // Recorre los resultados fila por fila
        $datos[] = $fila; // Agrega cada fila al arreglo $datos
    }

    // Define las columnas de Excel correspondientes a los meses del año
    $meses_columnas = ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];

    // Recorre cada dispositivo y le asigna un índice de mes basado en su posición
    foreach ($datos as $i => &$dispositivo) {
        $mes_index = $i % 12;
        $mes = $mes_index + 1;
        $fecha_programada = fecha_programa($anio_actual, $mes);
        //  Se saca el residuo al dividir $i entre 12, 
        //  a su vez añadiendo un nuevo campo al $dispositivo llamado mes_index,
        //  indicando en qué mes le tocará mantenimiento.
        $dispositivo['mes_index'] = $i % 12;
        $id_equipo = $dispositivo['id_equipo'];
        $estado = 'Pendiente';

        $sql_insert = "INSERT INTO mantenimiento(id_equipo, anio, fecha_programada, estado)
                        VALUES ('$id_equipo','$anio_actual', '$fecha_programada', '$estado')";

        try {
            mysqli_query($con, $sql_insert);
        } catch (mysqli_sql_exception $e) {
            if ($e->getCode() == 1062) {
                return array(
                    'duplicado' => false
                );
            }
        }
    }

    unset($dispositivo); // Libera la variable de referencia

    // usort() ordena un arreglo en base a una función de comparación definida
    // fuction($a, $b) es la función a usar que recibe dos parámetros; son dos elementos del arreglo $datos a comparar entre sí.
    usort($datos, function ($a, $b) {
        return $a['mes_index'] <=> $b['mes_index'];
    });

    // Carga la plantilla Excel base del programa de mantenimiento
    $spreadsheet = IOFactory::load('FO-DSP-TI-03 Programa de Mantenimiento Preventivo Infraestructura TI Región XX Rev.00.xlsx');
    $worksheet = $spreadsheet->getActiveSheet(); // Obtiene la hoja activa

    $pageSetup = $worksheet->getPageSetup();
    $pageSetup->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);   //  Orientación horizontal
    $pageSetup->setPaperSize(PageSetup::PAPERSIZE_LETTER);  //  Establece el tamaño del papel
    $pageSetup->setFitToPage(true); //  Ajusta el contenido a una sola página
    $pageSetup->setFitToWidth(1);   //  Ajusta el contenido al ancho de una página.
    $pageSetup->setFitToHeight(0);  //  Permite que la altura no esté limitada (varias páginas verticales)

    $pageMargins = $worksheet->getPageMargins();
    $pageMargins->setTop(0.3);
    $pageMargins->setBottom(0.3);
    $pageMargins->setLeft(0.2);
    $pageMargins->setRight(0.2);

    // Define las filas base donde se empezará a escribir la tabla
    $fila_inicio = 13;
    $fila_nombre = 21;
    $fila_cargo = 22;
    $fila_fecha = 24;
    $filas = count($datos); // Cuenta cuántos dispositivos hay

    foreach ($datos as $index => $item) { // Recorre cada dispositivo
        // var_dump($item);
        // $fila_actual = $fila_inicio + $index;
        if ($index >= 3) { // A partir del cuarto dispositivo, inserta una nueva fila
            $worksheet->insertNewRowBefore($fila_inicio, 1); // Inserta nueva fila antes de la actual

            $worksheet->duplicateStyle($worksheet->getStyle("B14:S14"), "B{$fila_inicio}:S{$fila_inicio}");
        }

        // Configura el estilo de texto para que se ajuste automáticamente
        $worksheet->getStyle("B{$fila_inicio}:S{$fila_inicio}")->getAlignment()->setWrapText(true);
        $worksheet->getRowDimension($fila_inicio)->setRowHeight(-1);

        // Escribe los valores de cada campo en las tablas correspondientes
        $worksheet->setCellValue("B{$fila_inicio}", $index + 1);
        $worksheet->setCellValue("C{$fila_inicio}", $item['tipo']);
        $worksheet->setCellValue("D{$fila_inicio}", $item['nombre']);
        $worksheet->setCellValue("E{$fila_inicio}", $item['ubicacion']);
        $worksheet->setCellValue("F{$fila_inicio}", $item['modelo']);
        $worksheet->setCellValue("G{$fila_inicio}", $item['num_serie']);

        // Marca con una 'x' el mes correspondiente al mantenimiento
        $mes_index = $item['mes_index'];
        $columna_mes = $meses_columnas[$mes_index];
        $worksheet->setCellValue("{$columna_mes}{$fila_inicio}", 'x');

        $fila_inicio++; // Pasa a la siguiente fila
    }

    // Calcula la fila donde se pondrán los nombres (según cuántos registros hay)
    $nombres = $fila_nombre + ($filas - 3);

    // Escribe los nombres de quien elaboró y autorizó
    $worksheet->setCellValue("C$nombres", $valores->elaboro);
    $worksheet->setCellValue("G$nombres", $valores->autorizo);
    $worksheet->getStyle("C$nombres")->getAlignment()->setWrapText(true); // Ajuste de texto

    // Calcula la fila donde van los cargos
    $cargos = $fila_cargo + ($filas - 3);

    // Escribe los cargos correspondientes
    $worksheet->setCellValue("C$cargos", $valores->cg_elaboro);
    $worksheet->setCellValue("G$cargos", $valores->cg_autorizo);
    $worksheet->getStyle("C$cargos")->getAlignment()->setWrapText(true);

    // Calcula la fila de la fecha
    $fechas = $fila_fecha + ($filas - 3);
    $worksheet->setCellValue("D$fechas", date('Y-m-d'));
    $worksheet->getStyle("C$fechas")->getAlignment()->setWrapText(true);

    $fecha = date('Ymd_His'); // Genera una marca de tiempo para el nombre del archivo
    $nombre_doc = "FO-DSP-TI-03_Programa de Mantenimiento Preventivo TI Región Sur_{$fecha}.xlsx"; // Nombre del archivo generado

    $base = realpath(__DIR__ . '/../../../');
    $host = $_SERVER['HTTP_HOST'];
    $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';

    if ($base !== false) {
        // Define la ruta física donde se guardará el archivo, basada en la estructura del proyecto
        $ruta_guardar = $base . DIRECTORY_SEPARATOR . 'Inventario_TI' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'controller_excel' . DIRECTORY_SEPARATOR . 'documentos_descarga' . DIRECTORY_SEPARATOR . 'mantenimiento' . DIRECTORY_SEPARATOR . 'programa' . DIRECTORY_SEPARATOR . $nombre_doc;
        // Construye la URL de descarga del archivo generado
        $url_descarga = "{$protocolo}://{$host}/Inventario_TI/database/controller_excel/documentos_descarga/mantenimiento/programa/{$nombre_doc}";
    }

    // Crea y guarda el archivo Excel
    $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
    $writer->save($ruta_guardar); // Guarda el archivo en la ruta definida

    // Retorna un arreglo con el resultado y la URL para descargar el archivo
    return array(
        'result' => true,
        'url' => $url_descarga,
        // 'duplicados' => $duplicados
    );
}


function reporte_mantenimiento($valores)
{
    include('../conexion.php');

    $spreadsheet = IOFactory::load('FO-DSP-TI-06 Reporte de mantenimiento preventivo a equipo de computo Rev.01.xlsx'); //*Cargando la plantilla del Excel
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

    $worksheet->setCellValue("G11", !empty($valores->elementos->usuario) ? $valores->elementos->usuario : 'NA');
    $worksheet->setCellValue("G12", !empty($valores->elementos->cargo) ? $valores->elementos->cargo : 'NA');
    $worksheet->setCellValue("G13", !empty($valores->elementos->region) ? $valores->elementos->region : 'NA');
    // $worksheet->setCellValue("G14", !empty($valores->id) ? $valores->id : 'NA');

    // Mapeo de tipo -> fila
    $mapa_filas = [
        'Laptop' => 20,
        'Desktop' => 20,
        'Monitor' => 21,
        'Teclado' => 22,
        'Mouse' => 23,
        'Impresora' => 24,
        'Docking' => 25,
        'Docking Station' => 25,
    ];

    // Inicializar filas con 'NA'
    for ($fila = 20; $fila <= 27; $fila++) {
        $worksheet->setCellValue("G{$fila}", 'NA'); // Marca
        $worksheet->setCellValue("L{$fila}", 'NA'); // Modelo
        $worksheet->setCellValue("Q{$fila}", 'NA'); // Serie
        $worksheet->setCellValue("W{$fila}", 'NA'); // Observaciones
    }

    // Determinar fila a llenar según tipo
    $tipo = !empty($valores->tipo) ? $valores->tipo : 'Otros';
    $fila = $mapa_filas[$tipo] ?? 26; // 26 = Otros

    // Rellenar datos
    $marca = !empty($valores->elementos->marca) ? $valores->elementos->marca : 'NA';
    $modelo = !empty($valores->elementos->modelo) ? $valores->elementos->modelo : 'NA';
    $serie = !empty($valores->elementos->num_serie) ? $valores->elementos->num_serie : 'NA';
    // $observaciones = !empty($valores->ubicacion) ? $valores->ubicacion : 'NA';
    $observaciones = false;
    if ($marca !== 'NA' || $modelo !== 'NA' || $serie !== 'NA') {
        $worksheet->setCellValue("W{$fila}", '');
        $observaciones = true;
    }

    if ($observaciones) {
        for ($f = 20; $f <= 27; $f++); {
            $worksheet->setCellValue("W{$f}", '');
        }
    }

    $worksheet->setCellValue("G{$fila}", $marca);
    $worksheet->setCellValue("L{$fila}", $modelo);
    $worksheet->setCellValue("Q{$fila}", $serie);

    $worksheet->setCellValue("D69", !empty($valores->encargado) ? $valores->encargado : '');
    $worksheet->setCellValue("U69", !empty($valores->elementos->usuario) ? $valores->elementos->usuario : '');

    // $workskheet->setCellValue("W{$fila}", $observaciones);


    $fecha_doc = date('Ymd_His');
    $nombre_doc = "FO-DSP-TI-06 Reporte de mantenimiento preventivo a equipo de computo Rev.{$fecha_doc}.xlsx";

    $base = realpath(__DIR__ . '/../../../');
    $host = $_SERVER['HTTP_HOST'];
    $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';

    if ($base !== false) {
        $ruta_guardar = $base . DIRECTORY_SEPARATOR . 'Inventario_TI' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'controller_excel' . DIRECTORY_SEPARATOR . 'documentos_descarga' . DIRECTORY_SEPARATOR . 'mantenimiento' . DIRECTORY_SEPARATOR . 'reporte' . DIRECTORY_SEPARATOR . $nombre_doc;
        $url_descarga = "{$protocolo}://{$host}/Inventario_TI/database/controller_excel/documentos_descarga/mantenimiento/reporte/{$nombre_doc}";
    }

    $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
    $writer->save($ruta_guardar);

    return array(
        'result' => true,
        'url' => $url_descarga
    );
}
