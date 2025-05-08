<?php

header('Content_Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_historico($clientejson);
} elseif ($clientejson->accion == 1){
    $respuesta_servidor->resultado = registrar_historico($clientejson);
}

print(json_encode($respuesta_servidor));

function registrar_historico($valores){
    include("../conexion.php");
    include("../controller_inventario/controller_inventario.php");

    $fecha_evento = date("Y:m:d H:i:s");
    $sql = "INSERT INTO historico(fecha_evento, usuario, evento, num_serie, tipo) VALUES ('$fecha_evento', '$valores->usuario', '$valores->evento', '$valores->num_serie')";
    $query = mysqli_query($con, $sql);

    if ($query) {
        return ["mensaje" => "Evento registrado exitosamente."];
    } else {
        return ["mensaje" => "Error al registrar evento: .".mysqli_error($con)];
    }
}

/* function consultar_historico($valores){
    include("../conexion.php");

    $sql = "SELECT * FROM historico ORDER BY fecha_evento DESC"; // Ordenar por fecha más reciente
    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = $fila;
    }

    return $datos;
} */

function consultar_historico($valores){
    include("../conexion.php");

    // $sql = "SELECT * FROM historico ORDER BY fecha_evento DESC";
    $sql = "SELECT
            hst.id,
            hst.fecha_evento,
            ITS.zona,
            CT.tipo,
            hst.evento,
            hst.usuario
            FROM
                historico AS hst
                INNER JOIN inventario_ti_sur AS ITS ON hst.num_serie = ITS.num_serie
                INNER JOIN cat_tipo AS CT ON CT.id = ITS.fk_tipo";
            /* WHERE
                hst.num_serie = 'num_serie'"; */
    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = $fila;
    }

    return $datos;
}

?>