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
    $respuesta_servidor->resultado = consultar_para_resguardo($clientejson);
} elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = consultar_distintos($clientejson->tabla, $clientejson->campo);
} elseif ($clientejson->accion == 7) {
    $respuesta_servidor->resultado = registrar_historico($cliente);
}

print(json_encode($respuesta_servidor));



function insertar_datos($valores){
    include("../conexion.php");
    
    $registro = date("Y-m-d H:i:s");

    if ($valores->num_serie != "") {
        $sql_num = "SELECT * FROM inventario_ti_sur WHERE num_serie = '$valores->num_serie'";
        //var_dump($sql_num);
        $query_num = mysqli_query($con, $sql_num);

        $sql = "INSERT INTO inventario_ti_sur(zona, fk_rubro, af, fk_tipo, fk_marca, modelo, num_serie, ubicacion, tag, fk_usuario, fecha_entrega, habilitado) 
        VALUES ('$valores->zona', '$valores->rubro','$valores->af','$valores->tipo','$valores->marca','$valores->modelo', '$valores->num_serie', 
        '$valores->ubicacion', '$valores->tag', '$valores->usuario', '$registro',1);";
        //$query = mysqli_query($con, $sql);|
    
        if (mysqli_num_rows($query_num) > 0) {
            echo json_encode(["resultado" => false, "mensaje" => "Número de serie duplicado"]);
            exit;
        } else {
            return mysqli_query($con, $sql);
        }
    } else {
        $result = mysqli_query($con, $sql);
        if($result){
            $evento = "Nuevo registro";
            registrar_historico($valores->num_serie, $evento);
        }
        return $result;
    }
}

function editar_datos($valores) {
    include("../conexion.php");
    
    //$zona = 'Base Operativa Región Sur';
    $rubro = verificar_nuevos_id($valores->rubro);
    $val_rubro;
    if ($rubro === true){
        $val_rubro = $valores->rubro;
    }else{
        $sql_rubro = "INSERT INTO cat_rubro(rubro) VALUES ('$rubro');";
        mysqli_query($con,$sql_rubro);
        $sql_ver_id_rubro = "SELECT id FROM cat_rubro WHERE rubro = '$rubro';";
        $idRub = mysqli_fetch_assoc(mysqli_query($con,$sql_ver_id_rubro));
        $val_rubro = $idRub['id'];
    }

    $tipo = verificar_nuevos_id($valores->tipo);
    $val_tipo;
    if ($tipo === true){
        $val_tipo = $valores->tipo;
    }else{
        $sql_tipo = "INSERT INTO cat_tipo(rubro) VALUES ('$tipo');";
        mysqli_query($con,$sql_tipo);
        $sql_ver_id_tipo = "SELECT id FROM cat_tipo WHERE tipo = '$tipo';";
        $idTip = mysqli_fetch_assoc(mysqli_query($con,$sql_ver_id_tipo));
        $val_tipo = $idTip['id'];
    }

    $marca = verificar_nuevos_id($valores->marca);
    $val_marca;
    if ($marca === true){
        $val_marca = $valores->marca;
    }else{
        $sql_marca = "INSERT INTO cat_marca(marca) VALUES ('$marca');";
        mysqli_query($con,$sql_marca);
        $sql_ver_id_marca = "SELECT id FROM cat_marca WHERE marca = '$marca';";
        $idMarca = mysqli_fetch_assoc(mysqli_query($con,$sql_ver_id_marca));
        $val_marca = $idMarca['id'];
    }

    /* $usuario = verificar_nuevos_id($valores->usuario);
    $val_usuario;
    if ($usuario === true){
        $val_usuario = $valores->usuario;
        $sql_update_usu = "UPDATE cat_usuarios SET cargo = '$valores->posicion' WHERE id = '$valores->usuario';";
        mysqli_query($con,$sql_update_usu);
    }else{
        $sql_usuario = "INSERT INTO cat_usuarios(nombre,cargo) VALUES ('$usuario','$valores->posicion');";
        mysqli_query($con,$sql_usuario);
        $sql_ver_id_usuario = "SELECT id FROM cat_usuario WHERE usuario = '$usuario';";
        $idUsu = mysqli_fetch_assoc(mysqli_query($con,$sql_ver_id_usuario));
        $val_usuario = $idUsu['id'];
    } */

    $sql = "UPDATE inventario_ti_sur SET zona = '$valores->zona', fk_rubro = '$val_rubro', af = '$valores->af', fk_tipo ='$val_tipo', fk_marca = '$val_marca', 
    num_serie = '$valores->num_serie', ubicacion = '$valores->ubicacion', tag = '$valores->tag', fk_usuario = '$valores->usuario', fecha_entrega = '$valores->fecha_entrega' WHERE id = '$valores->id';";
    //var_dump($sql);
    $result = mysqli_query($con, $sql);

    if($result){
        $evento = "Edición de registro";
        registrar_historico($valores->num_serie, $evento);
    }
    return $result;
}

