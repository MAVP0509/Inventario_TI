<?php

use Dom\Mysql;

header('Content-Type: text/html; charset=UTF-8');
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
    $respuesta_servidor->resultado = consultar_para_resguardo($clientejson);
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = consultar_distintos($clientejson->tabla, $clientejson->campo);
} elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = traspaso($clientejson);
}

print(json_encode($respuesta_servidor));



function insertar_datos($valores)
{
    include("../conexion.php");

    $registro = date("Y-m-d H:i:s");

    $rubro = verificar_nuevos_id($valores->rubro);
    $val_rubro;
    if ($rubro === true) {
        $val_rubro = $valores->rubro;
    } else {
        $sql_rubro = "INSERT INTO cat_rubro(rubro) VALUES ('$rubro');";
        //$SQLStatement = "CALL pInsertarCatalogo('$sql_rubro','CAT_Rubro')";
        mysqli_query($con, $sql_rubro);
        $sql_ver_id_rubro = "SELECT id FROM cat_rubro WHERE rubro = '$rubro';";
        $idRub = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_rubro));
        $val_rubro = $idRub['id'];
    }

    $tipo = verificar_nuevos_id($valores->tipo);
    $val_tipo;
    if ($tipo === true) {
        $val_tipo = $valores->tipo;
    } else {
        $sql_tipo = "INSERT INTO cat_tipo(tipo) VALUES ('$tipo');";
        mysqli_query($con, $sql_tipo);
        $sql_ver_id_tipo = "SELECT id FROM cat_tipo WHERE tipo = '$tipo';";
        $idTip = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_tipo));
        $val_tipo = $idTip['id'];
    }

    $marca = verificar_nuevos_id($valores->marca);
    $val_marca;
    if ($marca === true) {
        $val_marca = $valores->marca;
    } else {
        $sql_marca = "INSERT INTO cat_marca(marca) VALUES ('$marca');";
        mysqli_query($con, $sql_marca);
        $sql_ver_id_marca = "SELECT id FROM cat_marca WHERE marca = '$marca';";
        $idMarca = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_marca));
        $val_marca = $idMarca['id'];
    }

    // $usuario = verificar_nuevos_id($valores->usuario);
    $val_usuario;
    // Verifica si se proporcionó un usuario
    if (empty($valores->usuario)) {
        // Usuario vacío, usar el ID 5 por defecto
        $usuario = 5;
    } else {
        // Verifica si el usuario ya existe
        $usuario_check = verificar_nuevos_id($valores->usuario);

        if ($usuario_check === true) {
            // Ya existe, usar el valor original
            $val_usuario = $valores->usuario;
        } else {
            // No existe, insertarlo
            $nombre = mysqli_real_escape_string($con, $usuario_check);
            $cargo = mysqli_real_escape_string($con, $valores->cargo);

            $sql_insert = "INSERT INTO cat_usuarios(nombre, cargo) VALUES ('$nombre', '$cargo');";
            mysqli_query($con, $sql_insert);

            // Obtener el ID insertado
            $sql_get_id = "SELECT id FROM cat_usuarios WHERE nombre = '$nombre' AND cargo = '$cargo';";
            $result = mysqli_query($con, $sql_get_id);
            $idUsuario = mysqli_fetch_assoc($result);
            $val_usuario = $idUsuario['id'];
        }

        // Asignar valor final a $usuario
        $usuario = $val_usuario;
    }

    $val_estatus = empty($valores->usuario) ? 'Bodega' : 'Asignado';
    $val_imei = empty($valores->imei) ? 'NA' : $valores->imei;
    $val_linea = empty($valores->linea) ? 'NA' : $valores->linea;
    // $usuario = empty($valores->usuario) ? '5' : $val_usuario;
    $val_tag = empty($valores->tag) ? 'NA' : $valores->tag;
    $val_af = empty($valores->af) ? 'NA' : $valores->af;

    if ($valores->num_serie != "") {
        $sql_num = "SELECT * FROM inventario_ti_sur WHERE num_serie = '$valores->num_serie'";
        //var_dump($sql_num);
        $query_num = mysqli_query($con, $sql_num);

        /* $sql = "INSERT INTO inventario_ti_sur(zona, fk_rubro, af, fk_tipo, fk_marca, modelo, num_serie, ubicacion, tag, fk_usuario, fecha_entrega, imei,estatus) 
        VALUES ('$valores->zona', '$val_rubro','$val_af','$val_tipo','$val_marca','$valores->modelo', '$valores->num_serie', 
        '$valores->ubicacion', '$val_tag', '$valores->usuario', '$registro', 'NA', '$val_estatus');"; */
        
        $sql = 'INSERT INTO inventario_ti_sur(zona, fk_rubro, af, fk_tipo, fk_marca, modelo, num_serie, ubicacion, tag, fk_usuario, fecha_entrega, imei, linea, estatus) 
        VALUES ("' . $valores->zona . '","' . $val_rubro . '","' . $val_af . '","' . $val_tipo . '","' . $val_marca . '","' . $valores->modelo . '","' . $valores->num_serie . '","' . $valores->ubicacion . '",
        "' . $val_tag . '","' . $usuario . '", "' . $registro . '", "' . $val_imei . '", "' . $val_linea . '", "' . $val_estatus . '")';
        //var_dump($sql);
        $query = mysqli_query($con, $sql);

        $sql_select = "SELECT num_serie, 
                    fk_usuario, zona, ubicacion, af,
                    fk_rubro,
                    fk_tipo, 
                    fk_marca, 
                    modelo,
                    tag,
                    imei,
                    linea, 
                    fecha_entrega 
                FROM inventario_ti_sur 
                WHERE 
                    num_serie = '$valores->num_serie'";
        $query_select = mysqli_query($con, $sql_select);
        $resultado = mysqli_fetch_assoc($query_select);
        //$SQLStatement = "CALL pInsertarCatalogo('$sql','Insrt_Inventario')";
        if (mysqli_num_rows($query_num) > 0) {
            echo json_encode(["resultado" => false, "mensaje" => "Número de serie duplicado"]);
            exit;
        } else {
            return [
                'exitoso' => $query,
                'insercion' => $resultado,
            ];
        }
    } else {
        return [
                'exitoso' => $query,
                'inserción' => $resultado,
            ];
    }
}

