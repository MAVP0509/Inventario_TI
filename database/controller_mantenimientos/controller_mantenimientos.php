<?php
//TODO Consultas a la bd realizadas en la pestaña de mantenimiento

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

//require_once('vendor/autoload.php');
require __DIR__ . '/../../vendor/autoload.php';

use Ilovepdf\Ilovepdf;

//*La funcion de unir pdfs puede tardar mas de dos minutos, es necesario aumentar ese tiempo
set_time_limit(300);
ini_set('max_execution_time', 300);




$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_datos($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = guardar_reportes($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = validar_reporte_mismo_año($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = consultar_reporte($clientejson);
} elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = consultar_anio_mantenimiento($clientejson);
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = unir_reportes_mantenimiento($clientejson);
} elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = guardar_programa($clientejson);
} elseif ($clientejson->accion == 7) {
    $respuesta_servidor->resultado = consultar_programa_firmado($clientejson);
}

print(json_encode($respuesta_servidor));


function consultar_datos($valores)
{
    include("../conexion.php");


    $sql = "SELECT * FROM vmantenimiento WHERE anio = '$valores->anio' ORDER BY fecha ASC";
    $query = mysqli_query($con, $sql);


    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);  //* Se guardan los registros en un array
    }

    return $array;
}

function consultar_orden()
{
    include("../conexion.php");

    $sql = "SELECT * FROM vorden_tipos ORDER BY FIELD(tipo_id, 40, 41, 58, 55, 22, 23, 25, 1, 2, 78, 79, 80, 81, 82, 73, 74, 75, 76, 46, 51)";
    $query = mysqli_query($con, $sql);

    $datos = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($datos, $fila);
    }

    return $datos;
}

function guardar_reportes($valores)
{
    include("../conexion.php");

    $respuesta = new stdClass();
    //var_dump($_FILES['reporte_mantenimiento']);

    $validacion = validar_reporte_mismo_año($valores);
    if ($validacion && isset($validacion->resultado)) {
        unlink($validacion->resultado);
    }

    if (isset($_FILES['reporte_mantenimiento']) && $_FILES['reporte_mantenimiento']['error'] === UPLOAD_ERR_OK) {
        $nombreOriginal = $_FILES['reporte_mantenimiento']['name'];
        $tmpPath = $_FILES['reporte_mantenimiento']['tmp_name'];

        // Validar extensión .xlsx
        $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
        if ($ext !== 'pdf') {
            $respuesta->error = "Tipo de archivo no permitido. Solo .pdf";
            return $respuesta;
        }
        $nombreOriginalArreglado = explode(' ', $nombreOriginal);
        $nombreOriginalArreglado = join('_', $nombreOriginalArreglado);
        //* Generar nombre único para evitar colisiones
        $nuevoNombre = $valores->id_equipo . '-' . $nombreOriginalArreglado;

        $fechaMantenimiento = explode('-', $valores->fecha_mnto);
        //var_dump($nuevoNombre);


        //* Ruta de la carpeta
        $rutaAnio =  __DIR__ . '/../../Documentos/mantenimiento/reporte/' . $fechaMantenimiento[0];
        $rutaMes =  __DIR__ . '/../../Documentos/mantenimiento/reporte/' . $fechaMantenimiento[0] . '/' . $fechaMantenimiento[1];
        //$ruta = __DIR__ . '/../../Documentos/mantenimiento/reporte/'. $fechaMantenimiento[0].'/'. $fechaMantenimiento[1].'/'. $valores->id_equipo;

        //* Validando si el año de mantenimiento ya tiene su carpeta o no
        if (is_dir($rutaAnio)) {
            //* Validando si el mes ya tiene su carpeta
            if (is_dir($rutaMes)) {
                $destino = $rutaMes . '/' . $nuevoNombre;
            } else {
                //*Se crea la carpeta del mes
                mkdir($rutaMes, 0777, true);
                $destino = $rutaMes . '/' . $nuevoNombre;
            }
        } else {
            //* Creación de la carpeta del año
            mkdir($rutaAnio, 0777, true);
            //*Se crea la carpeta del mes
            mkdir($rutaMes, 0777, true);

            //* Ruta destino
            $destino = $rutaMes . '/' . $nuevoNombre;
        }

        if (move_uploaded_file($tmpPath, $destino)) {
            $sql = "UPDATE mantenimiento AS m 
                        INNER JOIN inventario_ti_sur AS i ON i.id = m.id_equipo
                        INNER JOIN cat_usuarios AS u ON u.id = i.fk_usuario 
                    SET m.reporte_subido = 1, m.estado = 'Realizado' 
                    WHERE u.nombre = '$valores->usuario' AND m.anio = '$valores->anio'";
            $query  = mysqli_query($con, $sql);
            if (!$query) {
                return $respuesta->error = "No se pudo registrar en la base datos, favor de avisar a TI";
            }
            $respuesta->mensaje = "Archivo guardado correctamente";
        } else {
            $respuesta->error = "No se pudo mover el archivo.";
        }
    } else {
        $respuesta->error = "No se recibió ningún archivo válido.";
    }
    return $respuesta;
}

