<?php
//TODO Consultas a la bd realizadas en la pestaña de bajas

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_bajas($clientejson);
} 

print(json_encode($respuesta_servidor)); //? envía la respuesta de la base de datos a javascript

//* Consulta los marca de la tabla marca para mostrarlos en el programa
function consultar_bajas()
{
    include("../conexion.php");

    $sql = "SELECT * FROM  vinventario_ti_sur_bajas;";  // Selecciona todos los datos de la vista
    $query = mysqli_query($con, $sql);

    $array = array();   // Inicializa un arreglo para almacenar los datos
    while ($fila = mysqli_fetch_object($query)) {   // Recorre cada fila del resultado de la consulta
        array_push($array, $fila);  // Se guardan los registros en un array
    }
    return $array;  // Retorna el arreglo con todos los registros obtenidos
}