function editar_datos($valores)
{
    include("../conexion.php");
    //$zona = 'Base Operativa Región Sur';
    $sql_select = "SELECT num_serie, 
                    fk_usuario, 
                    zona, 
                    ubicacion, 
                    af,
                    fk_rubro,
                    fk_tipo, 
                    fk_marca, 
                    modelo,
                    tag,
                    imei,
                    linea, 
                    fecha_entrega 
                FROM inventario_ti_sur 
                WHERE 
                    id = '$valores->id'";

    $query_select = mysqli_query($con, $sql_select);
    $antes =  mysqli_fetch_assoc($query_select);

    $rubro = verificar_nuevos_id($valores->rubro);
    $val_rubro;
    if ($rubro === true) {
        $val_rubro = $valores->rubro;
    } else {
        $sql_rubro = "INSERT INTO cat_rubro(rubro) VALUES ('$rubro');";
        mysqli_query($con, $sql_rubro);
        $sql_ver_id_rubro = "SELECT id FROM cat_rubro WHERE rubro = '$rubro';";
        $idRub = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_rubro));
        $val_rubro = $idRub['id'];
    }

    $tipo = verificar_nuevos_id($valores->tipo);
    $val_tipo;
    if ($tipo === true) {
        $val_tipo = $valores->tipo;
    } else {
        $sql_tipo = "INSERT INTO cat_tipo(tipo) VALUES ('$tipo');";
        mysqli_query($con, $sql_tipo);
        $sql_ver_id_tipo = "SELECT id FROM cat_tipo WHERE tipo = '$tipo';";
        $idTip = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_tipo));
        $val_tipo = $idTip['id'];
    }

    $marca = verificar_nuevos_id($valores->marca);
    $val_marca;
    if ($marca === true) {
        $val_marca = $valores->marca;
    } else {
        $sql_marca = "INSERT INTO cat_marca(marca) VALUES ('$marca');";
        mysqli_query($con, $sql_marca);
        $sql_ver_id_marca = "SELECT id FROM cat_marca WHERE marca = '$marca';";
        $idMarca = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_marca));
        $val_marca = $idMarca['id'];
    }

    $sql = "UPDATE inventario_ti_sur SET zona = '$valores->zona', fk_rubro = '$val_rubro', af = '$valores->af', fk_tipo ='$val_tipo', fk_marca = '$val_marca', modelo = '$valores->modelo',
    num_serie = '$valores->num_serie', ubicacion = '$valores->ubicacion', tag = '$valores->tag', imei = '$valores->imei', linea = '$valores->linea', fk_usuario = '$valores->usuario' WHERE id = '$valores->id';";
    //var_dump($sql);
    $result = mysqli_query($con, $sql);

    $sql_select_nuevo = "SELECT num_serie, 
                                fk_usuario, 
                                zona, 
                                ubicacion, 
                                af, 
                                fk_rubro, 
                                fk_tipo, 
                                fk_marca, 
                                modelo, 
                                tag, 
                                imei, 
                                linea, 
                                fecha_entrega 
                         FROM inventario_ti_sur 
                         WHERE id = '$valores->id'";
    $query_select_nuevo = mysqli_query($con, $sql_select_nuevo);
    $nuevo = mysqli_fetch_assoc($query_select_nuevo);

    return [
        'exito' => $result,
        'anterior' => $antes,
        'nuevo' => $nuevo
    ];
}

