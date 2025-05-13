<?php

header('Content_Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_historico($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = registrar_historico($clientejson);
}

print(json_encode($respuesta_servidor));

function registrar_historico($valores)
{
    include("../conexion.php");

    $fecha_evento = date("Y:m:d H:i:s");

    if (is_array($valores->num_serie)) {
        foreach ($valores->num_serie as $num_serie) {
            $sql = "INSERT INTO historico(fecha_evento, usuario, evento, num_serie) VALUES ('$fecha_evento', '$valores->usuario', '$valores->evento', '$num_serie')";
            mysqli_query($con, $sql);
        }
        return true;
    } else {
        $sql = "INSERT INTO historico(fecha_evento, usuario, evento, num_serie) VALUES ('$fecha_evento', '$valores->usuario', '$valores->evento', '$valores->num_serie')";
        $query = mysqli_query($con, $sql);
        //var_dump($query);
        return $query;
    }
}


function consultar_historico()
{
    include("../conexion.php");

    // $sql = "SELECT * FROM historico ORDER BY fecha_evento DESC";
    $sql = "SELECT
            hst.id,
            hst.fecha_evento,
            ITS.zona,
            CT.tipo,
            hst.evento,
            hst.usuario,
            hst.num_serie
            FROM
                historico AS hst
                INNER JOIN inventario_ti_sur AS ITS ON hst.num_serie = ITS.num_serie
                INNER JOIN cat_tipo AS CT ON CT.id = ITS.fk_tipo";
    /*  WHERE 
                hst.num_serie = ITS.num_serie"; */

    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = $fila;
    }

    return $datos;
}
