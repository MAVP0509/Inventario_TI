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
    $respuesta_servidor->resultado = consultar_orden($clientejson);
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
    $respuesta = new stdClass();
    //var_dump($_FILES['reporte_mantenimiento']);
    if (isset($_FILES['reporte_mantenimiento']) && $_FILES['reporte_mantenimiento']['error'] === UPLOAD_ERR_OK) {
        $nombreOriginal = $_FILES['reporte_mantenimiento']['name'];
        $tmpPath = $_FILES['reporte_mantenimiento']['tmp_name'];

        // Validar extensión .xlsx
        $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
        if ($ext !== 'pdf') {
            $respuesta->error = "Tipo de archivo no permitido. Solo .pdf";
            return $respuesta;
        }

        //* Generar nombre único para evitar colisiones
        $nuevoNombre = date('Y-m-d') . '_' . $nombreOriginal;


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
            $respuesta->mensaje = "Archivo guardado correctamente";
            //$respuesta->ruta = 'C:\\xampp\\htdocs\\Inventario_TI\\database\\controller_inventario\\' . $nuevoNombre;
        } else {
            $respuesta->error = "No se pudo mover el archivo.";
        }
    } else {
        $respuesta->error = "No se recibió ningún archivo válido.";
    }
    return $respuesta;
}