function validar_reporte_mismo_año($valores)
{
    $respuesta = new stdClass();
    //var_dump($valores);
    $fecha = explode('-', $valores->fecha_mnto);
    $año = $fecha[0];
    $mes = $fecha[1];

    //*ruta física del servidor
    $carpeta = __DIR__ . '/../../documentos/mantenimiento/reporte/' . $año . '/' . $mes;

    //* Verifica si existe la carpeta
    if (is_dir($carpeta)) {

        //* Escanea los archivos, los guarda en un array ignorando sus extensiones
        $archivos = array_diff(scandir($carpeta), ['.', '..']);

        //*Arma un array de enlaces para acceder al documento 
        foreach ($archivos as $archivo) {
            $partes = explode('-', $archivo);

            $idEquipo = $partes[0];

            if ($idEquipo === $valores->id_equipo) {
                $respuesta->resultado = $carpeta . '/' . $archivo;
                return $respuesta;
            }
        }
    }
    return false;
}

function consultar_reporte($valores)
{
    $respuesta = new stdClass();

    $fecha = explode('-', $valores->fecha_mnto);
    $año = $fecha[0];
    $mes = $fecha[1];

    $carpeta = __DIR__ . '/../../documentos/mantenimiento/reporte/' . $año . '/' . $mes;
    $carpetaUrl = '/Inventario_TI/documentos/mantenimiento/reporte/' . $año . '/' . $mes;

    if (is_dir($carpeta)) {
        $archivos = array_diff(scandir($carpeta), ['.', '..']);

        foreach ($archivos as $archivo) {
            $partes = explode('-', $archivo);
            $idEquipo = $partes[0];

            if ($idEquipo === $valores->id_equipo) {
                $respuesta->documento = $carpetaUrl . '/' . $archivo;
                //var_dump($archivo);
                return $respuesta;
            }
        }
    } else {
        $respuesta->aviso = "El activo no tiene reporte subido";
    }

    return $respuesta;
}

function guardar_programa($valores)
{
    $respuesta = new stdClass();

    // Validar archivo
    if (
        !isset($_FILES['reporte_programa']) ||
        $_FILES['reporte_programa']['error'] !== UPLOAD_ERR_OK
    ) {
        $respuesta->error = "No se recibió ningún archivo válido.";
        return $respuesta;
    }

    $archivo = $_FILES['reporte_programa'];

    $nombreOriginal = pathinfo($archivo['name'], PATHINFO_FILENAME);
    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    $tmpPath = $archivo['tmp_name'];

    if ($extension !== 'pdf') {
        $respuesta->error = "Tipo de archivo no permitido. Solo PDF.";
        return $respuesta;
    }

    // Limpiar nombre (mantiene el nombre original)
    $nombreLimpio = preg_replace('/[^A-Za-z0-9._-]/', '_', $nombreOriginal);

    // Ruta base
    $base = realpath(__DIR__ . '/../../documentos/mantenimiento/programa');
    if ($base === false) {
        $respuesta->error = "No se encontró la ruta base.";
        return $respuesta;
    }

    // Carpeta por año
    $carpeta_anual = $base . DIRECTORY_SEPARATOR . $valores->anio;

    if (!is_dir($carpeta_anual)) {
        if (!mkdir($carpeta_anual, 0755, true)) {
            $respuesta->error = "No se pudo crear la carpeta del año.";
            return $respuesta;
        }
    }

    // Eliminar PDF existente
    foreach (glob($carpeta_anual . DIRECTORY_SEPARATOR . '*.pdf') as $pdfExistente) {
        unlink($pdfExistente);
    }

    // Nombre siempre con fecha actual
    $fecha = date('Ymd');
    $archivo_final = $carpeta_anual
        . DIRECTORY_SEPARATOR
        . $nombreLimpio . '_' . $fecha . '.pdf';

    // Guardar archivo
    if (move_uploaded_file($tmpPath, $archivo_final)) {
        $respuesta->mensaje = "Archivo guardado correctamente.";
        $respuesta->ruta_guardada = basename($archivo_final);
        $respuesta->fecha_subida = $fecha;
    } else {
        $respuesta->error = "No se pudo guardar el archivo.";
    }

    return $respuesta;
}

function consultar_programa_firmado($valores)
{
    $base = realpath(__DIR__ . '/../../documentos/mantenimiento/programa');

    if ($base === false) {
        return [
            "existe" => false
        ];
    }

    $carpeta = $base . DIRECTORY_SEPARATOR . $valores->anio;

    if (!is_dir($carpeta)) {
        return [
            "existe" => false
        ];
    }

    $archivos = glob($carpeta . DIRECTORY_SEPARATOR . '*.pdf');

    if (!empty($archivos)) {

        $archivo = basename($archivos[0]);

        $host = $_SERVER['HTTP_HOST'];
        $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';

        $url = "{$protocolo}://{$host}/Inventario_TI/documentos/mantenimiento/programa/{$valores->anio}/{$archivo}";

        return [
            "existe" => true,
            "archivo" => $archivo,
            "url" => $url
        ];
    }

    return [
        "existe" => false
    ];
}

