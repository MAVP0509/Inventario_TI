<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_datos($clientejson);
}

print(json_encode($respuesta_servidor));

function consultar_datos($valores)
{
    include("../conexion.php");

    $anio = date('Y');
    $sqlMantenimiento = "SELECT * FROM vmantenimiento WHERE anio='$anio'";
    $sqlAuditoria = "SELECT * FROM vauditoria WHERE anio='$anio'";
    $queryMantenimiento;
    $queryAuditoria = mysqli_query($con, $sqlAuditoria);

    while($fila = mysqli_query($con, $sqlMantenimiento)){
    $queryMantenimiento[$fila];
    }

    $infoMantenimiento = mysqli_fetch_assoc($queryMantenimiento);
    $infoAuditoria = mysqli_fetch_assoc($queryAuditoria);

    $info = [
        'norte' => [
            'mantenimiento' => [],
            'auditoria' => []
        ],
        'sur' => [
            'mantenimiento' => [],
            'auditoria' => []
        ],
        'tampico' => [
            'mantenimiento' => [],
            'auditoria' => []
        ]
    ];
    $estatus = ['pendiente', 'proceso', 'finalizado', 'vencido'];

    foreach ($info as $region => &$proceso) {
        foreach ($proceso as $tipo => &$estado) {

        }
    }

    //*Romper la referencia de los foreach
    unset($proceso);
    unset($estado);
    return $infoMantenimiento; 
    
}
