<?php 
    //*Archivo de conección a la base de datos
    $user="root";
    // $user="root";
    $pass="root";
    //$pass = "root";
    $server="localhost";
    //$server="localhost";
    $db="inventario_ti";
    $con= mysqli_connect($server,$user,$pass) or die("Error al conectar");
    mysqli_select_db($con,$db);
    mysqli_set_charset($con,"utf8");    
?>