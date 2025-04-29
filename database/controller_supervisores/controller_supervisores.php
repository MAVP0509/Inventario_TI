<?php
//* Consultas a la bd realizadas en la pestaña de supervisores

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if($clientejson->accion==0){
    $respuesta_servidor->resultado=insertar_supervisor($clientejson);
}elseif($clientejson->accion==1){
    $respuesta_servidor->resultado=editar_supervisor($clientejson);
}elseif($clientejson->accion==2){
    $respuesta_servidor->resultado=consultar_supervisor($clientejson);
}elseif($clientejson->accion==3){
    $respuesta_servidor->resultado=desactivar_supervisor($clientejson);
}
print(json_encode($respuesta_servidor));//? envía la respuesta de la base de datos a javascript


//* Creación de un nuevo supervisor
function insertar_supervisor($valores){
    include("../conexion.php");
    $sql = "INSERT INTO supervisor(nombre,cargo,region,habilitado) VALUES ('$valores->nombre','$valores->cargo','$valores->region',0);";
    return mysqli_query($con,$sql);
}

//* Edita un supervisor ya existente
function editar_supervisor($valores){
    include("../conexion.php");
    $sql = "UPDATE supervisor SET nombre='$valores->nombre', cargo='$valores->cargo', region='$valores->region' WHERE id='$valores->id';";
    return mysqli_query($con,$sql);
}

//* Consulta los supervisores de la tabla supervisor para mostrarlos en el programa
function consultar_supervisor(){
    include("../conexion.php");
    $sql = "SELECT * FROM  supervisor";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)){
        array_push($array, $fila);  //* Se guardan los registros en un array
    }
    return $array;
}

//* Desactiva los supervisores
function desactivar_supervisor($valores){
    include("../conexion.php");
    $sql="UPDATE supervisor SET habilitado = '$valores->habilitado' where id='$valores->id';";
    return mysqli_query($con,$sql);
}