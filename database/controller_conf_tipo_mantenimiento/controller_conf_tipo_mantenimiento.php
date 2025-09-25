<?php
header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_orden_tipos($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = nuevo_orden_tipo($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = actualizar_orden_tipos($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = eliminar_orden_tipo($clientejson);
}

print(json_encode($respuesta_servidor));

function consultar_orden_tipos($valores)
{
    include("../conexion.php");

    $sql = "SELECT * FROM vorden_mantenimiento ORDER BY orden asc";
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

function actualizar_orden_tipos($valores) {
    include("../conexion.php");

    if (!isset($valores->orden) || !is_array($valores->orden)) {
        // error_log("Error: 'orden' no está definido o no es un array.");
        return false;
    }

    // $success = true;

    foreach ($valores->orden as $index => $tipo_id) {
        $tipo_id = (int)$tipo_id;
        $nuevo_orden = $index + 1;

        $sql = "UPDATE orden_mantenimiento SET orden = $nuevo_orden WHERE tipo_activo = $tipo_id";
        // var_dump($sql);
        $query = mysqli_query($con, $sql);

        /* if (!$query) {
            $success = false;
            error_log("Error al actualizar tipo_id $tipo_id: " . mysqli_error($con));
        } */
    }

    return array(
        'result' => $query,
        // 'orden' => $tipo_id
    );
}


function eliminar_orden_tipo($valores)
{
    include("../conexion.php");

    $valor = implode(",", array_map('intval', $valores->activo));

    $sql = "DELETE FROM orden_mantenimiento WHERE tipo_activo IN ($valor)";
    // var_dump($sql);
    $query = mysqli_query($con, $sql);

    return $query;
}
