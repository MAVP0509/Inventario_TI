<?php

header('Content_Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = insertar_datos($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = editar_datos($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = consultar_datos($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = desactivar_datos($clientejson);
} elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = eliminar_datos($clientejson);
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = consultar_por_usuario($clientejson);
} elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = consultar_distintos($clientejson->tabla, $clientejson->campo);
}

print(json_encode($respuesta_servidor));



function insertar_datos($valores)
{
    include("../conexion.php");
    $registro = date("Y-m-d H:i:s");

    if ($valores->num_serie != "") {
        $sql_num = "SELECT * FROM inventario_ti_sur WHERE num_serie = '$valores->num_serie'";
        //var_dump($sql_num);
        $query_num = mysqli_query($con, $sql_num);

        $sql = "INSERT INTO inventario_ti_sur(zona, rubro, af, tipo, marca, modelo, num_serie, ubicacion, tag, usuario, posicion, fecha_entrega, habilitado) 
        VALUES ('$valores->zona', '$valores->rubro','$valores->af','$valores->tipo','$valores->marca','$valores->modelo', '$valores->num_serie', 
        '$valores->ubicacion', '$valores->tag', '$valores->usuario', '$valores->posicion', '$registro',1);";
        //$query = mysqli_query($con, $sql);|
    
        if (mysqli_num_rows($query_num) > 0) {
            echo json_encode(["resultado" => false, "mensaje" => "Número de serie duplicado"]);
            exit;
        } else {
            return mysqli_query($con, $sql);
        }
    } else {
        $sql = "INSERT INTO inventario_ti_sur(zona, rubro, af, tipo, marca, modelo, num_serie, ubicacion, tag, usuario, posicion, fecha_entrega, habilitado) 
    VALUES ('$valores->zona', '$valores->rubro','$valores->af','$valores->tipo','$valores->marca','$valores->modelo', '$valores->num_serie', 
    '$valores->ubicacion', '$valores->tag', '$valores->usuario', '$valores->posicion', '$registro',1);";
        //$query = mysqli_query($con, $sql);
        return mysqli_query($con, $sql);
    }
}

function editar_datos($valores)
{
    include("../conexion.php");
    //$zona = 'Base Operativa Región Sur';
    $sql = "UPDATE inventario_ti_sur SET zona = '$valores->zona', rubro = '$valores->rubro', af = '$valores->af', tipo ='$valores->tipo', marca = '$valores->marca', 
    num_serie = '$valores->num_serie', ubicacion = '$valores->ubicacion', tag = '$valores->tag', usuario = '$valores->usuario', 
    posicion = '$valores->posicion', fecha_entrega = '$valores->fecha_entrega' WHERE id = '$valores->id';";
    //var_dump($sql);
    return mysqli_query($con, $sql);
}

function consultar_datos()
{
    include("../conexion.php");
    $sql = "SELECT * FROM  inventario_ti_sur WHERE habilitado = 1";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);
    }
    return $array;
}


function desactivar_datos($valores)
{
    include("../conexion.php");
    if (is_array($valores->id)) { // Verifica si $valores->id es un array
        $ids = implode(",", array_map('intval', $valores->id)); // Convierte el array de IDs en una lista separada por comas
        $sql = "UPDATE inventario_ti_sur SET habilitado = 0 WHERE id IN ($ids);"; // Consulta sql usando IN para eliminar múltiples registros
        //var_dump($sql);
        return mysqli_query($con, $sql);
    } else {
        $sql = "UPDATE inventario_ti_sur SET habilitado = 0 where id='$valores->id';";
        return mysqli_query($con, $sql);
    }
}

function eliminar_datos($valores)
{
    include("../conexion.php");

    if (is_array($valores->id)) { // Verifica si $valores->id es un array
        $ids = implode(",", array_map('intval', $valores->id)); // Convierte el array de IDs en una lista separada por comas
        $sql = "DELETE FROM inventario_ti_sur WHERE id IN ($ids);"; // Consulta sql usando IN para eliminar múltiples registros
        return mysqli_query($con, $sql);
    } else {
        $sql = "DELETE FROM inventario_ti_sur where id='$valores->id';";
        return mysqli_query($con, $sql);
    }
}

function consultar_por_usuario($valores)
{
    include("../conexion.php");
    $sql = "SELECT * FROM inventario_ti_sur WHERE habilitado = 1 AND usuario = '$valores->usuario'
        ORDER BY 
        CASE 
        WHEN tipo = 'laptop' THEN 1
        WHEN tipo = 'desktop' THEN 2
        ELSE 3
        END;";
    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = $fila;
    }

    $datos[0]['comentario'] = $valores->comentario ?? '';
    $datos[0]['fecha'] = $valores->fecha ?? '';

    $sql_fecha_update = "UPDATE inventario_ti_sur SET fecha_entrega = '$valores->fecha' where usuario = '$valores->usuario'";
    mysqli_query($con,$sql_fecha_update);
    return $datos;
}

function consultar_rubro()
{
    include("../conexion.php");
    $sql = "SELECT DISTINCT rubro from inventario_ti_sur;";
    $query = mysqli_query($con, $sql);
    $datos = [];

    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = [
            'id' => $fila['rubro'],
            'rubro' => $fila['rubro']
        ];
    }

    return $datos;
}
function consultar_tipo()
{
    include("../conexion.php");
    $sql = "SELECT DISTINCT tipo from inventario_ti_sur;";
    $query = mysqli_query($con, $sql);
    $datos = [];

    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = [
            'id' => $fila['tipo'],
            'tipo' => $fila['tipo']
        ];
    }

    return $datos;
}

function consultar_distintos($tabla, $campo)
{
    include("../conexion.php");
    //Validación para evitar inyecciones
    $tabla = mysqli_real_escape_string($con, $tabla);
    $campo = mysqli_real_escape_string($con, $campo);

    $sql = "SELECT DISTINCT `$campo` FROM `$tabla` WHERE `$campo` IS NOT NULL AND `$campo` <> '' AND '$campo' NOT LIKE 'NA';";
    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $valor = $fila[$campo];
        $datos[] = [
            'id' => $valor,
            $campo => $valor
        ];
    }

    return $datos;
}