function consultar_datos() {
    include("../conexion.php");
    $sql = "SELECT * FROM  vinventario_ti_sur WHERE habilitado = 1";
    $query = mysqli_query($con, $sql);
    $array = array();
    while ($fila = mysqli_fetch_object($query)) {
        array_push($array, $fila);
    }
    return $array;
}


function desactivar_datos($valores) {
    include("../conexion.php");
    
    if (is_array($valores->id)) { // Verifica si $valores->id es un array
        $ids = implode(",", array_map('intval', $valores->id)); // Convierte el array de IDs en una lista separada por comas
        $sql = "UPDATE inventario_ti_sur SET habilitado = 0 WHERE id IN ($ids);"; // Consulta sql usando IN para eliminar múltiples registros
        //var_dump($sql);
        $result = mysqli_query($con, $sql);

        if($result){
            foreach($valores->id as $id){
                registrar_historico($id);
            }
        }
        return $result;
    } else {
        $sql = "UPDATE inventario_ti_sur SET habilitado = 0 where id='$valores->id';";
        $result = mysqli_query($con, $sql);

        if ($result){
            $evento = "Desactivación de registro";
            registrar_historico($valores->num_serie, $evento);
        }
        return $result;
    }
}

function eliminar_datos($valores) {
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

function consultar_para_resguardo($valores) {
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

    $sql_supervisor = "SELECT * FROM supervisor WHERE region = '$valores->region' AND  habilitado = 1";
    $query2 = mysqli_query($con,$sql_supervisor);

    $supervisor = [];
    while($row = mysqli_fetch_assoc($query2)){
        $supervisor[] = $row;
    }

    $datos[0]['supervisor'] = $supervisor[0]['nombre'];
    $datos[0]['cargo'] = $supervisor[0]['cargo'];
    $datos[0]['region'] = $supervisor[0]['region'];

    //Actualizando la fecha de entrega de todos los equipos del resguardo
    $sql_fecha_update = "UPDATE inventario_ti_sur SET fecha_entrega = '$valores->fecha' where usuario = '$valores->usuario'";
    mysqli_query($con,$sql_fecha_update);


    return $datos;
}

function consultar_rubro() {
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
function consultar_tipo() {
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

function consultar_distintos($tabla, $campo){
    include("../conexion.php");
    //Validación para evitar inyecciones
    $tabla = mysqli_real_escape_string($con, $tabla);
    $campo = mysqli_real_escape_string($con, $campo);

    $sql = "SELECT DISTINCT id, `$campo` FROM `$tabla` WHERE `$campo` IS NOT NULL AND `$campo` <> '' AND '$campo' NOT LIKE 'NA';";
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
}


function verificar_nuevos_id($valor) {
    if (ctype_digit($valor)) {
        // Es un string de solo dígitos: probablemente un ID existente
        return true;
    } else {
        // No es un número válido: el usuario ingresó una nueva opción
        $nuevo_rubro = trim($valor);
        return $nuevo_rubro;
    }
}
function registrar_historico($valores){
    include("../conexion.php");

    $fecha_evento = date("Y:m:d H:i:s");
    $sql = "INSERT INTO historico(fecha_evento, usuario, evento, num_serie, tipo) VALUES ('$fecha_evento', '$valores->usuario', '$valores->evento', '$valores->num_serie', '$valores->tipo')";
    $query = mysqli_query($con, $sql);

    if ($query) {
        return ["mensaje" => "Evento registrado exitosamente."];
    } else {
        return ["mensaje" => "Error al registrar evento: .".mysqli_error($con)];
    }
}

?>
