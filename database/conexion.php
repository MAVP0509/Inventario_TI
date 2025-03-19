<?php 
    $user="root";
    $pass="root";
    $sever="localhost";
    $db="bd_login";
    $con= mysqli_connect($server,$user,$pass) or die("Error al conectar");
    mysqli_select_db($con,$db);
    mysqli_set_charset($con,"utf8");    
?>