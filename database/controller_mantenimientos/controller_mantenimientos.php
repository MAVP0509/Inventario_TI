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
}

print(json_encode($respuesta_servidor));


function consultar_datos()
{
    include("../conexion.php");


    $sql = "SELECT * FROM vmantenimiento ORDER BY fecha ASC";
    $query = mysqli_query($con, $sql);


    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);  //* Se guardan los registros en un array
    }

    return $array;
}

function consultar_orden() {
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
        $nuevoNombre = $valores->fecha_mnto . '_' . $nombreOriginalArreglado;

        //var_dump($nuevoNombre);


        //* Ruta de la carpeta
        $ruta = __DIR__ . '/../../Documentos/mantenimiento/reporte/' . $valores->id_equipo;

        //* Validando si el usuario ya tiene su carpeta o no
        if (is_dir($ruta)) {
            //* Ruta destino, __DIR__ es carpeta donde está este script PHP
            $destino = $ruta . '/' . $nuevoNombre;
        } else {
            //* Creación de la carpeta
            mkdir($ruta, 0777, true);

            //* Ruta destino
            $destino = $ruta . '/' . $nuevoNombre;
        }

        if (move_uploaded_file($tmpPath, $destino)) {
            
            $añoMantenimiento = explode('-', $valores->fecha_mnto);
            $añoMantenimiento = $añoMantenimiento[0];
            $sql = "UPDATE mantenimiento SET reporte_subido = 1, estado = 'Realizado' WHERE id_equipo = '$valores->id_equipo' AND anio = '$añoMantenimiento'";
            if(!mysqli_query($con,$sql)){
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
    $añoActual = explode('-', $valores->fecha_mnto);
    $añoActual = $añoActual[0];

    //*ruta física del servidor
    $carpeta = __DIR__ . '/../../documentos/mantenimiento/reporte/' . $valores->id_equipo;

    //* Verifica si existe la carpeta
    if (is_dir($carpeta)) {

        //* Escanea los archivos, los guarda en un array ignorando sus extensiones
        $archivos = array_diff(scandir($carpeta), ['.', '..']);

        //*Arma un array de enlaces para acceder al documento 
        foreach ($archivos as $archivo) {
            $partes = explode('-', $archivo);

            $añoArchivo = $partes[0];

            if ($añoArchivo === $añoActual) {
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
    $año = explode('-', $valores->fecha_mnto);

    $añoConsulta = $año[0];

    $carpeta = __DIR__ . '/../../documentos/mantenimiento/reporte/' . $valores->id_equipo;

    $carpetaUrl = '/Inventario_TI/documentos/mantenimiento/reporte/' . $valores->id_equipo;

    if (is_dir($carpeta)) {
        $archivos = array_diff(scandir($carpeta), ['.', '..']);

        foreach ($archivos as $archivo) {
            $partes = explode('_', $archivo);
            $fechaArchivo = $partes[0];

            $añoArchivo = substr($fechaArchivo, 0, 4);

            if ($añoArchivo === $añoConsulta) {
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
