<?php
header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

require __DIR__ . '/../../vendor/autoload.php';

use Ilovepdf\Ilovepdf;

//TODO Para unir los pdf (9) tarda unos minitos, es necesario aumentar el tiempo
set_time_limit(300);
ini_set('max_execution_time', 300);

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_auditoria($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = consultar_anio_auditoria();
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = guardar_programa_auditoria($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = consultar_auditoria_firmada($clientejson);
} elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = guardar_reportes_auditoria($clientejson);
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = validar_reporte_año($clientejson);
} elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = consultar_reporte_auditoria($clientejson);
} elseif ($clientejson->accion == 7) {
    $respuesta_servidor->resultado = unir_reportes_auditoria($clientejson);
}

print(json_encode($respuesta_servidor));

//*Función para consultar las auditorías
function consultar_auditoria($valores)
{
    include("../conexion.php");

    $region = $valores->region ?? null;
    $anio   = $valores->anio ?? null;

    if (!$anio) {
        return [];
    }

    if (empty($region)) {
        // Si no viene región → es admin
        $sql = "SELECT * 
                FROM vauditoria 
                WHERE anio = '$anio' 
                ORDER BY fecha ASC";
    } else {
        // Si viene región → es usuario normal
        $sql = "SELECT * 
                FROM vauditoria 
                WHERE anio = '$anio' 
                AND zona LIKE '%$region%' 
                ORDER BY fecha ASC";
    }

    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_object($query)) {
        $datos[] = $fila;
    }

    return $datos;
}

//*Función para consultar el último año de auditoría programado
function consultar_anio_auditoria()
{
    include("../conexion.php");

    $sql = "SELECT MAX(anio) AS anio FROM auditoria";
    //$sql = "SELECT * FROM auditoria";
    $query = mysqli_query($con, $sql);

    $fila = mysqli_fetch_object($query);

    return $fila;
}

