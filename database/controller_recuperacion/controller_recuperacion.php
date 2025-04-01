<?php

    header('Content-Type: text/html; charset=UTF-8');
    date_default_timezone_set('America/Mexico_City');

    $clientejson = json_decode($_POST['trama']);

    $respuesta_servidor = new stdClass();

    if ($clientejson->accion == 0) {
        $respuesta_servidor->resultado = validarToken($clientejson->token);
    } else if($clientejson->accion ==1){
        $respuesta_servidor->resultado = restablecer_contraseña($clientejson);
    }

    print(json_encode($respuesta_servidor)); //si lo quitas truena la app


    function validarToken($token){
        include("../conexion.php");
        $sql ="SELECT * FROM usuario WHERE token = '$token' AND token_expiracion > NOW()";
    
        $query = mysqli_query($con,$sql);
    
        if ($query->num_rows > 0) {
            return $query;
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
    