function consultar_anio_mantenimiento()
{
    include("../conexion.php");

    $sql = "SELECT MAX(anio) AS anio FROM mantenimiento";
    //$sql = "SELECT * FROM mantenimiento";
    $query = mysqli_query($con, $sql);

    $fila = mysqli_fetch_object($query);

    return $fila;
}

function unir_reportes_mantenimiento($valores)
{
    $respuesta = new stdClass();

    $carpeta_reporte =  __DIR__ . '/../../documentos/mantenimiento/reporte/' . $valores->anio . '/reportes_unidos';
    $archivoFinal = $carpeta_reporte . '/Reporte_' . $valores->anio . '_' . $valores->mes . '.pdf';
    $carpetaUrl = '/Inventario_TI/documentos/mantenimiento/reporte/' . $valores->anio . '/reportes_unidos/Reporte_' . $valores->anio . '_' . $valores->mes . '.pdf';

    //$carpetaArchivoUnido = __DIR__ . '/../../documentos/mantenimiento/reporte/' . $valores->anio . '/reportes_unidos/Reporte_' . $valores->anio . '_' . $valores->mes . '.pdf';

    /* if (file_exists($archivoFinal)) {
        $respuesta->mensaje = "Archivos unidos correctamente";
        $respuesta->ruta = $carpetaUrl;

        return $respuesta;
    } */
    //var_dump("hola");

    try {
        $ilovepdf = new Ilovepdf(
            'project_public_ecd8df30001f3773a605a14a2c0416c9_I--AV17bdca45d44f5b70e44a9960a810a1ab',
            'secret_key_181ece80f4c57be30267facf2f3890af_TcklQ6a753e75d95f5b32aef79aac42c0d33c',
            [
                'timeout' => 300,
                'connect_timeout' => 60
            ]
        );
        // Create a new task
        $myTaskMerge = $ilovepdf->newTask('merge');
        // Add files to task for upload

        $carpeta = __DIR__ . '/../../documentos/mantenimiento/reporte/' . $valores->anio . '/' . $valores->mes;

        //var_dump($carpeta);
        if (!is_dir($carpeta)) {
            $respuesta->error = "No se pudo encontrar la ruta";
            return $respuesta;
        }

        $archivos = array_diff(scandir($carpeta), ['.', '..']);

        $ruta = [];

        foreach ($archivos as $archivo) {

            $rutaCompleta = $carpeta . '/' . $archivo;

            if (is_file($rutaCompleta) && strtolower(pathinfo($archivo, PATHINFO_EXTENSION)) === 'pdf') {  //  ignora carpetas
                $ruta[] = $rutaCompleta;
            }
        }
        //var_dump($ruta);

        if (empty($ruta)) {
            $respuesta->error = "No se pudo encontrar los archivos";
            return $respuesta;
        }


        foreach ($ruta as $archivo) {
            $myTaskMerge->addFile($archivo);
        }


        // Crear carpeta antes de descargar
        if (!is_dir($carpeta_reporte)) {
            mkdir($carpeta_reporte, 0777, true);
        }

        // Execute the task
        $myTaskMerge->execute();

        //$myTaskMerge->setOutputFileName('Reporte_' . $valores->anio . '_' . $valores->mes);

        // Download the package files
        $myTaskMerge->download($carpeta_reporte);

        //*Renombrando el pdf generado
        $archivoDescargado = $carpeta_reporte . '/merged.pdf';

        $nuevoNombre = $archivoFinal;

        if (file_exists($archivoDescargado)) {
            if (rename($archivoDescargado, $nuevoNombre)) {
                $respuesta->mensaje = "Archivos unidos correctamente";
                //$respuesta->error = "Archivo renombrado correctamente a $nuevoNombre";
            } else {
                $respuesta->error =  "Error al renombrar el archivo";
                return $respuesta;
            }
        } else {
            $respuesta->error =  "El archivo original no existe";
            return $respuesta;
        }

        //$respuesta->mensaje = "Archivos unidos correctamente";

        $respuesta->ruta = $carpetaUrl;
    } catch (\Ilovepdf\Exceptions\AuthException $e) {
        $respuesta->error = "Error de autenticación Ilovepdf: " . $e->getMessage();
    } catch (\Ilovepdf\Exceptions\TaskException $e) {
        $respuesta->error = "Error en la tarea Ilovepdf: " . $e->getMessage();
    } catch (\Exception $e) {
        $respuesta->error = "Error general: " . $e->getMessage();
    }

    return $respuesta;
}