//*Función para guardar el programa de auditoría firmado
function guardar_programa_auditoria($valores)
{
    $respuesta = new stdClass();

    // Validar archivo
    if (
        !isset($_FILES['reporte_pauditoria']) ||
        $_FILES['reporte_pauditoria']['error'] !== UPLOAD_ERR_OK
    ) {
        $respuesta->error = "No se recibió ningún archivo válido.";
        return $respuesta;
    }

    $archivo = $_FILES['reporte_pauditoria'];

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
    $base = realpath(__DIR__ . '/../../documentos/auditoria/programa');
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

//*Función para consultar el programa de auditoría subido
function consultar_auditoria_firmada($valores)
{
    $base = realpath(__DIR__ . '/../../documentos/auditoria/programa');

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

        $url = "{$protocolo}://{$host}/Inventario_TI/documentos/auditoria/programa/{$valores->anio}/{$archivo}";

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

//*Función para guardar reportes de auditoría
function guardar_reportes_auditoria($valores)
{
    include("../conexion.php");

    $respuesta = new stdClass();
    //var_dump($_FILES['reporte_Auditoria']);

    $validacion = validar_reporte_año($valores);
    if ($validacion && isset($validacion->resultado)) {
        unlink($validacion->resultado);
    }


    if (isset($_FILES['reporte_aud']) && $_FILES['reporte_aud']['error'] === UPLOAD_ERR_OK) {
        $nombreOriginal = $_FILES['reporte_aud']['name'];
        $tmpPath = $_FILES['reporte_aud']['tmp_name'];

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

        $fechaAuditoria = explode('-', $valores->fecha_aud);
        //var_dump($nuevoNombre);


        //* Ruta de la carpeta
        $rutaAnio =  __DIR__ . '/../../Documentos/auditoria/reporte/' . $fechaAuditoria[0];
        $rutaMes =  __DIR__ . '/../../Documentos/auditoria/reporte/' . $fechaAuditoria[0] . '/' . $fechaAuditoria[1];
        //$ruta = __DIR__ . '/../../Documentos/Auditoria/reporte/'. $fechaAuditoria[0].'/'. $fechaAuditoria[1].'/'. $valores->id_equipo;

        //* Validando si el año de Auditoria ya tiene su carpeta o no
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


            $añoAuditoria = $fechaAuditoria[0];
            $sql = "UPDATE auditoria SET reporte_subido = 1, estado = 'Realizado' WHERE id_equipo = '$valores->id_equipo' AND anio = '$añoAuditoria'";
            if (!mysqli_query($con, $sql)) {
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

//*Función para validar reporte subido de un equipo 
function validar_reporte_año($valores)
{
    $respuesta = new stdClass();
    //var_dump($valores);
    $fecha = explode('-', $valores->fecha_aud);
    $año = $fecha[0];
    $mes = $fecha[1];

    //*ruta física del servidor
    $carpeta = __DIR__ . '/../../documentos/auditoria/reporte/' . $año . '/' . $mes;

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

//*Función para consultar reporte de auditoria
function consultar_reporte_auditoria($valores)
{
    $respuesta = new stdClass();

    $fecha = explode('-', $valores->fecha_aud);
    $año = $fecha[0];
    $mes = $fecha[1];

    $carpeta = __DIR__ . '/../../documentos/auditoria/reporte/' . $año . '/' . $mes;
    $carpetaUrl = '/Inventario_TI/documentos/auditoria/reporte/' . $año . '/' . $mes;

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

//*Función para unir reportes de auditoría de un mes
function unir_reportes_auditoria($valores)
{
    $respuesta = new stdClass();

    // $base = realpath(__DIR__ . );

    $carpeta_reporte = __DIR__ . '/../../documentos/auditoria/reporte/' . $valores->anio . '/reportes_unidos';
    $archivo_final = $carpeta_reporte . '/Reporte_' . $valores->anio . '_' . $valores->mes . '.pdf';
    $url_descarga = '/Inventario_TI/documentos/auditoria/reporte/' . $valores->anio . '/reportes_unidos/Reporte_' . $valores->anio . '_' . $valores->mes . '.pdf';

    try {
        $ilovepdf = new Ilovepdf(
            'project_public_ecd8df30001f3773a605a14a2c0416c9_I--AV17bdca45d44f5b70e44a9960a810a1ab',
            'secret_key_181ece80f4c57be30267facf2f3890af_TcklQ6a753e75d95f5b32aef79aac42c0d33c',
            [
                'timeout' => 300,
                'connect_timeout' => 60
            ]
        );

        $myTaksMerge = $ilovepdf->newTask('merge');

        $carpeta = __DIR__ . '/../../documentos/auditoria/reporte/' . $valores->anio . '/' . $valores->mes;

        if (!is_dir($carpeta)) {
            $respuesta->error = "No se encontró la ruta";
            return $respuesta;
        }

        $archivos = array_diff(scandir($carpeta), ['.', '..']);

        $ruta = [];

        foreach ($archivos as $archivo) {
            $ruta_completa = $carpeta . '/' . $archivo;

            if (is_file($ruta_completa) && strtolower(pathinfo($archivo, PATHINFO_EXTENSION)) === 'pdf') {
                $ruta[] = $ruta_completa;
            }
        }

        if (empty($ruta)) {
            $respuesta->error = "No se encontraron los archivos";
            return $respuesta;
        }

        foreach ($ruta as $archivo) {
            $myTaksMerge->addFile($archivo);
        }

        if (!is_dir($carpeta_reporte)) {
            mkdir($carpeta_reporte, 0777, true);
        }

        $myTaksMerge->execute();
        $myTaksMerge->download($carpeta_reporte);

        $archivo_descargado = $carpeta_reporte . '/merged.pdf';
        $nuevo_nombre = $archivo_final;

        if (file_exists($archivo_descargado)) {
            if (rename($archivo_descargado, $nuevo_nombre)) {
                $respuesta->mensaje = "Archivos unidos correctamente";
            } else {
                $respuesta->error = "Error al renombrar el archivo";
                return $respuesta;
            }
        } else {
            $respuesta->error = "El archivo original no existe";
            return $respuesta;
        }
        $respuesta->ruta = $url_descarga;
    } catch (\Ilovepdf\Exceptions\AuthException $e) {
        $respuesta->error = "Error de autenticación Ilovepdf: " . $e->getMessage();
    } catch (\Ilovepdf\Exceptions\TaskException $e) {
        $respuesta->error = "Error en la tarea Ilovepdf: " . $e->getMessage();
    } catch (\Exception $e) {
        $respuesta->error = "Error general: " . $e->getMessage();
    }

    return $respuesta;
}
