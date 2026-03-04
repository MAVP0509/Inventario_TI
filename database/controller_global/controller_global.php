<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_distintos($clientejson);
} else if ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = consultar_mantenimientos_vencidos($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = consultar_auditorias_vencidos($clientejson);
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
                $sql = "SELECT YEAR(CURDATE()) AS anio_mantenimiento
                        UNION ALL
                        SELECT YEAR(CURDATE()) + 1;               
                        ";
                break;
            case "anio_auditoria":
                //*Retornara el año actual y el siguiente, si ya existe el año actual, retornara solo el siguiente
                $sql = "SELECT YEAR(CURDATE()) AS anio_auditoria
                        UNION ALL
                        SELECT YEAR(CURDATE()) + 1;       
                        ";
                break;
            //*Opción para el select de cargo que no tenga que sincronizarse con su usuario
            case "cargo_sin_sincronizar":
                $sql = "SELECT DISTINCT cargo AS cargo_sin_sincronizar FROM `$tabla` WHERE  cargo <> 'NA' ";
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
            case 'nombre':
                if (isset($valores->filtro) && $valores->filtro == 'bodega') {
                    // Solo usuarios que tengan "(Bodega)" en el nombre
                    $sql = "SELECT DISTINCT nombre, id FROM `$tabla` WHERE nombre LIKE '%(Bodega)%' AND habilitado <> 0";
                } else {
                    $sql = "SELECT DISTINCT `$campo`, id FROM `$tabla` WHERE `$campo` <> 'NA' AND habilitado <> 0";
                }
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

function consultar_mantenimientos_vencidos()
{
    include("../conexion.php");

    $sql = "SELECT COUNT(*) AS total_vencidos FROM mantenimiento WHERE estado = 'Vencido'";
    $query = mysqli_query($con, $sql);
    if ($query) {
        $result = mysqli_fetch_assoc($query);
        return $result;
    } else {
        return false;
    }
}

function consultar_auditorias_vencidos()
{
    include("../conexion.php");

    $sql = "SELECT COUNT(*) AS total_vencidos FROM auditoria WHERE estado = 'Vencido'";
    $query = mysqli_query($con, $sql);
    if ($query) {
        $result = mysqli_fetch_assoc($query);
        return $result;
    } else {
        return false;
    }
}
