<?php 
    //*Archivo de conección a la base de datos
    //$user="janny";
    $user="root";
    //$pass="janny789";
    $pass = "78910";
    //$server="10.11.134.194";
    $server="localhost";
    $db="inventario_ti";
    $con= mysqli_connect($server,$user,$pass) or die("Error al conectar");
    mysqli_select_db($con,$db);
    mysqli_set_charset($con,"utf8");    
?>