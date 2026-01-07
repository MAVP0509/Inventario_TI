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
    $respuesta_servidor->resultado = guardar_reportes($clientejson);
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = unir_reportes_auditoria($clientejson);
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

function unir_reportes_auditoria($valores) {}
