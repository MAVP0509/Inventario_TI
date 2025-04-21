<?php

header('Content_Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = insertar_datos($clientejson);
} elseif($clientejson->accion == 1) {
    $respuesta_servidor->resultado = editar_datos($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = consultar_datos($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = desactivar_datos($clientejson);
}elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = eliminar_datos($clientejson);
}elseif($clientejson->accion == 5) {
    $respuesta_servidor->resultado = consultar_usuarios($clientejson);
}elseif($clientejson->accion == 6) {
    $respuesta_servidor->resultado = consultar_por_usuario($clientejson);
}

print(json_encode($respuesta_servidor));



function insertar_datos($valores) {
    include("../conexion.php");
    $registro = date("Y-m-d H:i:s");
    $sql = "INSERT INTO inventario_ti_sur(zona, rubro, af, tipo, marca, modelo, num_serie, ubicacion, tag, usuario, posicion, fecha_entrega, habilitado) 
    VALUES ('$valores->zona', '$valores->rubro','$valores->af','$valores->tipo','$valores->marca','$valores->modelo', '$valores->num_serie', 
    '$valores->ubicacion', '$valores->tag', '$valores->usuario', '$valores->posicion', '$registro',1);";
    return mysqli_query($con,$sql);
}

function editar_datos($valores) {
    include("../conexion.php");
    //$zona = 'Base Operativa Región Sur';
    $sql = "UPDATE inventario_ti_sur SET zona = '$valores->zona', rubro = '$valores->rubro', af = '$valores->af', tipo ='$valores->tipo', marca = '$valores->marca', 
    num_serie = '$valores->num_serie', ubicacion = '$valores->ubicacion', tag = '$valores->tag', usuario = '$valores->usuario', 
    posicion = '$valores->posicion', fecha_entrega = '$valores->fecha_entrega' WHERE id = '$valores->id';";
    //var_dump($sql);
    return mysqli_query($con,$sql);
}

function consultar_datos() {
    include("../conexion.php");
    $sql = "SELECT * FROM  inventario_ti_sur WHERE habilitado = 1";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)){
        array_push($array, $fila);
    }
    return $array;
}


function desactivar_datos($valores){
    include("../conexion.php");
    if (is_array($valores->id)) { // Verifica si $valores->id es un array
        $ids = implode(",", array_map('intval', $valores->id)); // Convierte el array de IDs en una lista separada por comas
        $sql = "UPDATE inventario_ti_sur SET habilitado = 0 WHERE id IN ($ids);"; // Consulta sql usando IN para eliminar múltiples registros
        //var_dump($sql);
        return mysqli_query($con, $sql);
    } else {
        $sql="UPDATE inventario_ti_sur SET habilitado = 0 where id='$valores->id';";
        return mysqli_query($con,$sql);
    }
}

function eliminar_datos($valores){
    include("../conexion.php");

    if (is_array($valores->id)) { // Verifica si $valores->id es un array
        $ids = implode(",", array_map('intval', $valores->id)); // Convierte el array de IDs en una lista separada por comas
        $sql = "DELETE FROM inventario_ti_sur WHERE id IN ($ids);"; // Consulta sql usando IN para eliminar múltiples registros
        return mysqli_query($con, $sql);
    } else {
        $sql="DELETE FROM inventario_ti_sur where id='$valores->id';";
        return mysqli_query($con,$sql);
    }
    
}

function consultar_usuarios() {
    include("../conexion.php");
    $sql = "SELECT DISTINCT usuario FROM inventario_ti_sur;";
    $resultado = mysqli_query($con,$sql);
    $datos = [];

    while ($fila = mysqli_fetch_assoc($resultado)) {
        $datos[] = [
            'id' => $fila['usuario'],
            'usuario' => $fila['usuario']

        ];
    }
    return $datos;

}

function consultar_por_usuario($valores) {
    include("../conexion.php");
    
    $sql = "SELECT * FROM inventario_ti_sur WHERE habilitado = 1 AND usuario = '$valores->usuario'";
    $query = mysqli_query($con, $sql);
    
    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = $fila;
    }
    return $datos;
}
?>