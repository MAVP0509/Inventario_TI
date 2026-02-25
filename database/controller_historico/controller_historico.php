<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_historico($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = registrar_historico($clientejson);
}

print(json_encode($respuesta_servidor));

function registrar_historico($valores)
{
    include("../conexion.php");
    // var_dump($valores);
    $fecha_evento = date("Y:m:d H:i:s");
    // Si los datos vienen como objeto, se convierte en arreglo
    if (isset($valores->datos) && is_object($valores->datos)) {
        $valores->datos = [$valores->datos];
    }
    // Si no existen datos válidos, termina la función
    if (!isset($valores->datos) || !is_array($valores->datos)) {
        return false;
        error_log("registrar_historico(): datos no válidos o inexistentes");
    }
    $resultados = [];   // Arreglo donde se almacenará el resultado de cada inserción
    // Recorre todos los registros a guardar en histórico
    foreach ($valores->datos as $datos) {
        $estatus = ($datos->fk_usuario == "5") ? 'Bodega' : 'Asignado'; // Determina el estatus según el usuario asignado; si fk_usuario es 5 → Bodega, de lo contrario → Asignado
        $fecha_entrega = !empty($datos->fecha_entrega) ? date("Y-m-d H:i:s", strtotime($datos->fecha_entrega)) : date("Y-m-d H:i:s");   // Determina la fecha de entrega
        // Se construye la sentencia SQL de inserción
        $sql = "INSERT INTO historico(fecha_evento, usuario_sesion, evento, num_serie, usuario, zona, ubicacion, af, rubro, tipo, marca, modelo, tag, imei, linea, fecha_registro, estatus) 
            VALUES ('$fecha_evento',
                    '$valores->usuario_sesion', 
                    '$valores->evento', 
                    '$datos->num_serie', 
                    '$datos->fk_usuario', 
                    '$datos->zona', 
                    '$datos->ubicacion', 
                    '$datos->af', 
                    '$datos->fk_rubro', 
                    '$datos->fk_tipo', 
                    '$datos->fk_marca', 
                    '$datos->modelo', 
                    '$datos->tag',
                    '$datos->imei',
                    '$datos->linea', 
                    '$fecha_entrega',
                    '$estatus')";
        // Ejecuta la consulta y guarda el resultado
        $resultados[] = mysqli_query($con, $sql);
    }
    // Retorna los resultados de las inserciones
    return $resultados;
}

function consultar_historico($valores)
{
    include("../conexion.php");

    $sql = "SELECT * FROM vhistorico";  // Selecciona todos los registros de la vista
    // Verifica si se recibió un número de serie como filtro
    if (!empty($valores->num_serie)) {
        $sql .= " WHERE num_serie = '$valores->num_serie'"; // Agrega una condición WHERE para filtrar por número de serie
    }
    // Verifica si se recibieron ambas fechas para filtrar por rango
    if (!empty($valores->fecha_inicio) && !empty($valores->fecha_fin)) {
        if (strpos($sql, 'WHERE') !== false) {  // Comprueba si la consulta ya tiene una cláusula WHERE
            $sql .= " AND DATE(fecha_evento) BETWEEN '$valores->fecha_inicio' AND '$valores->fecha_fin'";
        } else {
            $sql .= " WHERE DATE(fecha_evento) BETWEEN '$valores->fecha_inicio' AND '$valores->fecha_fin'";
        }
    }
    // Verifica si se recibió un evento como filtro
    if (!empty($valores->evento)) {
        if ($valores->evento != "Todo") {
            $sql .= " AND evento = '$valores->evento'";
        }
    }
    // Verifica si se solicitó limitar la cantidad de registros
    if (!empty($valores->limite) && $valores->limite === true) {
        $sql .= " LIMIT 100";
    }

    $query = mysqli_query($con, $sql);   // Ejecuta la consulta SQL en la base de datos
    $datos = [];    // Inicializa un arreglo para almacenar los resultados

    while ($fila = mysqli_fetch_assoc($query)) {    // Recorre cada fila del resultado de la consulta
        $datos[] = $fila;   // Agrega cada fila al arreglo de resultados
    }
    return $datos;  // Retorna el arreglo con todos los registros obtenidos
}
