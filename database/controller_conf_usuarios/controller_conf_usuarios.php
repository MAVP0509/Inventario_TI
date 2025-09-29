<?php
//TODO Consultas a la bd realizadas en la tabla catálogo de usuarios de la empresa

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = insertar_usuarios($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = editar_usuarios($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = consultar_usuarios($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = eliminar_usuarios($clientejson);
}

print(json_encode($respuesta_servidor)); //? envía la respuesta de la base de datos a javascript


//* Creación de un nuevo usuario
function insertar_usuarios($valores)
{
    include("../conexion.php");

    $nombre = mysqli_real_escape_string($con, $valores->nombre ?? '');
    $cargo = mysqli_real_escape_string($con, $valores->cargo ?? '');
    $region = mysqli_real_escape_string($con, $valores->region ?? '');
    $correo = mysqli_real_escape_string($con, isset($valores->correo) ? $valores->nombre : '@diavaz.com');

    // $nv_cargo = insertar_o_obtener_id($con, 'cat_usuario', 'cargo');

    $sql = "INSERT INTO cat_usuarios(nombre,cargo, region, correo_usuario, habilitado) VALUES ('$nombre','$cargo', '$region', '$correo', 1);";

    $sql_val_usuario = "SELECT * FROM cat_usuarios WHERE nombre = '$valores->nombre'";
    if (mysqli_query($con, $sql_val_usuario)->num_rows > 0) {
        return "Este usuario ya existe";
    } else {
        return mysqli_query($con, $sql);
    }
}

//* Edita un usuario 
function editar_usuarios($valores)
{
    include("../conexion.php");
    $nombre = mysqli_real_escape_string($con, $valores->nombre ?? '');
    $cargo = mysqli_real_escape_string($con, $valores->cargo ?? '');
    $region = mysqli_real_escape_string($con, $valores->region ?? '');
     $correo = mysqli_real_escape_string($con, $valores->correo ?? '');
    
    $sql = "UPDATE cat_usuarios SET nombre = '$nombre',cargo='$cargo', region = '$region', correo_usuario ='$correo' WHERE id='$valores->id';";
    return mysqli_query($con, $sql);
}

//* Consulta los usuarios  para mostrarlos en el programa
function consultar_usuarios()
{
    include("../conexion.php");
    $sql = "SELECT * FROM  cat_usuarios WHERE nombre <> 'NA' AND habilitado = 1";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);  //* Se guardan los registros en un array
    }
    return $array;
}

//* "Eliminación" de usuarios
function eliminar_usuarios($valores)
{
    include("../conexion.php");


    foreach ($valores->id as $id) {
        $id = intval($id); //* Asegura que $id sea número
        $sql_val = "SELECT * FROM inventario_ti_sur WHERE fk_usuario = '$id'";
        $res = mysqli_query($con, $sql_val);

        if ($res && $res->num_rows > 0) {   //* Valida si alguno tiene un equipo asignado
            return "Uno o más usuarios no pueden ser eliminados. Uno o más equipos lo tienen asignado";
        }
    }

    $ids = implode(",", array_map('intval', $valores->id)); //* Convierte el array de IDs en una lista separada por comas
    $sql = "UPDATE cat_usuarios SET habilitado = 0 WHERE id IN ($ids);"; //* Consulta sql usando IN para eliminar múltiples registros
    return mysqli_query($con, $sql);
}