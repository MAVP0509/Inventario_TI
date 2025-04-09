<?php 
    //$user="janny";
    $user="root";
    $pass="root";
    //$pass="janny789";
    $server="localhost";
    //$server="10.11.134.194";
    $db="inventario_ti";
    $con= mysqli_connect($server,$user,$pass) or die("Error al conectar");
    mysqli_select_db($con,$db);
    mysqli_set_charset($con,"utf8");    
?>