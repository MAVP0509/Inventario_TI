<?php
//* Consultas a la bd realizadas en la pestaña de tipo

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
}

print(json_encode($respuesta_servidor)); //? envía la respuesta de la base de datos a javascript


//* Creación de un nuevo supervisor
function insertar_tipo($valores){
    include("../conexion.php");
    $sql = "INSERT INTO cat_tipo(tipo) VALUES ('$valores->tipo');";

    $sql_val_tipo = "SELECT * FROM cat_tipo WHERE tipo = '$valores->tipo'";
    if (mysqli_query($con, $sql_val_tipo)->num_rows > 0) {
        return false;
    } else {
        return mysqli_query($con, $sql);
    }
}

//* Edita un supervisor ya existente
function editar_tipo($valores){
    include("../conexion.php");
    $sql = "UPDATE cat_tipo SET tipo='$valores->tipo' WHERE id='$valores->id';";
    //var_dump($sql);
    return mysqli_query($con, $sql);
}

//* Consulta los supervisores de la tabla supervisor para mostrarlos en el programa
function consultar_tipo(){
    include("../conexion.php");
    $sql = "SELECT * FROM  cat_tipo";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);  //* Se guardan los registros en un array
    }
    return $array;
}