<?php
//* Consultas a la bd realizadas en la pestaña de rubro

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


//* Creación de un nuevo supervisor
function insertar_rubro($valores){
    include("../conexion.php");
    $sql = "INSERT INTO cat_rubro(rubro) VALUES ('$valores->rubro');";

    $sql_val_rubro = "SELECT * FROM cat_rubro WHERE rubro = '$valores->rubro'";
    if (mysqli_query($con, $sql_val_rubro)->num_rows > 0) {
        return false;
    } else {
        return mysqli_query($con, $sql);
    }
}

//* Edita un supervisor ya existente
function editar_rubro($valores){
    include("../conexion.php");
    $sql = "UPDATE cat_rubro SET rubro='$valores->rubro' WHERE id='$valores->id';";
    //var_dump($sql);
    return mysqli_query($con, $sql);
}

//* Consulta los supervisores de la tabla supervisor para mostrarlos en el programa
function consultar_rubro(){
    include("../conexion.php");
    $sql = "SELECT * FROM  cat_rubro";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);  //* Se guardan los registros en un array
    }
    return $array;
}

function eliminar_rubro($valores){
    include("../conexion.php");

    if (is_array($valores->id)) { // Verifica si $valores->id es un array
        $ids = implode(",", array_map('intval', $valores->id)); // Convierte el array de IDs en una lista separada por comas
        $sql = "DELETE FROM inventario_ti_sur WHERE id IN ($ids);"; // Consulta sql usando IN para eliminar múltiples registros
        return mysqli_query($con, $sql);
    } else {
        $sql = "DELETE FROM inventario_ti_sur where id='$valores->id';";
        return mysqli_query($con, $sql);
    }
}