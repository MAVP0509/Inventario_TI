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
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = programa_auditoria($clientejson);
} elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = reporte_auditoria($clientejson);
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
        // //$worksheet->mergeCells("D$fila:E$fila");
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
{   // Obtiene la información de los activos a dar de baja
    $datos = $valores->tabla_baja;

    // Carga la plantilla base del documento de baja
    $spreadsheet = IOFactory::load('Baja FO-DSP BAJA.xlsx');
    $worksheet = $spreadsheet->getActiveSheet();

    // Configuración de impresión del documento
    $pageSetup = $worksheet->getPageSetup();
    $pageSetup->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
    $pageSetup->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $pageSetup->setFitToPage(true);
    $pageSetup->setFitToWidth(1);
    $pageSetup->setFitToHeight(0);

    // Configuración de márgenes del documento
    $pageMargins = $worksheet->getPageMargins();
    $pageMargins->setTop(0.5);
    $pageMargins->setBottom(0.5);
    $pageMargins->setLeft(0.5);
    $pageMargins->setRight(0.5);

    // Filas base donde se insertará información dinámica
    $fila_observaciones = 27;
    $Fila_nombre = 38;
    $fila_cargos = 39;
    $fila_inicial = 15;
    $fila_monto = 18;
    $fila_quincena = 19;
    $fila_reubicacion = 24;

    // Cantidad de activos a dar de baja
    $cantidad_filas = count($datos);

    // Generación de filas dinámicas
    foreach ($datos as $item) {
        // Inserta nuevas filas si la cantidad de activos es diferente a la plantilla base
        if ($cantidad_filas != 15) {
            $worksheet->insertNewRowBefore($fila_inicial, 1);   // Solo inserta después de la primera
        }
        // Une celdas para la descripción del activo
        $worksheet->mergeCells("D$fila_inicial:H$fila_inicial");

        // Duplica el estilo de la fila base para mantener formato consistente
        $worksheet->duplicateStyle($worksheet->getStyle("B16:K16"), "B$fila_inicial:K$fila_inicial");

        // Permite que el texto se ajuste automáticamente
        $worksheet->getStyle("B$fila_inicial:K$fila_inicial")->getAlignment()->setWrapText(true);
        $worksheet->getRowDimension($fila_inicial)->setRowHeight(-1);

        // Asegura que el texto no sea negrita
        $worksheet->getStyle("B$fila_inicial:K$fila_inicial")->getFont()->setBold(false);

        // Asignación de valores por columna
        $worksheet->setCellValue("B$fila_inicial", $item->rownum);
        $worksheet->setCellValue("C$fila_inicial", $item->motivo_baja_id);
        $worksheet->setCellValue("D$fila_inicial", $item->descripcion);
        $worksheet->setCellValue("I$fila_inicial", !empty($item->lote) ? $item->lote : '');
        $worksheet->setCellValue("J$fila_inicial", $item->ubicacion);
        $worksheet->setCellValue("K$fila_inicial", $item->af);

        // Avanza a la siguiente fila
        $fila_inicial++;
    }
    // Elimina la fila sobrante generada por la inserción dinámica
    if (count($datos) > 0) {
        $worksheet->removeRow($fila_inicial);
    }

    //* Campos dependientes del motivo de baja
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

    // Inserta observaciones considerando el número de activos
    $observaciones = $fila_observaciones + ($cantidad_filas - 1);
    $worksheet->setCellValue("B$observaciones", $valores->observaciones);

    // Inserta nombres de responsables
    $nombres = $Fila_nombre + ($cantidad_filas - 1);
    $worksheet->setCellValue("C$nombres", $valores->emisor);
    $worksheet->setCellValue("E$nombres", $valores->supervisor);
    $worksheet->setCellValue("G$nombres", $valores->vobo);
    $worksheet->setCellValue("I$nombres", $valores->autorizo);
    $worksheet->getStyle("C$nombres")->getAlignment()->setWrapText(true);

    // Inserta cargos de los responsables
    $cargos = $fila_cargos + ($cantidad_filas - 1);
    $worksheet->setCellValue("C$cargos", $valores->cg_emisor);
    $worksheet->setCellValue("E$cargos", $valores->cg_supervisor);
    $worksheet->setCellValue("G$cargos", $valores->cg_vobo);
    $worksheet->setCellValue("I$cargos", $valores->cg_autorizo);
    $worksheet->getStyle("C$cargos")->getAlignment()->setWrapText(true);

    // Genera el nombre dinámico del archivo
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
        //Contruye la ruta física y la URL pública de descarga
        $ruta_guardar = $base . DIRECTORY_SEPARATOR . 'Inventario_TI' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'controller_excel' . DIRECTORY_SEPARATOR . 'documentos_descarga' . DIRECTORY_SEPARATOR . 'bajas' . DIRECTORY_SEPARATOR  . $nombreArchivo;
        $url_descarga = "{$protocolo}://{$host}/Inventario_TI/database/controller_excel/documentos_descarga/bajas/{$nombreArchivo}";

        // Guarda el archivo Excel en el servidor
        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
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

function programa_mantenimiento($valores)
{
    include('../conexion.php');
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    //$anio_actual = date("Y") + 1;
    $anio_actual = $valores->anio;
    // Obtener orden de dispositivos para mantenimiento
    $sql_dev = "SELECT tipo_id FROM vorden_mantenimiento";
    $query_dev = mysqli_query($con, $sql_dev);
    // el orden de dispositivos se isnertan en un arreglo
    $datos_dev = [];
    while ($filas = mysqli_fetch_object($query_dev)) {
        $datos_dev[] = $filas->tipo_id;
    }
    // var_dump($datos_dev);
    $dev = implode(',', $datos_dev);

    if (empty($dev)) {
        return [
            'result' => false,
            'error' => 'No hay un orden de mantenimiento de dispositivos. Específica un orden en la configuración.'
        ];
    }

    // Consulta SQL que obtiene todos los registros de la vista, en un orden específico según ID
    $sql_inv = "CALL pprograma_mantenimiento('$dev', '$dev')";
    // var_dump($sql_inv);
    $query = mysqli_query($con, $sql_inv);

    $datos = []; // Crea un arreglo vacío para almacenar los datos

    if ($query) {
        while ($fila =  mysqli_fetch_assoc($query)) { // Recorre los resultados fila por fila
            $datos[] = $fila; // Agrega cada fila al arreglo $datos
        }

        while (mysqli_next_result($con)) {
            mysqli_use_result($con);
        }
    }

    if (empty($datos)) {
        return [
            'result' => false,
            'error' => 'No se encontraron dispositivos para programar mantenimiento.'
        ];
    }

    // Obtener orden de dispositivos para auditoria (ids y nombres)
    $sql_tipos_aud = "SELECT tipo_id, tipo FROM vorden_auditoria";
    $query_tipos_aud = mysqli_query($con, $sql_tipos_aud);

    $tipos_aud_ids = [];
    $tipos_aud_names = [];
    while ($row = mysqli_fetch_assoc($query_tipos_aud)) {
        $tipos_aud_ids[] = (int)$row['tipo_id'];
        $tipos_aud_names[] = mb_strtolower(trim($row['tipo']));
    }

    // Verificar si ya existen registros para el año; si ya existen, no insertamos, solo generamos documento
    $mantenimiento_exist = false;
    $auditoria_exist = false;
    $check_m = mysqli_query($con, "SELECT COUNT(*) AS cnt FROM mantenimiento WHERE anio = '$anio_actual'");
    if ($check_m) {
        $rowm = mysqli_fetch_assoc($check_m);
        $mantenimiento_exist = ((int)$rowm['cnt'] > 0);
    }
    $check_a = mysqli_query($con, "SELECT COUNT(*) AS cnt FROM auditoria WHERE anio = '$anio_actual'");
    if ($check_a) {
        $rowa = mysqli_fetch_assoc($check_a);
        $auditoria_exist = ((int)$rowa['cnt'] > 0);
    }

    // Define las columnas de Excel correspondientes a los meses del año
    $meses_columnas = ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];

    // Recorre cada dispositivo y le asigna un índice de mes basado en su posición
    foreach ($datos as $i => &$dispositivo) {
        $mes_index = $i % 12;
        $mes = $mes_index + 1;
        $fecha_programada = fecha_programa($anio_actual, $mes);
        $dispositivo['mes_index'] = $i % 12;
        //  Se saca el residuo al dividir $i entre 12, 
        //  a su vez añadiendo un nuevo campo al $dispositivo llamado mes_index,
        //  indicando en qué mes le tocará mantenimiento.
        $id_equipo = $dispositivo['id_equipo'];
        $estado = 'Pendiente';

        // Determinar tipo id/nombre del dispositivo en el resultado del SP
        $device_tipo_id = null;
        if (isset($dispositivo['tipo_id'])) {
            $device_tipo_id = (int)$dispositivo['tipo_id'];
        } elseif (isset($dispositivo['fk_tipo'])) {
            $device_tipo_id = (int)$dispositivo['fk_tipo'];
        }
        $device_tipo_nombre = mb_strtolower(trim($dispositivo['tipo'] ?? ''));

        // Insertar mantenimiento solo si no existe ya registro para el año y si el tipo no es teléfono celular
        if (!$mantenimiento_exist) {
            // verificar duplicado por equipo
            $chk = mysqli_query($con, "SELECT COUNT(*) AS cnt FROM mantenimiento WHERE id_equipo = '$id_equipo' AND anio = '$anio_actual'");
            $cnt = 0;
            if ($chk) {
                $cnt = (int)mysqli_fetch_assoc($chk)['cnt'];
            }
            if ($cnt === 0 && mb_strtolower($dispositivo['tipo'] ?? '') !== mb_strtolower('Teléfono celular')) {
                $sql_insert = "INSERT INTO mantenimiento(id_equipo, anio, fecha_programada, estado, correo_enviado, reporte_descargado,reporte_subido)
                                VALUES ('$id_equipo','$anio_actual', '$fecha_programada', '$estado',0,0,0)";
                mysqli_query($con, $sql_insert);
            }
        }

        // Insertar auditoria solo si no existen registros anuales y si el tipo del equipo está en la lista de auditoria
        $should_aud = false;
        if (!$auditoria_exist) {
            if ($device_tipo_id !== null) {
                if (in_array($device_tipo_id, $tipos_aud_ids, true)) {
                    $should_aud = true;
                }
            } else {
                if (in_array($device_tipo_nombre, $tipos_aud_names, true)) {
                    $should_aud = true;
                }
            }
        }

        if ($should_aud) {
            // verificar duplicado en auditoria por equipo
            $chk2 = mysqli_query($con, "SELECT COUNT(*) AS cnt FROM auditoria WHERE id_equipo = '$id_equipo' AND anio = '$anio_actual'");
            $cnt2 = 0;
            if ($chk2) {
                $cnt2 = (int)mysqli_fetch_assoc($chk2)['cnt'];
            }
            if ($cnt2 === 0) {
                $sql_insert_aud = "INSERT INTO auditoria(id_equipo, anio, fecha_programada, estado, correo_enviado, reporte_descargado,reporte_subido)
                                    VALUES ('$id_equipo','$anio_actual', '$fecha_programada', '$estado',0,0,0)";
                mysqli_query($con, $sql_insert_aud);
            }
        }
        /* try {
            
        } catch (mysqli_sql_exception $e) {
            if ($e->getCode() == 1062) {
                return array(
                    'result' => false,
                    'error' => 'Ya existe un programa de mantenimiento para el año'
                );
            }
        } */
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
        $celda = "{$columna_mes}{$fila_inicio}";
        $worksheet->setCellValue($celda, 'x');
        $worksheet->getStyle($celda)->getFont()->setBold(true);

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

    $base = realpath(__DIR__ . '/../../../Inventario_TI/database/controller_excel/documentos_descarga/mantenimiento/programa/');


    if ($base !== false) {

        // Carpeta por año del programa
        $carpeta_anual = $base . DIRECTORY_SEPARATOR . $anio_actual;
        if (!is_dir($carpeta_anual)) {
            mkdir($carpeta_anual, 0777, true);
        }

        $fecha = date('Ymd_His'); // Genera una marca de tiempo para el nombre del archivo
        $nombre_doc = "FO-DSP-TI-03_Programa de Mantenimiento Preventivo TI Región Sur_{$anio_actual}_{$fecha}.xlsx"; // Nombre del archivo generado
        // Define la ruta física donde se guardará el archivo, basada en la estructura del proyecto
        $ruta_guardar = $carpeta_anual . DIRECTORY_SEPARATOR . $nombre_doc;
        // Guardar Excel
        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($ruta_guardar); // Guarda el archivo en la ruta definida

        $host = $_SERVER['HTTP_HOST'];
        $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        // Construye la URL de descarga del archivo generado
        $url_descarga = "{$protocolo}://{$host}/Inventario_TI/database/controller_excel/documentos_descarga/mantenimiento/programa/{$anio_actual}/{$nombre_doc}";
        // Preparar lista de URLs (mantenimiento siempre se agrega)
        $urls = [$url_descarga];

        // Si el cliente solicitó ambos programas, generar el de auditoría también
        if (!empty($valores->descargar_ambos) && $valores->descargar_ambos == 1) {
            // Reutilizamos la función que genera el programa de auditoría
            $aud_result = programa_auditoria($valores);
            if (is_array($aud_result) && !empty($aud_result['result']) && $aud_result['result'] === true) {
                if (!empty($aud_result['url'])) {
                    $urls[] = $aud_result['url'];
                } elseif (!empty($aud_result['urls']) && is_array($aud_result['urls'])) {
                    $urls = array_merge($urls, $aud_result['urls']);
                }
            }
        }

        // Retorna el resultado y las URLs generadas (uno o varios archivos)
        return [
            'result' => true,
            'url' => $url_descarga,
            'urls' => $urls
        ];
    } else {
        return [
            'result' => false,
            'error' => 'No se pudo realizar el programa de mantenimiento. Inténtalo nuevamente.'
        ];
    }
}

function reporte_mantenimiento($valores)
{
    include('../conexion.php');

    $usuario = $valores->elementos->usuario;
    $anio = $valores->elementos->anio;

    $sql = "SELECT
                inv.id AS id,
                man.anio,
                man.estado,
                cu.nombre,
                cu.cargo,
                cu.region,
                ct.tipo,
                ca.marca,
                inv.modelo,
                inv.num_serie
            FROM inventario_ti_sur AS inv
            INNER JOIN cat_usuarios AS cu ON cu.id = inv.fk_usuario
            INNER JOIN cat_tipo AS ct ON ct.id = inv.fk_tipo 
            INNER JOIN cat_marca AS ca ON ca.id = inv.fk_marca
            LEFT JOIN mantenimiento AS man 
                ON man.id_equipo = inv.id AND man.anio = '$anio'
            WHERE cu.nombre = '$usuario'";

    $query = mysqli_query($con, $sql);

    $datos = [];

    while ($fila = mysqli_fetch_object($query)) {
        $datos[] = $fila;
    }

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

    $otros_fila = 26;
    $ids_equipo = [];

    foreach ($datos as $equipo) {
        $tipo = trim($equipo->tipo);

        if (isset($mapa_filas[$tipo])) {
            $fila = $mapa_filas[$tipo];
        } else {
            if ($otros_fila > 27) {
                continue;
            }

            $fila = $otros_fila;
            $otros_fila++;
        }

        $worksheet->setCellValue("G{$fila}", $equipo->marca ?? 'NA');
        $worksheet->setCellValue("L{$fila}", $equipo->modelo ?? 'NA');
        $worksheet->setCellValue("Q{$fila}", $equipo->num_serie ?? 'NA');
        $worksheet->setCellValue("W{$fila}", '');

        $ids_equipo[] = $equipo->id;
    }

    $worksheet->setCellValue("D69", !empty($valores->encargado) ? $valores->encargado : '');
    $worksheet->setCellValue("U69", !empty($valores->elementos->usuario) ? $valores->elementos->usuario : '');

    // $workskheet->setCellValue("W{$fila}", $observaciones);


    $fecha_doc = date('Ymd_His');
    $nombre_doc = "FO-DSP-TI-06 Reporte de mantenimiento preventivo a equipo de computo Rev.{$valores->elementos->id_usuario}_{$fecha_doc}.xlsx";

    $base = realpath(__DIR__ . '/../../../');
    $host = $_SERVER['HTTP_HOST'];
    $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';

    if ($base !== false) {
        $ruta_guardar = $base . DIRECTORY_SEPARATOR . 'Inventario_TI' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'controller_excel' . DIRECTORY_SEPARATOR . 'documentos_descarga' . DIRECTORY_SEPARATOR . 'mantenimiento' . DIRECTORY_SEPARATOR . 'reporte' . DIRECTORY_SEPARATOR . $nombre_doc;
        $url_descarga = "{$protocolo}://{$host}/Inventario_TI/database/controller_excel/documentos_descarga/mantenimiento/reporte/{$nombre_doc}";
    }

    $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
    $writer->save($ruta_guardar);

    $id_equipo = $valores->elementos->id;

    $sql = "UPDATE mantenimiento 
        SET reporte_descargado = 1,
            estado = 'En proceso'
        WHERE id_equipo = '$id_equipo'
        AND anio = '$anio'";

    if (!mysqli_query($con, $sql)) {
        return false;
    }

    /* if (!empty($ids_equipo)) {
        $ids = implode(',', $ids_equipo);
        $sql = "UPDATE mantenimiento 
                SET reporte_descargado = 1, 
                    estado = 'En proceso' 
                WHERE id_equipo IN ($ids)
                AND  anio = '$anio'";

        if (!mysqli_query($con, $sql)) {
            return false;
        }
    } */

    return array(
        'result' => true,
        'url' => $url_descarga,
        'ids' => $id_equipo
    );
}

function programa_auditoria($valores)
{
    include('../conexion.php');
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    /* $anio_actual = date("Y") + 1; */
    $anio_actual = $valores->anio;
    $sql_dev = "SELECT tipo_id FROM vorden_auditoria";
    $query_dev = mysqli_query($con, $sql_dev);

    $datos_dev = [];
    while ($filas = mysqli_fetch_object($query_dev)) {
        $datos_dev[] = $filas->tipo_id;
    }
    // var_dump($datos_dev);
    $dev = implode(',', $datos_dev);

    if (empty($dev)) {
        return [
            'result' => false,
            'error' => 'No hay un orden de auditoria de dispositivos. Específica un orden en la configuración.'
        ];
    }

    // Consulta SQL que obtiene todos los registros de la vista, en un orden específico según ID
    $sql_inv = "CALL pprogramar_auditoria('$dev', '$dev')";
    // var_dump($sql_inv);
    $query = mysqli_query($con, $sql_inv);

    $datos = []; // Crea un arreglo vacío para almacenar los datos

    if ($query) {
        while ($fila =  mysqli_fetch_assoc($query)) { // Recorre los resultados fila por fila
            $datos[] = $fila; // Agrega cada fila al arreglo $datos
        }

        while (mysqli_next_result($con)) {
            mysqli_use_result($con);
        }
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
        //  indicando en qué mes le tocará auditoria.
        $dispositivo['mes_index'] = $i % 12;
        $id_equipo = $dispositivo['id_equipo'];
        $estado = 'Pendiente';
        // Nota: No se insertan registros en la tabla 'auditoria' desde esta función.
        // La generación del documento se realiza independientemente del estado de la BD.
    }

    unset($dispositivo); // Libera la variable de referencia

    // usort() ordena un arreglo en base a una función de comparación definida
    // fuction($a, $b) es la función a usar que recibe dos parámetros; son dos elementos del arreglo $datos a comparar entre sí.
    usort($datos, function ($a, $b) {
        return $a['mes_index'] <=> $b['mes_index'];
    });

    // Carga la plantilla Excel base del programa de mantenimiento
    $spreadsheet = IOFactory::load('FO-DSP-TI-04 Programa de Auditoria de Herramientas de Trabajo Región XX Rev.00.xlsx');
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
        $celda = "{$columna_mes}{$fila_inicio}";
        $worksheet->setCellValue($celda, 'x');
        $worksheet->getStyle($celda)->getFont()->setBold(true);

        $fila_inicio++; // Pasa a la siguiente fila
    }

    // Calcula la fila donde se pondrán los nombres (según cuántos registros hay)
    $nombres = $fila_nombre + ($filas - 3);

    // Escribe los nombres de quien elaboró y autorizó
    $worksheet->setCellValue("C$nombres", $valores->elaboro);
    $worksheet->setCellValue("I$nombres", $valores->autorizo);
    $worksheet->getStyle("C$nombres")->getAlignment()->setWrapText(true); // Ajuste de texto

    // Calcula la fila donde van los cargos
    $cargos = $fila_cargo + ($filas - 3);

    // Escribe los cargos correspondientes
    $worksheet->setCellValue("C$cargos", $valores->cg_elaboro);
    $worksheet->setCellValue("I$cargos", $valores->cg_autorizo);
    $worksheet->getStyle("C$cargos")->getAlignment()->setWrapText(true);

    // Calcula la fila de la fecha
    $fechas = $fila_fecha + ($filas - 2);
    $worksheet->setCellValue("D$fechas", date('Y-m-d'));
    $worksheet->getStyle("C$fechas")->getAlignment()->setWrapText(true);

    $base = realpath(__DIR__ . '/../../../');


    if ($base !== false) {
        $fecha = date('Ymd_His'); // Genera una marca de tiempo para el nombre del archivo
        $nombre_doc = "FO-DSP-TI-04_Programa de Auditoria de Herramientas de Trabajo Región Sur_{$anio_actual}_{$fecha}.xlsx"; // Nombre del archivo generado
        // Define la ruta física donde se guardará el archivo, basada en la estructura del proyecto
        $ruta_guardar = $base . DIRECTORY_SEPARATOR . 'Inventario_TI' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'controller_excel' . DIRECTORY_SEPARATOR . 'documentos_descarga' . DIRECTORY_SEPARATOR . 'auditoria' . DIRECTORY_SEPARATOR . 'programa' . DIRECTORY_SEPARATOR . $nombre_doc;
        $host = $_SERVER['HTTP_HOST'];
        $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        // Construye la URL de descarga del archivo generado
        $url_descarga = "{$protocolo}://{$host}/Inventario_TI/database/controller_excel/documentos_descarga/auditoria/programa/{$nombre_doc}";
        // Crea y guarda el archivo Excel
        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($ruta_guardar); // Guarda el archivo en la ruta definida

        // Retorna un arreglo con el resultado y la URL para descargar el archivo
        return array(
            'result' => true,
            'url' => $url_descarga,
            // 'duplicados' => $duplicados
        );
    } else {
        return [
            'result' => false,
            'error' => 'No se pudo realizar el programa de auditoria. Inténtalo nuevamente.'
        ];
    }
}