function consultar_datos()
{
    include("../conexion.php");
    $sql = "SELECT * FROM  vinventario_ti_sur;";
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
    //var_dump($valores);
    $registro = date("Y-m-d H:i:s");

    if (is_array($valores->id)) { // Verifica si $valores->id es un array

        $ids = implode(",", array_map('intval', $valores->id)); // Convierte el array de IDs en una lista separada por comas

        $sql_datos = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega FROM inventario_ti_sur WHERE id IN ($ids)";

        $query = mysqli_query($con, $sql_datos);

        $datos = [];
        while ($fila = mysqli_fetch_object($query)) {
            array_push($datos, $fila);
        }

        $sql = "UPDATE inventario_ti_sur SET estatus = 'Baja', fecha_entrega = '$registro' WHERE id IN ($ids);"; // Consulta sql_datos usando IN para eliminar múltiples registros
        mysqli_query($con, $sql);
        return $datos;
    } else {

        $sql = "UPDATE inventario_ti_sur SET estatus = 'Baja', fecha_entrega = '$registro' where id='$valores->id';";
        mysqli_query($con, $sql);

        $sql_num2 = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega FROM inventario_ti_sur WHERE id = '$valores->id'";
        $query_num2 = mysqli_query($con, $sql_num2);

        $datos = [];
        while ($fila = mysqli_fetch_object($query_num2)) {
            array_push($datos, $fila);
        }
        return $datos;
    }
}


function consultar_para_resguardo($valores)
{
    include("../conexion.php");
    $sql = "call sp_info_resguardo('$valores->usuario');";
    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $datos[] = $fila;
    }
    mysqli_free_result($query);
    mysqli_next_result($con);

    $datos[0]['comentario'] = $valores->comentario ?? '';
    $datos[0]['fecha'] = $valores->fecha ?? '';
    $datos[0]['area'] = $valores->area ?? '';
    $datos[0]['ubicacion'] = $valores->ubicacion ?? '';
    $datos[0]['userPemex'] = $valores->userPemex ?? '';
    $datos[0]['userPemexCargo'] = $valores->userPemexCargo ?? '';

    $sql_supervisor = "SELECT * FROM supervisor WHERE region = '$valores->region' AND  habilitado = 1;";
    //  var_dump($sql_supervisor);
    $query2 = mysqli_query($con, $sql_supervisor);

    $supervisor = [];
    while ($row = mysqli_fetch_assoc($query2)) {
        $supervisor[] = $row;
    }

    $datos[0]['supervisor'] = $supervisor[0]['nombre'];
    $datos[0]['cargo'] = $supervisor[0]['cargo'];
    $datos[0]['region'] = $supervisor[0]['region'];

    //Actualizando la fecha de entrega de todos los equipos del resguardo
    $sql_fecha_update = "UPDATE inventario_ti_sur SET fecha_entrega = '$valores->fecha' where fk_usuario = '$valores->usuario'";
    mysqli_query($con, $sql_fecha_update);


    return $datos;
}

