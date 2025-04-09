<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if($clientejson->accion==0){
    $respuesta_servidor->resultado=insertar_usuario($clientejson);
}elseif($clientejson->accion==1){
    $respuesta_servidor->resultado=editar_usuario($clientejson);
}elseif($clientejson->accion==2){
    $respuesta_servidor->resultado=consultar_usuario($clientejson);
}elseif($clientejson->accion==3){
    $respuesta_servidor->resultado=desactivar_usuario($clientejson);
}

print(json_encode($respuesta_servidor));

function insertar_usuario($valores){
    include("../conexion.php");
    $registro =date("Y-m-d H:i:s");
    $hashed_contraseña = password_hash($valores->contraseña, PASSWORD_BCRYPT);
    $sql = "INSERT INTO usuario(nombre,correo,contraseña,edad,telefono,fecha_nac,fecha_reg,habilitado) VALUES ('$valores->nombre',
    '$valores->correo','$hashed_contraseña','$valores->edad','$valores->telefono','$valores->fecha_nac','$registro',1)";

    $sql_val_mail="SELECT * FROM usuario WHERE correo= '$valores->correo'";
    if(mysqli_query($con,$sql_val_mail)-> num_rows > 0){
        return false;
    }else{
        return mysqli_query($con,$sql);
    }
}

function editar_usuario($valores){
    include("../conexion.php");
    $sql = "UPDATE usuario SET nombre='$valores->nombre', correo='$valores->correo', contraseña='$valores->contraseña',
    edad='$valores->edad', telefono='$valores->telefono',fecha_nac='$valores->fecha_nac', fecha_reg = '$valores->fecha_reg' WHERE id='$valores->id';";
    return mysqli_query($con,$sql);
}

function consultar_usuario(){
    include("../conexion.php");
    $sql = "SELECT * FROM  usuario WHERE habilitado = 1 ";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)){
        array_push($array, $fila);
    }
    return $array;
}

function desactivar_usuario($valores){
    include("../conexion.php");
    if (is_array($valores->id)) { // Verifica si $valores->id es un array
        $ids = implode(",", array_map('intval', $valores->id)); // Convierte el array de IDs en una lista separada por comas
        $sql = "UPDATE usuario SET habilitado = 0 WHERE id IN ($ids);"; // Consulta sql usando IN para eliminar múltiples registros
        return mysqli_query($con, $sql);
    } else {
        $sql="UPDATE usuario SET habilitado = 0 where id='$valores->id';";
        return mysqli_query($con,$sql);
    }
}