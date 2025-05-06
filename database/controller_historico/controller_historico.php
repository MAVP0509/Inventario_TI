<?php

header('Content_Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = registrar_historico($clientejson);
} elseif ($clientejson->accion == 1){
    $respuesta_servidor->resultado = consultar_historico($clientejson);
}

function registrar_historico($valores){
    include("../conexion.php");

    $fecha = date("Y:m:d H:i:s");
    $sql = "INSERT INTO historico(fecha_evento, usuario, accion, num_serie, tipo) VALUES ('$fecha', '$valores->usuario', '$valores->accion', '$valores->num_serie', '$valores->tipo')";
    return mysqli_query($con, $sql);
}

function consultar_historico($valores){
    include("../conexion.php");

    $sql = "SELECT * FROM historico ORDER BY fecha_evento DESC"; // Ordenar por fecha más reciente
    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = $fila;
    }

    return $datos;
}

?>