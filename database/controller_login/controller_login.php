<?php

    header('Content-Type: text/html; charset=UTF-8');
    date_default_timezone_set('America/Mrexico_City');

    $clientejson = json_decode($_POST['trama']);

    $respuesta_servidor = new stdClass();




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