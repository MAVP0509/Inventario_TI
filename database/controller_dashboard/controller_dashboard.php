<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_datos($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = consultar_año_mantenimiento_mayor();
}

print(json_encode($respuesta_servidor));

//*Función que consulta la información por año de mantenimiento/auditoria
function consultar_datos($valores)
{
    include("../conexion.php");

    $anio = $valores->anio;

    //* Obtener regiones dinámicamente
    $sqlRegiones = "SELECT DISTINCT zona FROM vdashmant WHERE anio = '$anio' 
                    UNION 
                    SELECT DISTINCT zona FROM vdashaud WHERE anio = '$anio'
                    ORDER BY zona";
    $queryRegiones = mysqli_query($con, $sqlRegiones);

    $regiones = [];
    $mapaZona = [];

    while ($fila = mysqli_fetch_assoc($queryRegiones)) {
        $zona = $fila['zona'];
        //* Convertir "Región Norte" → "norte"
        $clave = strtolower(str_replace('Región ', '', $zona));
        $regiones[] = $clave;
        $mapaZona[$zona] = $clave;
    }

    //* Construir estructura dinámica
    $data = ['regiones' => $regiones]; //* Lista de regiones disponibles

    foreach ($regiones as $region) {
        $data[$region] = [
            'mantenimiento' => estructuraEstados(),
            'auditoria'     => estructuraEstados()
        ];
    }

    //*Procesar Mantenimiento
    $sqlMantenimiento = "SELECT zona, mes, pendiente, proceso, finalizado, vencido
                         FROM vdashmant
                         WHERE anio = '$anio'";
    $queryMantenimiento = mysqli_query($con, $sqlMantenimiento);

    while ($fila = mysqli_fetch_assoc($queryMantenimiento)) {
        $region = $mapaZona[$fila['zona']] ?? null;
        $indice = (int)$fila['mes'] - 1;

        if (!$region || $indice < 0 || $indice > 11) continue;

        $data[$region]['mantenimiento']['pendiente'][$indice]  = (int)$fila['pendiente'];
        $data[$region]['mantenimiento']['proceso'][$indice]    = (int)$fila['proceso'];
        $data[$region]['mantenimiento']['finalizado'][$indice] = (int)$fila['finalizado'];
        $data[$region]['mantenimiento']['vencido'][$indice]    = (int)$fila['vencido'];
    }

    //* Procesar Auditoría
    $sqlAuditoria = "SELECT zona, mes, pendiente, proceso, finalizado, vencido
                     FROM vdashaud
                     WHERE anio = '$anio'";
    $queryAuditoria = mysqli_query($con, $sqlAuditoria);

    while ($fila = mysqli_fetch_assoc($queryAuditoria)) {
        $region = $mapaZona[$fila['zona']] ?? null;
        $indice = (int)$fila['mes'] - 1;

        if (!$region || $indice < 0 || $indice > 11) continue;

        $data[$region]['auditoria']['pendiente'][$indice]  = (int)$fila['pendiente'];
        $data[$region]['auditoria']['proceso'][$indice]    = (int)$fila['proceso'];
        $data[$region]['auditoria']['finalizado'][$indice] = (int)$fila['finalizado'];
        $data[$region]['auditoria']['vencido'][$indice]    = (int)$fila['vencido'];
    }

    return $data;
}
//*Función para estructurar el arreglo de datos
function estructuraEstados()
{
    //*Estructurar las regiones disponibles con la siguiente estructura
    $ceros = array_fill(0, 12, 0);
    return [
        'pendiente'  => $ceros,
        'proceso'    => $ceros,
        'finalizado' => $ceros,
        'vencido'    => $ceros
    ];
}
//*Función para consultar el último año de mantenimiento/auditoría
function consultar_año_mantenimiento_mayor()
{
    include("../conexion.php");

    $sql = "SELECT MAX(anio) AS anio FROM mantenimiento";

    if (!$query = mysqli_query($con, $sql)) {
        return (['error' => 'Fallo del servdor']);
    }

    $anio = mysqli_fetch_object($query);
    return $anio;
}
