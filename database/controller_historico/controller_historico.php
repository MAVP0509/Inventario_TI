<?php

header('Content-Type: text/html; charset=UTF-8');
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
            $sql = "INSERT INTO historico(fecha_evento, usuario_sesion, evento, num_serie, usuario, cargo, zona, ubicacion, af, rubro, tipo, marca, modelo, tag, fecha_registro) 
            VALUES ('$fecha_evento', '$valores->usuario_sesion', '$valores->evento', '$num_serie', '$valores->usuario', '$valores->cargo', '$valores->zona', '$valores->ubicacion', '$valores->af', '$valores->rubro', '$valores->tipo', '$valores->marca', '$valores->modelo', '$valores->tag', '$valores->fecha_registro')";
            var_dump($query);
            $query = mysqli_query($con, $sql);
        }
        return $query;
    } else {
        $sql = "INSERT INTO historico(fecha_evento, usuario_sesion, evento, num_serie, usuario, cargo, zona, ubicacion, af, rubro, tipo, marca, modelo, tag, fecha_registro) 
        VALUES ('$fecha_evento', '$valores->usuario_sesion', '$valores->evento', '$valores->num_serie', '$valores->usuario', '$valores->cargo', '$valores->zona', '$valores->ubicacion', '$valores->af', '$valores->rubro', '$valores->tipo', '$valores->marca', '$valores->modelo', '$valores->tag', '$valores->fecha_registro')";
        //var_dump($query2);
        $query2 = mysqli_query($con, $sql);
        return $query2;
    }
}


function consultar_historico($valores)
{
    include("../conexion.php");

    // $sql = "SELECT * FROM historico ORDER BY fecha_evento DESC";
    $sql = "SELECT * FROM vhistorico";
    //$sql = "SELECT * FROM historico";
    //var_dump($sql)
    /*  WHERE 
                hst.num_serie = ITS.num_serie"; */

    if (!empty($valores->num_serie)) {
        $sql .= " WHERE num_serie = '$valores->num_serie'";
    }

    if (!empty($valores->fecha_inicio) && !empty($valores->fecha_fin)) {
        if (strpos($sql, 'WHERE') !== false) {
            $sql .= " AND fecha_evento BETWEEN '$valores->fecha_inicio' AND '$valores->fecha_fin'";
        } else {
            $sql .= " WHERE fecha_evento BETWEEN '$valores->fecha_inicio' AND '$valores->fecha_fin'";
        }
    }

    $sql .= " ORDER BY fecha_evento DESC LIMIT 100";
    //var_dump($sql);
    $query = mysqli_query($con, $sql);
    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = $fila;
    }

    return $datos;
}
