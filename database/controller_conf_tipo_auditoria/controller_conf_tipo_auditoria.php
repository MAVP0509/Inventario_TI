<?php
header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_orden($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = nuevo_orden($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = actualizar_orden($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = eliminar_orden($clientejson);
}

print(json_encode($respuesta_servidor));

function consultar_orden()
{
    include("../conexion.php");

    $sql = "SELECT * FROM vorden_auditoria ORDER BY orden asc";
    $query = mysqli_query($con, $sql);

    $datos = array();

    while ($fila = mysqli_fetch_object($query)) {
        array_push($datos, $fila);
    }

    return $datos;
}

function nuevo_orden($valores)
{
    include("../conexion.php");

    $sql_val = "SELECT tipo_activo 
                FROM orden_auditoria 
                WHERE tipo_activo = '$valores->dispositivo'";

    $query_val = mysqli_query($con, $sql_val);

    // Validar error de consulta
    if (!$query_val) {
        return [
            "result" => false,
            "error" => "Error en la consulta de validación"
        ];
    }

    // Validación de existencia
    if ($query_val->num_rows > 0) {
        return [
            "result" => false,
            "error" => "Ya existe el registro. Inténtalo nuevamente"
        ];
    }

    $sql = "INSERT INTO orden_auditoria (id_orden, tipo_activo, orden)
            SELECT
                1,
                '$valores->dispositivo',
                COALESCE(MAX(orden), 0) + 1
            FROM orden_auditoria";

    $query = mysqli_query($con, $sql);

    if (!$query) {
        return [
            "result" => false,
            "error" => "No se pudo realizar el registro. Inténtalo nuevamente"
        ];
    }

    return [
        "result" => true,
        "mesaje" => "El registro se realizó correctamente."
    ];
}

function actualizar_orden($valores)
{
    include("../conexion.php");

    if (!isset($valores->orden) || !is_array($valores->orden)) {
        // error_log("Error: 'orden' no está definido o no es un array.");
        return [
            "result" => false,
            "error" => "El orden no esta definido"
        ];
    }

    foreach ($valores->orden as $index => $tipo_id) {
        $tipo_id = mysqli_real_escape_string($con, $tipo_id);
        $nuevo_orden = $index + 1;

        $sql = "UPDATE orden_auditoria 
                SET orden = $nuevo_orden 
                WHERE tipo_activo = '$tipo_id'";
        // var_dump($sql);
        $query = mysqli_query($con, $sql);

        if (!$query) {
            return [
                "result" => false,
                "error" => "Error al actualizar registro. Intentálo nuevamente"
            ];
            // error_log("Error al actualizar tipo_id $tipo_id: " . mysqli_error($con));
        }
    }

    return array(
        'result' => $query,
        'mensaje' => "El orden se actualizó correctamente"
    );
}

function eliminar_orden($valores)
{
    include("../conexion.php");
    // Validación: existe y es array
    if (!isset($valores->activo) || !is_array($valores->activo)) {
        return [
            "result" => false,
            "error" => "'activo' no está definido o no es un array"
        ];
    }
    // Validación: array no vacío
    if (empty($valores->activo)) {
        return [
            "result" => false,
            "error" => "No hay registros para eliminar"
        ];
    }

    $valor = implode(",", array_map('intval', $valores->activo));

    $sql = "DELETE FROM orden_auditoria WHERE tipo_activo IN ($valor)";
    // var_dump($sql);
    $query = mysqli_query($con, $sql);

    if (!$query) {
        return [
            "result" => false,
            "error" => "No se pudo realizar la eliminación. Intentelo nuevamente."
        ];
    }

    return [
        "result" => true,
        "mensaje" => "Registros eliminados correctamente"
    ];
}
