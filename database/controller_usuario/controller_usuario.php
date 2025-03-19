<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mrexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if($clientejson->accion==0){
    $respuesta_servidor->resultado=crearUsuario($clientejson);
}

print(json_encode($respuesta_servidor));

function crearUsuario(){
    include("../coneccion.php");
    $registro =date("Y-m-d H:i:s");
    $sql="INSERT INTO usuario(nombre,correo,contraseña,edad,fecha_nac,fecha_reg,habilitado) VALUES ('$valores->nombre','$valores->correo','$valores->contraseña','$valores->edad','$valores->fecha_nac,'$registro','$valores->habilitado')";
    return mysqli_query($con,$sql);
}
