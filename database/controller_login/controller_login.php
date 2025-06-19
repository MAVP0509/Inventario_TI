<?php
    //TODO PHP del login del programa

    header('Content-Type: text/html; charset=UTF-8');
    date_default_timezone_set('America/Mexico_City');

    $clientejson = json_decode($_POST['trama']);

    $respuesta_servidor = new stdClass();

    if ($clientejson->accion == 0) {
        $respuesta_servidor->resultado = validar_log($clientejson);
    } else if ($clientejson->accion == 1) {
        $respuesta_servidor->resultado = insertarUsuario($clientejson);
    } 
    print(json_encode($respuesta_servidor)); 


    //* Función para validar las credenciales en el inicio de sesión
    function validar_log($valores) {
        include("../conexion.php");

        $sql="SELECT * FROM usuario WHERE correo= '$valores->correo'";
        $query = mysqli_query($con,$sql); //*Consultamos si el correo existe
        
        if ($query->num_rows > 0) {
            $user = mysqli_fetch_assoc($query);
            if (password_verify($valores->contraseña, $user['contraseña'])) { //*Validamos que la contraseña sea la correcta
                $result =[$user['nombre'] , $user['correo'], $user['edad'],$user['telefono'],$user['fecha_reg'],$user['rol']];
                return $result; //*retornamos información del usuario logeado para guardarlo en la session storage
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    //* Función para el registro de un usuario
    function insertarUsuario($valores){
        include("../conexion.php");
        $registro =date("Y-m-d H:i:s"); //* Guardamos la fecha y hora del registro
        $hashed_contraseña =password_hash($valores->contraseña, PASSWORD_BCRYPT); //* Encriptación de la contraseña
        $sql="INSERT INTO usuario(nombre,correo,contraseña,edad,telefono,fecha_nac,fecha_reg,habilitado,rol) VALUES ('$valores->nombre',
        '$valores->correo','$hashed_contraseña','$valores->edad', '$valores->telefono','$valores->fecha_nac','$registro',1,'admin')";
        
        $sql_val_mail="SELECT * FROM usuario WHERE correo= '$valores->correo'";

        if(mysqli_query($con,$sql_val_mail)-> num_rows > 0){  //*Validamos si el correo ya existe
            return false;
        }else{
            return mysqli_query($con,$sql);
        }
    }

 