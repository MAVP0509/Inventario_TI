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
    $sql="INSERT INTO usuario(nombre,correo,contraseña) VALUES ('$valores->nombre','$valores->correo','$valores->contraseña')";
    return mysqli_query($con,$sql);
}