function consultar_distintos($tabla, $campo)
{
    include("../conexion.php");
    //Validación para evitar inyecciones
    $tabla = mysqli_real_escape_string($con, $tabla);
    $campo = mysqli_real_escape_string($con, $campo);

    // TODO: Conservar

    /* if ($campo === "region" || $campo === "estatus") {
        $num = 1;
        $sql = "SELECT DISTINCT `$campo` from `$tabla` WHERE `$campo` <> 'Baja';";
        $query = mysqli_query($con, $sql);
        //var_dump($sql);
        $datos = [];

        while ($fila = mysqli_fetch_assoc($query)) {
            $datos[] = [
                'id' => $fila[$campo],
                $campo => $fila[$campo]
            ];
            $num++;
        }

        return $datos;
    } else {
        //Validación para evitar inyecciones
        $tabla = mysqli_real_escape_string($con, $tabla);
        $campo = mysqli_real_escape_string($con, $campo);

        $sql = "SELECT DISTINCT `$campo`,id FROM `$tabla` WHERE  `$campo` <> 'NA' AND habilitado <> 0;";
        $query = mysqli_query($con, $sql);

        $datos = [];
        while ($fila = mysqli_fetch_assoc($query)) {
            $id = $fila['id'];
            $valor = $fila[$campo];
            $datos[] = [
                'id' => $id,
                $campo => $valor
            ];
        }
        //var_dump($datos);
        return $datos;
    } */

    switch ($campo) {
        case "region":
        case "estatus":
            $sql = "SELECT DISTINCT `$campo` from `$tabla` WHERE `$campo` <> 'Baja';";
            break;
        case "zona":
        case "ubicacion":
        case "evento":
            $sql = "SELECT DISTINCT `$campo` FROM `$tabla` WHERE  `$campo` <> 'NA'";
            break;
        default:
            $sql = "SELECT DISTINCT `$campo`,id FROM `$tabla` WHERE  `$campo` <> 'NA' AND habilitado <> 0;";
            break;
    }

    $query = mysqli_query($con, $sql);
    if (!$query) {
        throw new Exception("Error en la consulta: " . mysqli_error($con));
    }

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        $id = $fila['id'] ?? $fila[$campo]; // fallback por si no hay 'id'
        $valor = $fila[$campo];
        $datos[] = [
            'id' => $id,
            $campo => $valor
        ];
    }

    return $datos;
}

function verificar_nuevos_id($valor)
{
    if (ctype_digit($valor)) {
        // Es un string de solo dígitos: probablemente un ID existente
        return true;
    } else {
        // No es un número válido: el usuario ingresó una nueva opción
        $nuevo_rubro = trim($valor);
        return $nuevo_rubro;
    }
}

function traspaso($valores)
{

    include("../conexion.php");
    $fecha = date('Y-m-d H:i:s');
    $usuario = '5';
    $datos = [];
    $nuevo = [];
    if (is_array($valores->id)) {
        $ids = implode(",", array_map('intval', $valores->id));
        $sql = "SELECT num_serie, 
                    fk_usuario, 
                    zona, 
                    ubicacion, 
                    af,
                    fk_rubro,
                    fk_tipo, 
                    fk_marca, 
                    modelo,
                    imei,
                    linea,
                    tag, 
                    fecha_entrega 
                FROM inventario_ti_sur 
                WHERE 
                    id IN ($ids)";

        $query = mysqli_query($con, $sql);

        while ($fila = mysqli_fetch_assoc($query)) {
            array_push($datos, $fila);
        }

        if ($valores->estatus == 'Bodega') {
            $sql_datos = "UPDATE inventario_ti_sur SET estatus = '$valores->estatus', fk_usuario = '$usuario', fecha_entrega = '$fecha' WHERE id IN ($ids)";
        } else {
            $sql_datos = "UPDATE inventario_ti_sur SET estatus = '$valores->estatus', fk_usuario = '$valores->usuario', fecha_entrega = '$fecha' WHERE id IN ($ids)";
        }
        mysqli_query($con, $sql_datos);

        $query_nuevo = mysqli_query($con, $sql);
        while ($fila = mysqli_fetch_assoc($query_nuevo)) {
            array_push($nuevo, $fila);
        }
        // var_dump($sql_datos);
        return [
            'anterior' => $datos,
            'nuevo' => $nuevo
        ];
    } else {
        $sql = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega FROM inventario_ti_sur WHERE id = '$valores->id'";
        $query = mysqli_query($con, $sql);
        $datos = [];
        while ($fila = mysqli_fetch_assoc($query)) {
            $datos[] = $fila;
        }

        return $datos;
    }
}
