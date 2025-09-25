<?php
header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_orden_tipos($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = nuevo_orden_tipo($clientejson);
}

print(json_encode($respuesta_servidor));

function consultar_orden_tipos($valores)
{
    include("../conexion.php");

    $sql = "SELECT * FROM vorden_mantenimiento";
    $query = mysqli_query($con, $sql);

    $datos = array();

    while ($fila = mysqli_fetch_object($query)) {
        array_push($datos, $fila);
    }

    return $datos;
}

function nuevo_orden_tipo($valores)
{
    include("../conexion.php");
    $sql_val = "SELECT tipo_activo FROM orden_mantenimiento WHERE tipo_activo = '$valores->dispositivo'";
    $query_val = mysqli_query($con, $sql_val);

    if ($query_val->num_rows > 0) {
        return false;
    } else {
        $sql = "INSERT INTO orden_mantenimiento ( id_orden, tipo_activo, orden ) SELECT
                1 AS id_orden,
                '$valores->dispositivo' AS tipo_activo,
            COALESCE ( MAX( orden ), 0 ) + 1 
            FROM
                orden_mantenimiento";

        $query = mysqli_query($con, $sql);
        return $query;
    }
}
