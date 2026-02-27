<?php
//TODO Consultas a la bd realizadas en la pestaña de supervisores

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = insertar_supervisor($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = editar_supervisor($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = consultar_supervisor($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = habilitar_supervisor($clientejson);
} elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = consultar_distintos($clientejson->tabla, $clientejson->campo);
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = eliminar_supervisor($clientejson);
}
print(json_encode($respuesta_servidor));

//* Creación de un nuevo supervisor
function insertar_supervisor($valores)
{
    include("../conexion.php");
    $sql = "INSERT INTO supervisor(nombre,cargo,region,habilitado) VALUES ('$valores->nombre','$valores->cargo','$valores->region',0);";

    $sql_val_name = "SELECT * FROM supervisor WHERE nombre = '$valores->nombre'";

    //* Validamos si el supervisor ya existe
    if (mysqli_query($con, $sql_val_name)->num_rows > 0) {
        return "El supervisor ya existe";
    } else {
        return mysqli_query($con, $sql);
    }
}

//* Edita un supervisor 
function editar_supervisor($valores)
{
    include("../conexion.php");
    $respuesta = new stdClass();

    //* Validar si el supervisor cambió de región
    $sql_val = "SELECT * FROM supervisor WHERE id = '$valores->id'";
    $query_val = mysqli_query($con, $sql_val);
    $resultado_val = mysqli_fetch_assoc($query_val);
    $region = $resultado_val['region'];

    if ($region === $valores->region) {
        $sql_update = "UPDATE supervisor SET nombre='$valores->nombre', cargo='$valores->cargo', region='$valores->region' WHERE id='$valores->id';";
        mysqli_query($con, $sql_update);

        $respuesta->resultado  = "Supervisor actualizado correctamente";
    } else {
        //* Si el supervisor cambia de región, validamos si en la nueva región hay uno ya habilitado
        $sql_change_supervisor = "SELECT * FROM supervisor WHERE region = '$valores->region' AND habilitado = 1";
        $query_change_supervisor = mysqli_query($con, $sql_change_supervisor);
        $array = array();
        while ($fila = mysqli_fetch_object($query_change_supervisor)) {
            array_push($array, $fila);
        }

        //* Validamos si la nueva region tiene supervisor habilitado, para así deshabilitar el que ya tiene y que el supervisor editado sea el habilitado
        if (!empty($array)) {
            $id_habilitado = $array[0]->id;

            $sql_update_old_supervisor = "UPDATE supervisor SET habilitado = 0 WHERE id = '$id_habilitado'";
            mysqli_query($con, $sql_update_old_supervisor);

            $sql_update_new_supervisor = "UPDATE supervisor SET nombre = '$valores->nombre', cargo = '$valores->cargo', region = '$valores->region', habilitado = 1 WHERE id = '$valores->id' ";
            mysqli_query($con, $sql_update_new_supervisor);

            $respuesta->resultado = "Supervisor actualizado correctamente";
        } else {
            //*si la región es nueva y no tiene supervisor o si la región existe pero no tiene habilitado un supervisor

            $sql = "UPDATE supervisor SET nombre = '$valores->nombre', cargo = '$valores->cargo', region = '$valores->region', habilitado = 1 WHERE id = '$valores->id' ";
            mysqli_query($con, $sql);

            $respuesta->resultado = "Supervisor actualizado correctamente";
        }
        return $respuesta;
    }



    $sql_region = "SELECT region FROM supervisor WHERE region = '$valores->region' WHERE habilitado = 1";
    return $respuesta;
}

//* Consulta los supervisores de la tabla supervisor para mostrarlos en el programa
function consultar_supervisor()
{
    include("../conexion.php");
    $sql = "SELECT * FROM  supervisor WHERE habilitado <> 2";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);  //* Se guardan los registros en un array
    }
    return $array;
}
//*Función para habilitar/deshabilitar supervisores
function habilitar_supervisor($valores)
{
    include("../conexion.php");
    $sql = "UPDATE supervisor SET habilitado='$valores->habilitado'  WHERE id='$valores->id'";
    $query = mysqli_query($con, $sql);
    return $query;
}

//* Desactivar supervisores
function eliminar_supervisor($valores)
{
    include("../conexion.php");
    $respuesta = new stdClass();

    foreach ($valores->id as $id) {
        $id = intval($id); //* Validamos que el id sea un número, al ser un arreglo, se valida cada uno
        $sql_val = "SELECT * FROM supervisor WHERE habilitado = 1 AND id = '$id'";
        $res = mysqli_query($con, $sql_val);

        if ($res && $res->num_rows > 0) {
            $respuesta->error =  "Uno o más supervisores están habilitados, no pueden ser eliminados";
            return $respuesta;
        }
    }

    $ids = implode(",", array_map('intval', $valores->id)); //* Convierte el array de IDs en una lista separada por comas
    $sql = "UPDATE supervisor SET habilitado = 2 WHERE id IN ($ids);"; //* Consulta sql usando IN para "eliminar" múltiples registros
    mysqli_query($con, $sql);
    $respuesta->mensaje = "Supervisor(es) eliminado(s) correctamente";
    return $respuesta;
}
