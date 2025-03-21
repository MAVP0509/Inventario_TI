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

    if($clientejson->accion==0){
        $respuesta_servidor->resultado = ConsultarDatos($clientejson);
    }elseif($clientejson->accion==1){
        $respuesta_servidor->resultado = insertarUsuario($clientejson);
    } 
    print(json_encode($respuesta_servidor));


    function consultarDatos($valores){
        include("../conexion.php");
        $sql="SELECT correo, contraseña FROM usuario WHERE id='$valores->id'";
        $query = mysqli_query($con,$sql);
        $array = array();
        while ($fila = mysqli_fetch_object($query)){
            array_push($array,$fila);
        }
        return $array;
    }

    function insertarUsuario($valores){
        include("../conexion.php");
        $registro =date("Y-m-d H:i:s");
        $sql="INSERT INTO usuario(nombre,correo,contraseña,edad,telefono,fecha_nac,fecha_reg,habilitado) VALUES ('$valores->nombre',
        '$valores->correo','$valores->contraseña','$valores->edad', '$valores->telefono','$valores->fecha_nac','$registro',1)";
        //var_dump($sql);
        return mysqli_query($con,$sql);
    }