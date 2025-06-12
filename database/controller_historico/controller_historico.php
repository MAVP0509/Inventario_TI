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
    //var_dump($valores);
    $fecha_evento = date("Y:m:d H:i:s");
    $resultados = [];
    //$datos = [];
    //var_dump($valores);

    if (isset($valores->datos) && is_array($valores->datos)) {
        for ($i = 0; $i < count($valores->datos); $i++) {
            $datos = $valores->datos[$i];
            $estatus = ($datos->fk_usuario == "5") ? 'Bodega' : 'Asigando';
            $sql = "INSERT INTO historico(fecha_evento, usuario_sesion, evento, num_serie, usuario, zona, ubicacion, af, rubro, tipo, marca, modelo, tag, fecha_registro, estatus) 
            VALUES ('$fecha_evento',
                    '$valores->usuario_sesion', 
                    '$valores->evento', 
                    '$datos->num_serie', 
                    '$datos->fk_usuario', 
                    '$datos->zona', 
                    '$datos->ubicacion', 
                    '$datos->af', 
                    '$datos->fk_rubro', 
                    '$datos->fk_tipo', 
                    '$datos->fk_marca', 
                    '$datos->modelo', 
                    '$datos->tag', 
                    '$datos->fecha_entrega',
                    '$estatus')";
            $query = mysqli_query($con, $sql);
            $resultados[] = $query;
        }
        //var_dump($sql);
        return $resultados;
    } elseif (isset($valores->datos) && is_object($valores->datos)) { 
        $datos = $valores->datos;
        $fecha_entrega = !empty($datos->fecha_entrega) ? date("Y-m-d H:i:s", strtotime($datos->fecha_entrega)) : date("Y-m-d H:i:s");
       $estatus = ($datos->fk_usuario == "5") ? 'Bodega' : 'Asignado';
       $sql = "INSERT INTO historico(fecha_evento, usuario_sesion, evento, num_serie, usuario, zona, ubicacion, af, rubro, tipo, marca, modelo, tag, fecha_registro, estatus) 
        VALUES ('$fecha_evento',
        '$valores->usuario_sesion', 
        '$valores->evento', 
        '$datos->num_serie', 
        '$datos->fk_usuario', 
        '$datos->zona', 
        '$datos->ubicacion', 
        '$datos->af', 
        '$datos->fk_rubro', 
        '$datos->fk_tipo', 
        '$datos->fk_marca', 
        '$datos->modelo', 
        '$datos->tag', 
        '$fecha_entrega',
        '$estatus')";
        // var_dump($sql);
        $query2 = mysqli_query($con, $sql);
        return $query2 ? true : false;
    }
}

function consultar_historico($valores)
{
    include("../conexion.php");

    // $sql = "SELECT * FROM historico ORDER BY fecha_evento DESC";
    $sql = "SELECT * FROM vhistorico";
    //$sql = "SELECT * FROM historico";
    //var_dump($sql)

    if (!empty($valores->num_serie)) {
        $sql .= " WHERE num_serie = '$valores->num_serie'";
    }

    if (!empty($valores->fecha_inicio) && !empty($valores->fecha_fin)) {
        if (strpos($sql, 'WHERE') !== false) {
            $sql .= " AND DATE(fecha_evento) BETWEEN '$valores->fecha_inicio' AND '$valores->fecha_fin'";
        } else {
            $sql .= " WHERE DATE(fecha_evento) BETWEEN '$valores->fecha_inicio' AND '$valores->fecha_fin'";
        }
    }
    if ($valores->evento != "") {
        $sql .= " AND evento = '$valores->evento'";
    }

    $sql .= " ORDER BY fecha_evento DESC LIMIT 100";


    /* var_dump($sql); */
    $query = mysqli_query($con, $sql);
    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = $fila;
    }

    return $datos;
}