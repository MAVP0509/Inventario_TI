<?php
//TODO Consultas a la bd realizadas en la pestaña de rubro

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = insertar_rubro($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = editar_rubro($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = consultar_rubro($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = eliminar_rubro($clientejson);
}

print(json_encode($respuesta_servidor)); //? envía la respuesta de la base de datos a javascript


//* Creación de un nuevo rubro
function insertar_rubro($valores)
{
    include("../conexion.php");
    $sql = 'INSERT INTO cat_rubro(rubro) VALUES ("' . $valores->rubro . '")';
    $SQLStatement = "CALL pInsertarCatalogo('$sql','CAT_Rubro')";
    //var_dump($SQLStatement);
    $sql_val_rubro = "SELECT * FROM cat_rubro WHERE rubro = '$valores->rubro'";
    if (mysqli_query($con, $sql_val_rubro)->num_rows > 0) {  //*Consultamos su ya existe el rubro
        return "Este rubro ya existe";
    } else {
        return mysqli_query($con, $SQLStatement);
    }
}

//* Edita un rubro 
function editar_rubro($valores)
{
    include("../conexion.php");
    $sql = "UPDATE cat_rubro SET rubro='$valores->rubro' WHERE id='$valores->id';";
    return mysqli_query($con, $sql);
}

//* Consulta los rubros de la tabla rubro para mostrarlos en el programa
function consultar_rubro()
{
    include("../conexion.php");
    $sql = "SELECT * FROM  cat_rubro WHERE habilitado = 1";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);  //* Se guardan los registros en un array
    }
    return $array;
}

//* "Elimina" rubros
function eliminar_rubro($valores)
{
    include("../conexion.php");


    foreach ($valores->id as $id) {
        $id = intval($id); //* Asegura que $id sea un número
        $sql_val = "SELECT * FROM inventario_ti_sur WHERE fk_rubro = '$id'";
        $res = mysqli_query($con, $sql_val);  //* Consultamos si el rubro está en uso en la tabla inventario

        if ($res && $res->num_rows > 0) {
            return "Uno o más rubros no pueden ser eliminados. Uno o más equipos lo tienen asignado";
        }
    }

    $ids = implode(",", array_map('intval', $valores->id)); //* Convierte el array de IDs en una lista separada por comas
    $sql = "UPDATE cat_rubro SET habilitado = 0 WHERE id IN ($ids);"; //* Consulta sql usando IN para eliminar múltiples registros
    return mysqli_query($con, $sql);
}
