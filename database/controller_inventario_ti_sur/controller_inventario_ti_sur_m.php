<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if($clientejson->accion==0){
    $respuesta_servidor->resultado=nuevo_equipo($clientejson);
}elseif($clientejson->accion==1){
    $respuesta_servidor->resultado=editar_equipo($clientejson);
}elseif($clientejson->accion==2){
    $respuesta_servidor->resultado=consultar_equipo($clientejson);
}elseif($clientejson->accion==3){
    $respuesta_servidor->resultado=eliminar_equipo($clientejson);
}

print(json_encode($respuesta_servidor));

function nuevo_equipo($valores){
    include("../conexion.php");
    $sql="INSERT INTO inventario_ti_sur(zona,rubro,af,tipo,marca,modelo,num_serie,mac_address,ubicacion,tag,usuario,posicion,fecha_entrega) VALUES ('$valores->zona',
    '$valores->rubro','$valores->af','$valores->tipo','$valores->marca','$valores->modelo,'$valores->num_serie','$valores->mac_adress','$valores->ubicacion','$valores->tag','$valores->usuario','$valores->posicion','$valores->fecha_entrega')";
    return mysqli_query($con,$sql);
}

function editar_equipo($valores){
    include("../conexion.php");
    $sql = "UPDATE inventario_ti_sur SET zona='$valores->zona', rubro='$valores->rubro', af='$valores->af', tipo='$valores->tipo', marca='$valores->marca', modelo='$valores->modelo, num_serie='$valores->num_serie', mac_adress='$valores->mac_adress', ubicacion='$valores->ubicacion', tag='$valores->tag', usuario='$valores->usuario', posicion='$valores->posicion', fecha_entrega='$valores->fecha_entrega' WHERE id='$valores->id';";
    return mysqli_query($con,$sql);
}

function consultar_equipo(){
    include("../conexion.php");
    $sql = "SELECT * FROM  inventario_ti_sur";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)){
        array_push($array, $fila);
    }
    return $array;
}

function eliminar_equipo($valores){
    include("../conexion.php");
    $sql="DELETE FROM inventario_ti_sur where id='$valores->id';";
    return mysqli_query($con,$sql);
}