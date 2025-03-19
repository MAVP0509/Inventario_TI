<?php

    header('Content-Type: text/html; charset=UTF-8');
    date_default_timezone_set('America/Mrexico_City');

    $clientejson = json_decode($_POST['trama']);

    $respuesta_servidor = new stdClass();

    if($clientejson->accion==0){
        $respuesta_servidor->resultado=ConsultarDatos($clientejson);
    }elseif($clientejson->accion==1){
        $respuesta_servidor->resultado=insertarUsuario($clientejson);
    }


    function consultarDatos(){
        include("../conexion.php");
        $sql="SELECT correo, contraseña FROM usuario WHERE id='$valores->id'";
        $query = mysqli_query($con,$sql);
        $array = array();
        while ($fila = mysqli_fetch_object($query)){
            array_push($array,$fila);
        }
        return $array;
    }

    function insertarUsuario(){
        include("../coneccion.php");
        $registro =date("Y-m-d H:i:s");
        $sql="INSERT INTO usuario(nombre,correo,contraseña,edad,fecha_nac,fecha_reg,habilitado) VALUES ('$valores->nombre',
        '$valores->correo','$valores->contraseña','$valores->edad','$valores->fecha_nac,'$registro',1)";
        return mysqli_query($con,$sql);
    }