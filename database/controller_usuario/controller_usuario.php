<?php
//* Consultas a la bd realizadas en la pestaña de usuarios

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

print(json_encode($respuesta_servidor));//? envía la respuesta de la base de datos a javascript

//* Creación de un nuevo usuario
function insertar_usuario($valores){
    include("../conexion.php");

    $respuesta = new stdClass();

    $registro =date("Y-m-d H:i:s");//*Guarda la fecha y hora en la que se hace el registro
    $hashed_contraseña = password_hash($valores->contraseña, PASSWORD_BCRYPT); //*Encripta la contraseña ingresada
    $sql = "INSERT INTO usuario(nombre,correo,contraseña,region,rol,fecha_reg,habilitado) VALUES ('$valores->nombre',
    '$valores->correo','$hashed_contraseña','$valores->region','$valores->rol','$registro',1)";

    $sql_val_mail="SELECT * FROM usuario WHERE correo= '$valores->correo'"; //* Confirma si el correo ya existe en la base de datos
    if(mysqli_query($con,$sql_val_mail)-> num_rows > 0){
        $respuesta->error = 'El correo ya esta registrado';
        return $respuesta;
    }
    if(!mysqli_query($con,$sql)){
        return false; //* No encontró el correo así que si registró el usuario
    }
    return true;
}

//* Edita un usuario ya existente
function editar_usuario($valores){
    include("../conexion.php");
    $sql = "UPDATE usuario SET nombre='$valores->nombre', correo='$valores->correo', region='$valores->region',
    rol='$valores->rol' WHERE id='$valores->id';";
    return mysqli_query($con,$sql);
}

//* Consulta los registros de la tabla usuarios para mostrarlos en el programa
function consultar_usuario(){
    include("../conexion.php");
    $sql = "SELECT * FROM  usuario WHERE habilitado = 1 ";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)){
        array_push($array, $fila);  //* Se guardan los registros en un array
    }
    return $array;
}


//* "Elimina" uno o varios usuarios a la vez (los desactiva, siguen en la bd, pero no se mostrarán en el programa)
function desactivar_usuario($valores){
    include("../conexion.php");
    if (is_array($valores->id)) { //* Verifica si $valores->id es un array
        $ids = implode(",", array_map('intval', $valores->id)); //* Convierte el array de IDs en una lista separada por comas
        $sql = "UPDATE usuario SET habilitado = 0 WHERE id IN ($ids);"; //* Consulta sql usando IN para eliminar múltiples registros
        return mysqli_query($con, $sql);
    } else {
        $sql="UPDATE usuario SET habilitado = 0 where id='$valores->id';";
        return mysqli_query($con,$sql);
    }
}