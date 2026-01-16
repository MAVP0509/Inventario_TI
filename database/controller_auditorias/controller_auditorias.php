<?php
header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_auditoria($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = consultar_anio_auditoria();
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = validar_reporte_mismo_año($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = consultar_auditoria_firmada($clientejson);
} elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = guardar_reportes_auditoria($clientejson);
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = validar_reporte_año($clientejson);
} elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = guardar_programa_auditoria($clientejson);
} elseif ($clientejson->accion == 7) {
    $respuesta_servidor->resultado = consultar_reporte($clientejson);
}

print(json_encode($respuesta_servidor));

function consultar_auditoria($valores)
{
    include("../conexion.php");

    $sql = "SELECT * FROM vauditoria WHERE anio = '$valores->anio' ORDER BY fecha ASC";
    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_object($query)) {
        $datos[] = $fila;
    }

    return $datos;
}

function consultar_anio_auditoria()
{
    include("../conexion.php");

    $sql = "SELECT MAX(anio) AS anio FROM auditoria";
    //$sql = "SELECT * FROM auditoria";
    $query = mysqli_query($con, $sql);

    $fila = mysqli_fetch_object($query);

    return $fila;
}

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

function unir_reportes_auditoria($valores) {}
