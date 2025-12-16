<?php
//TODO Consultas a la bd realizadas en la pestaña de mantenimiento

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

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
    $respuesta_servidor->resultado = guardar_programa($clientejson);
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


            $añoMantenimiento = $fechaMantenimiento[0];
            $sql = "UPDATE mantenimiento SET reporte_subido = 1, estado = 'Realizado' WHERE id_equipo = '$valores->id_equipo' AND anio = '$añoMantenimiento'";
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

/* function guardar_programa($valores)
{

    $respuesta = new stdClass();

    if (isset($_FILES['reporte_programa']) && $_FILES['reporte_programa']['error'] === UPLOAD_ERR_OK) {
        $nombreOriginal = $_FILES['reporte_programa']['name'];
        $tmpPath = $_FILES['reporte_programa']['tmp_name'];

        // Validar extensión .xlsx
        $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
        if ($ext !== 'pdf') {
            $respuesta->error = "Tipo de archivo no permitido. Solo .pdf";
            return $respuesta;
        }

        $base = realpath(__DIR__ . '/../../../documentos/mantenimiento/programa');

        if ($base == false) {
            return [
                'result' => false,
                'error' => 'No se encontro la ruta. Intentálo nuevamente.'
            ];
        }

        $carpeta_anual = $base . DIRECTORY_SEPARATOR . $valores->anio;

        if (!is_dir($carpeta_anual)) {
            mkdir($carpeta_anual, 0777, true);
        }

        $i = 1;
        do {
            $nombre_final = $carpeta_anual . DIRECTORY_SEPARATOR . "{$i}.pdf";
            $i++;
        } while (file_exists($nombre_final));

        //* Generar nombre único para evitar colisiones
        // $nuevoNombre = date('Ymd_His') . '_' . $nombreOriginal;

        //* Ruta de la carpeta
        // $ruta = __DIR__ . '/../../documentos/mantenimiento/' . $valores->usuario;

        //* Validando si el usuario ya tiene su carpeta o no
        // if (is_dir($ruta)) {
        //     //* Ruta destino, __DIR__ es carpeta donde está este script PHP
        //     $destino = $ruta . '/' . $nuevoNombre;
        // } else {
        //     //* Creación de la carpeta
        //     mkdir($ruta, 0777, true);

        //     //* Ruta destino
        //     $destino = $ruta . '/' . $nuevoNombre;
        // }

        if (move_uploaded_file($tmpPath, $nombre_final)) {
            $respuesta->mensaje = "Archivo guardado correctamente";
            //$respuesta->ruta = 'C:\\xampp\\htdocs\\Inventario_TI\\database\\controller_inventario\\' . $nuevoNombre;
        } else {
            $respuesta->error = "No se pudo mover el archivo.";
        }
    } else {
        $respuesta->error = "No se recibió ningún archivo válido.";
    }
    return $respuesta;
} */

function guardar_programa($valores)
{
    $respuesta = new stdClass();

    // Validar existencia del archivo
    if (!isset($_FILES['reporte_programa']) || $_FILES['reporte_programa']['error'] !== UPLOAD_ERR_OK) {
        $respuesta->error = "No se recibió ningún archivo válido.";
        return $respuesta;
    }

    $archivo = $_FILES['reporte_programa'];
    $nombreOriginal = $archivo['name'];
    $tmpPath = $archivo['tmp_name'];

    $nombreSinExtension = pathinfo($nombreOriginal, PATHINFO_FILENAME);
    $extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));

    $nombreLimpio = preg_replace('/[^A-Za-z0-9_-]/', '_', $nombreSinExtension);


    // Validar extensión PDF
    $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
    if ($ext !== 'pdf') {
        $respuesta->error = "Tipo de archivo no permitido. Solo .pdf.";
        return $respuesta;
    }

    // Ruta base donde se guardan los programas
    $base = realpath(__DIR__ . '/../../documentos/mantenimiento/programa');
    if ($base === false) {
        $respuesta->error = "No se encontró la ruta base.";
        return $respuesta;
    }

    // Carpeta por año
    $carpeta_anual = $base . DIRECTORY_SEPARATOR . $valores->anio;

    // Crear carpeta si no existe
    if (!is_dir($carpeta_anual)) {
        if (!mkdir($carpeta_anual, 0755, true)) {
            $respuesta->error = "No se pudo crear la carpeta del año.";
            return $respuesta;
        }
    }

    // Buscar nombre disponible (1.pdf, 2.pdf, 3.pdf...)
    $i = 1;
    do {
         $nombre_final = $carpeta_anual . DIRECTORY_SEPARATOR . $i . '-' . $nombreLimpio . '.' . $extension;
        $i++;
    } while (file_exists($nombre_final));

    // Guardar archivo
    if (move_uploaded_file($tmpPath, $nombre_final)) {
        $respuesta->mensaje = "Archivo guardado correctamente";
        $respuesta->ruta_guardada = $nombre_final;
    } else {
        $respuesta->error = "No se pudo mover el archivo al destino.";
    }

    return $respuesta;
}
