<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_distintos($clientejson);
}

print(json_encode($respuesta_servidor));

function consultar_distintos($valores)
{
    include("../conexion.php");
    //Validación para evitar inyecciones
    $tabla = mysqli_real_escape_string($con, $valores->tabla ?? '');
    $campo = mysqli_real_escape_string($con, $valores->campo ?? '');
    $id = isset($valores->id) ? mysqli_real_escape_string($con, $valores->id) : null;
    // var_dump($id);

    if ($id !== null) {
        $sql = "SELECT DISTINCT * FROM `$tabla` WHERE id = '$id' LIMIT 1;";
    } else {
        switch ($campo) {
            case "estatus":
                $datos = [
                    ['id' => 'Asignado', 'estatus' => 'Asignado'],
                    ['id' => 'Bodega', 'estatus' => 'Bodega']
                ];
                return $datos;
            /* case "region":
                $sql = "SELECT DISTINCT `$campo` from `$tabla` WHERE `$campo` <> 'Baja';";
                break; */
            case "zona":
            case "ubicacion":
            case "evento":
                // case "cargo":
                $sql = "SELECT DISTINCT `$campo` FROM `$tabla` WHERE  `$campo` <> 'NA'";
                break;
            default:
                $sql = "SELECT DISTINCT `$campo`,id FROM `$tabla` WHERE  `$campo` <> 'NA' AND habilitado <> 0;";
                break;
        }
    }

    $query = mysqli_query($con, $sql);
    /* if (!$query) {
        throw new Exception("Error en la consulta: " . mysqli_error($con));
    } */

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $id_valor = $fila['id'] ?? $fila[$campo]; // fallback por si no hay 'id'
        $valor = $fila[$campo];
        $datos[] = [
            'id' => $id_valor,
            $campo => $valor
        ];
    }

    return $datos;
}

function insertar_o_obtener_id($con, $tabla, $campo, $valor)
{
    if (ctype_digit($valor)) {
        // Ya es un ID
        return (int)$valor;
    }

    $valor_limpio = mysqli_real_escape_string($con, trim($valor));

    // Verificar si ya existe el valor en la tabla
    $sql_check = "SELECT id FROM $tabla WHERE $campo = '$valor_limpio' LIMIT 1;";
    $result_check = mysqli_query($con, $sql_check);

    if ($row = mysqli_fetch_assoc($result_check)) {
        return (int)$row['id'];
    }

    // Insertar el nuevo valor
    $sql_insert = "INSERT INTO $tabla($campo) VALUES ('$valor_limpio');";
    mysqli_query($con, $sql_insert);

    // Obtener el ID insertado
    $sql_id = "SELECT id FROM $tabla WHERE $campo = '$valor_limpio' LIMIT 1;";
    $result_id = mysqli_query($con, $sql_id);
    $row_id = mysqli_fetch_assoc($result_id);

    return (int)$row_id['id'];
}

?>