function reporte_auditoria($valores)
{
    include('../conexion.php');

    $tipo = mb_strtolower($valores->elementos->tipo);
    $tipo = str_replace('é', 'e', $tipo);

    if ($tipo === 'telefono celular') {
        // SOLO celular
        $filtro_tipo = "AND ct.tipo LIKE 'telefono celular'";
    } else {
        // OTROS dispositivos (se excluye celular)
        $filtro_tipo = "AND ct.tipo NOT LIKE 'telefono celular'";
    }

    $usuario = $valores->elementos->usuario;
    $anio = $valores->elementos->anio;

    /*  $sql = "SELECT aud.id_equipo AS id, aud.anio, cu.nombre, cu.cargo, cu.region, 
                   ct.tipo, ca.marca, inv.modelo, inv.num_serie
            FROM auditoria AS aud
            INNER JOIN inventario_ti_sur AS inv ON inv.id = aud.id_equipo
            INNER JOIN cat_usuarios AS cu ON cu.id = inv.fk_usuario
            INNER JOIN cat_tipo AS ct ON ct.id = inv.fk_tipo 
            INNER JOIN cat_marca AS ca ON ca.id = inv.fk_marca
            WHERE cu.nombre = '$usuario' AND aud.anio = '$anio'"; */
    $sql = "SELECT
                inv.id AS id,
                aud.anio,
                aud.estado,
                cu.nombre,
                cu.cargo,
                cu.region,
                ct.tipo,
                ca.marca,
                inv.modelo,
                inv.num_serie
            FROM inventario_ti_sur AS inv
            INNER JOIN cat_usuarios AS cu ON cu.id = inv.fk_usuario
            INNER JOIN cat_tipo AS ct ON ct.id = inv.fk_tipo 
            INNER JOIN cat_marca AS ca ON ca.id = inv.fk_marca
            LEFT JOIN auditoria AS aud 
                ON aud.id_equipo = inv.id AND aud.anio = '$anio'
            WHERE cu.nombre = '$usuario' $filtro_tipo";
    // var_dump($sql);
    $query = mysqli_query($con, $sql);
    $datos = [];
    while ($fila = mysqli_fetch_object($query)) {
        $datos[] = $fila;
    }

    /* $telefonos = [];
    $otros = [];
    $tipo = mb_strtolower(trim($equipo->tipo)); */

    $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load('FO-DSP-TI-02 Reporte de auditoria a herramientas TI Rev.00.xlsx');
    $worksheet = $spreadsheet->getActiveSheet();

    // Encabezados
    $worksheet->setCellValue("C8", !empty($usuario) ? $usuario : 'NA');
    $worksheet->setCellValue("G10", !empty($valores->elementos->region) ? $valores->elementos->region : 'NA');
    $worksheet->setCellValue("C10", !empty($valores->area) ? $valores->area : 'NA');
    $worksheet->setCellValue("K10", !empty($valores->ubicacion) ? $valores->ubicacion : 'NA');

    $fila_inicio = 14;
    $total_equipos = count($datos);
    $ids_equipo = [];

    // Proceos de filas y estilos
    foreach ($datos as $index => $equipo) {
        $fila_actual = $fila_inicio + $index;
        // $ids_equipo[] = $equipo->id;

        // Si es el segundo equipo o más, preparamos la fila
        if ($index > 0) {
            $worksheet->insertNewRowBefore($fila_actual, 1);
            // Copiar estilo de la fila base (14) a la nueva fila
            $worksheet->duplicateStyle(
                $worksheet->getStyle("B14:K14"),
                "B{$fila_actual}:K{$fila_actual}"
            );

            // Replicar celdas combinadas
            $worksheet->mergeCells("E{$fila_actual}:F{$fila_actual}"); // Modelo
            $worksheet->mergeCells("G{$fila_actual}:H{$fila_actual}"); // Número de Serie
            $worksheet->mergeCells("J{$fila_actual}:K{$fila_actual}"); // Observaciones
        }

        // Llenado de datos
        $worksheet->setCellValue("B{$fila_actual}", $index + 1);
        $worksheet->setCellValue("C{$fila_actual}", $equipo->tipo);
        $worksheet->setCellValue("D{$fila_actual}", $equipo->marca);
        $worksheet->setCellValue("E{$fila_actual}", $equipo->modelo);
        $worksheet->setCellValue("G{$fila_actual}", $equipo->num_serie);

        // Centrar contenido en las celdas combinadas
        $worksheet->getStyle("B{$fila_actual}:K{$fila_actual}")->getAlignment()->setVertical('center');
    }

    // 3. FIRMAS (Cálculo dinámico basado en las filas nuevas)
    $desplazamiento = ($total_equipos > 1) ? ($total_equipos - 1) : 0;
    $fila_nombres = 26 + $desplazamiento;
    $fila_cargos = 27 + $desplazamiento;

    $worksheet->setCellValue("C{$fila_nombres}", !empty($valores->encargado) ? $valores->encargado : '');
    $worksheet->setCellValue("C{$fila_cargos}", !empty($valores->cargo) ? $valores->cargo : '');
    $worksheet->setCellValue("H{$fila_nombres}", $usuario);
    $worksheet->setCellValue("H" . ($fila_nombres + 1), !empty($valores->elementos->cargo) ? $valores->elementos->cargo : '');

    $nombre_doc = "FO-DSP-TI-06 Reporte de auditoria a herramientas TI Rev.00_" . date('Ymd_His') . ".xlsx";
    $base = realpath(__DIR__ . '/../../../');
    $ruta_guardar = $base . DIRECTORY_SEPARATOR . 'Inventario_TI/database/controller_excel/documentos_descarga/auditoria/reporte/' . $nombre_doc;

    $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
    $writer->save($ruta_guardar);

    $id_equipo = $valores->elementos->id;

    $sql = "UPDATE auditoria 
        SET reporte_descargado = 1,
            estado = 'En proceso'
        WHERE id_equipo = '$id_equipo'
        AND anio = '$anio'";

    if (!mysqli_query($con, $sql)) {
        return false;
    }
    /* if (!empty($ids_equipo)) {
        $ids = implode(',', $ids_equipo);
        mysqli_query($con, "UPDATE auditoria SET reporte_descargado = 1, estado = 'En proceso' WHERE id_equipo IN ($ids) AND anio = '$anio'");
    } */

    return [
        'result' => true,
        'url' => "http://" . $_SERVER['HTTP_HOST'] . "/Inventario_TI/database/controller_excel/documentos_descarga/auditoria/reporte/" . $nombre_doc,
        'id' => $id_equipo
    ];
}
