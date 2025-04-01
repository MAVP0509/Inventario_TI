<?php

    header('Content-Type: text/html; charset=UTF-8');
    date_default_timezone_set('America/Mexico_City');

    $clientejson = json_decode($_POST['trama']);

    $respuesta_servidor = new stdClass();


    /* $persona= new stdClass();
    $persona->Nombre = "oswaldo";
    $persona->fechanac = date("Y-m-d H:i:s");
    print("Hola soy".$persona->Nombre ."hoy es". $persona->fechanac  );
 */

   // print($persona->Nombre);
    //var_dump($persona);
    //print($clientejson->nombre);


    if ($clientejson->accion == 0) {
        $respuesta_servidor->resultado = consultarDatos($clientejson);
    } else if ($clientejson->accion == 1) {
        $respuesta_servidor->resultado = insertarUsuario($clientejson);
    } else if ($clientejson->accion == 2) {
        $respuesta_servidor->resultado = validarToken($clientejson->token);
    } elseif ($clientejson->accion == 3) {
        $respuesta_servidor->resultado = restablecer_contraseña($clientejson);
    }
    print(json_encode($respuesta_servidor)); //si lo quitas truena la app


    function consultarDatos($valores) {
        include("../conexion.php");

        $sql="SELECT * FROM usuario WHERE correo= '$valores->correo'";
        $query = mysqli_query($con,$sql);
        
        if ($query->num_rows > 0) {
            $user = mysqli_fetch_assoc($query);
            if (password_verify($valores->contraseña, $user['contraseña'])) {
                $result =[$user['nombre'] , $user['correo'], $user['edad'],$user['telefono'],$user['fecha_reg']];
                return $result;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    function insertarUsuario($valores){
        include("../conexion.php");
        $registro =date("Y-m-d H:i:s");
        $hashed_contraseña =password_hash($valores->contraseña, PASSWORD_BCRYPT);
        $sql="INSERT INTO usuario(nombre,correo,contraseña,edad,telefono,fecha_nac,fecha_reg,habilitado) VALUES ('$valores->nombre',
        '$valores->correo','$hashed_contraseña','$valores->edad', '$valores->telefono','$valores->fecha_nac','$registro',1)";
        //var_dump($sql);
        $sql_val_mail="SELECT * FROM usuario WHERE correo= '$valores->correo'";
        //$query_mail=mysqli_query($con,$sql_val_mail);

        if(mysqli_query($con,$sql_val_mail)-> num_rows > 0){
            return false;
        }else{
            return mysqli_query($con,$sql);
        }
    }

 function validarToken($token){
    include("../conexion.php");
    $sql ="SELECT * FROM usuario WHERE token = '$token' AND token_expiracion > NOW()";

    $query = mysqli_query($con,$sql);

    if ($query->num_rows > 0) {
        return true;
    } else {
        return false;
    }
}

function restablecer_contraseña($valores){
    include("../conexion.php");

    if (!isset($valores->token) || !isset($valores->contraseña)) {
        return false;
    }
    $token = $valores->token;
    $nueva_contraseña = password_hash($valores->contraseña, PASSWORD_BCRYPT);
    $sql="SELECT * FROM usuario WHERE token = '$token' AND token_expiracion > NOW()";
    $query = mysqli_query($con,$sql);
    
    if ($query->num_rows > 0) {
        $update_sql = "UPDATE usuario SET contraseña = '$nueva_contraseña', token = NULL, token_expiracion = NULL WHERE token = '$token'";
        if (mysqli_query($con, $update_sql)) {
            return true; //Contraseña restablecida
        } else {
            return false; //Error al actualizar contraseña
        }
    } else {
        return false; //Token inválido o expirado
    }
}
