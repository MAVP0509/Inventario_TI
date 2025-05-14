<?php
//* Consultas a la bd realizadas en la pestaña de marca

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = insertar_marca($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = editar_marca($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = consultar_marca($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = eliminar_marca($clientejson);
}

print(json_encode($respuesta_servidor)); //? envía la respuesta de la base de datos a javascript


//* Creación de un nuevo marca
function insertar_marca($valores){
    include("../conexion.php");
    $sql = "INSERT INTO cat_marca(marca) VALUES ('$valores->marca');";

    $sql_val_marca = "SELECT * FROM cat_marca WHERE marca = '$valores->marca'";
    if (mysqli_query($con, $sql_val_marca)->num_rows > 0) {
        return "Esta marca ya existe";
    } else {
        return mysqli_query($con, $sql);
    }
}

//* Edita un marca ya existente
function editar_marca($valores){
    include("../conexion.php");
    $sql = "UPDATE cat_marca SET marca='$valores->marca' WHERE id='$valores->id';";
    //var_dump($sql);
    return mysqli_query($con, $sql);
}

//* Consulta los marca de la tabla marca para mostrarlos en el programa
function consultar_marca(){
    include("../conexion.php");
    $sql = "SELECT * FROM  cat_marca WHERE habilitado = 1 AND marca <> 'NA'";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);  //* Se guardan los registros en un array
    }
    return $array;
}

function eliminar_marca($valores)
{
    include("../conexion.php");


    foreach ($valores->id as $id) {
        $id = intval($id); // Seguridad: asegura que sea número
        $sql_val = "SELECT * FROM inventario_ti_sur WHERE fk_marca = '$id'";
        $res = mysqli_query($con, $sql_val);

        if ($res && $res->num_rows > 0) {
            return "Una o más marcas no pueden ser eliminadas. Uno o más equipos la tienen asignada";
        }
    }

    //return $array;
    $ids = implode(",", array_map('intval', $valores->id)); // Convierte el array de IDs en una lista separada por comas
    $sql = "UPDATE cat_marca SET habilitado = 0 WHERE id IN ($ids);"; // Consulta sql usando IN para eliminar múltiples registros
    return mysqli_query($con, $sql);
}