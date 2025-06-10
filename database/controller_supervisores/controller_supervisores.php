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
    $respuesta_servidor->resultado = desactivar_supervisor($clientejson);
} elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = consultar_distintos($clientejson->tabla, $clientejson->campo);
}elseif ($clientejson->accion == 5) {
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

    $sql = "UPDATE supervisor SET nombre='$valores->nombre', cargo='$valores->cargo', region='$valores->region', habilitado = 0 WHERE id='$valores->id';";

    return mysqli_query($con, $sql);
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

//* Desactivar supervisores
function desactivar_supervisor($valores)
{
    include("../conexion.php");
    $sql = "UPDATE supervisor SET habilitado = '$valores->habilitado' where id='$valores->id';";
    return mysqli_query($con, $sql);
}

//* Función para rellenar selects2 en la pestaña supervisores
function consultar_distintos($tabla, $campo)
{
    include("../conexion.php");
    //Validación para evitar inyecciones
    $tabla = mysqli_real_escape_string($con, $tabla);
    $campo = mysqli_real_escape_string($con, $campo);

    $sql = "SELECT DISTINCT `$campo` FROM `$tabla` WHERE  `$campo` <> 'NA'";
    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $valor = $fila[$campo];
        $datos[] = [
            'id' => $valor,
            $campo => $valor
        ];
    }

    return $datos;
}

function eliminar_supervisor($valores)
{
    include("../conexion.php");
    foreach ($valores->id as $id) {
        $id = intval($id); //* Validamos que el id sea un número, al ser un arreglo, se valida cada uno
        $sql_val = "SELECT * FROM supervisor WHERE habilitado = 1 AND id = '$id'";
        $res = mysqli_query($con, $sql_val);  //* Consultamos si esa marca esta en uso, si es así, no puede "eliminarse"

        if ($res && $res->num_rows > 0) {
            return "Uno o más supervisores están habilitados, no pueden ser eliminados";
        }
    }

    $ids = implode(",", array_map('intval', $valores->id)); //* Convierte el array de IDs en una lista separada por comas
    $sql = "UPDATE supervisor SET habilitado = 2 WHERE id IN ($ids);"; //* Consulta sql usando IN para "eliminar" múltiples registros
    return mysqli_query($con, $sql);
}
