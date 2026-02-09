<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_distintos($clientejson);
}else if($clientejson-> accion == 1){
    $respuesta_servidor->resultado = consultar_mantenimientos_vencidos($clientejson);
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
            case "anio_mantenimiento":
                //*Retornara el año actual y el siguiente, si ya existe el año actual, retornara solo el siguiente
                $sql = "SELECT
                          IF(
                            EXISTS (
                              SELECT 1
                              FROM mantenimiento
                              WHERE anio = YEAR(CURDATE())
                            ),
                            YEAR(CURDATE()) + 1,
                            YEAR(CURDATE())
                          ) AS anio_mantenimiento;
                                    
                        ";
                break;
            case "anio_auditoria":
                //*Retornara el año actual y el siguiente, si ya existe el año actual, retornara solo el siguiente
                $sql = "SELECT
                          IF(
                            EXISTS (
                              SELECT 1
                              FROM auditoria
                              WHERE anio = YEAR(CURDATE())
                            ),
                            YEAR(CURDATE()) + 1,
                            YEAR(CURDATE())
                          ) AS anio_auditoria;
                                    
                        ";
                break;
            case "zona":
            case "ubicacion":
            case "evento":
            case "anio":
            case "rol":
            case "region":
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

function consultar_mantenimientos_vencidos(){
    include("../conexion.php");

    $sql = "SELECT COUNT(*) AS total_vencidos FROM mantenimiento WHERE estado = 'Vencido'";
    $query = mysqli_query($con,$sql);
    if($query){
        $result = mysqli_fetch_assoc($query);
        return $result;
    }else{
        return false;
    }
}
?>