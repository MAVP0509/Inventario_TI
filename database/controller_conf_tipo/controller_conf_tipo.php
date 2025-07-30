<?php
//TODO Consultas a la bd realizadas en la pestaña de tipo

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = insertar_tipo($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = editar_tipo($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = consultar_tipo($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = eliminar_tipo($clientejson);
}

print(json_encode($respuesta_servidor)); //? envía la respuesta de la base de datos a javascript


//* Creación de un nuevo tipo
function insertar_tipo($valores){
    include("../conexion.php");
    $sql = 'INSERT INTO cat_tipo(tipo) VALUES ("' . $valores->tipo . '")';

    //$SQLStatement = "CALL pInsertarCatalogo('$sql','CAT_Tipo')";
    $sql_val_tipo = "SELECT * FROM cat_tipo WHERE tipo = '$valores->tipo'";
    if (mysqli_query($con, $sql_val_tipo)->num_rows > 0) {   //*Validamos si ya existe el tipo
        return "Este tipo ya existe";
    } else {
        return mysqli_query($con, $sql);
    }
}

//* Edita un tipo 
function editar_tipo($valores){
    include("../conexion.php");
    $sql = "UPDATE cat_tipo SET tipo='$valores->tipo' WHERE id='$valores->id';";
    //var_dump($sql);
    return mysqli_query($con, $sql);
}

//* Consulta los tipos de la tabla tipo para mostrarlos en el programa
function consultar_tipo(){
    include("../conexion.php");
    $sql = "SELECT * FROM  cat_tipo WHERE habilitado = 1";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);  //* Se guardan los registros en un array
    }
    return $array;
}

//* "Eliminar" tipos
function eliminar_tipo($valores)
{
    include("../conexion.php");

    foreach ($valores->id as $id) {
        $id = intval($id); //* Asegura que $id sea un número
        $sql_val = "SELECT * FROM inventario_ti_sur WHERE fk_tipo = '$id'";
        $res = mysqli_query($con, $sql_val);  //*Consultamos si el rubro está en uso, si lo está, no puede ser "eliminado"

        if ($res && $res->num_rows > 0) {  
            return "Uno o más tipos no pueden ser eliminados. Uno o más equipos lo tienen asignado";
        }
    }

    $ids = implode(",", array_map('intval', $valores->id)); //* Convierte el array de IDs en una lista separada por comas
    $sql = "UPDATE cat_tipo SET habilitado = 0 WHERE id IN ($ids);"; //* Consulta sql usando IN para eliminar múltiples registros
    return mysqli_query($con, $sql);
}