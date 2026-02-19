<?php

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
} /* elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = consultar_distintos($clientejson);
} */ elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = traspaso($clientejson);
} elseif ($clientejson->accion == 7) {
    $respuesta_servidor->resultado = cargar_resguardo_firmado($clientejson);
} elseif ($clientejson->accion == 8) {
    $respuesta_servidor->resultado = consultar_resguardos_firmados($clientejson);
}

print(json_encode($respuesta_servidor));

function insertar_datos($valores)
{
    include("../conexion.php");
    // include("../controller_global/controller_global.php");

    $registro = date("Y-m-d");  // Fecha actual para registrar
    // Validación/inserción del rubro

    $val_rubro = insertar_o_obtener_id($con, 'cat_rubro', 'rubro', $valores->rubro);
    $val_tipo = insertar_o_obtener_id($con, 'cat_tipo', 'tipo', $valores->tipo);
    $val_marca = insertar_o_obtener_id($con, 'cat_marca', 'marca', $valores->marca);

    // Validación/inserción del usuario
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
    // Asignación de valores por defecto
    $val_estatus = empty($valores->usuario) ? 'Bodega' : 'Asignado';
    $val_imei = empty($valores->imei) ? 'NA' : $valores->imei;
    $val_linea = empty($valores->linea) ? 'NA' : $valores->linea;
    $val_tag = empty($valores->tag) ? 'NA' : $valores->tag;
    $val_af = empty($valores->af) ? 'NA' : $valores->af;
    $val_num_serie = empty($valores->num_serie) ? 'NA' : $valores->num_serie;

    // Validación de duplicado de número de serie
    if ($val_num_serie !== 'NA') {
        $sql_num = "SELECT * FROM inventario_ti_sur WHERE num_serie = '$val_num_serie' AND estatus <> 'Baja'";
        $query_num = mysqli_query($con, $sql_num);

        if ($query_num->num_rows > 0) {
            return ["resultado" => false, "mensaje" => "Número de serie duplicado"];
        }
    }

    $sql = 'INSERT INTO inventario_ti_sur(zona, fk_rubro, af, fk_tipo, fk_marca, modelo, num_serie, ubicacion, tag, fk_usuario, fecha_entrega, imei, linea, estatus) 
        VALUES ("' . $valores->zona . '","' . $val_rubro . '","' . $val_af . '","' . $val_tipo . '","' . $val_marca . '","' . $valores->modelo . '","' . $val_num_serie . '","' . $valores->ubicacion . '",
        "' . $val_tag . '","' . $usuario . '", "' . $registro . '", "' . $val_imei . '", "' . $val_linea . '", "' . $val_estatus . '")';
    //var_dump($sql);
    $query = mysqli_query($con, $sql);

    $sql_select = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, 
                        modelo, tag, imei, linea,  fecha_entrega 
                    FROM inventario_ti_sur 
                    WHERE 
                        num_serie = '$val_num_serie'";

   
    $query_select = mysqli_query($con, $sql_select);
    $resultado = mysqli_fetch_assoc($query_select);
    return [
        'exitoso' => $query,
        'insercion' => $resultado,
    ];
}

function editar_datos($valores)
{
    include("../conexion.php"); // Incluye la conexión a la base de datos
    // Consulta para obtener el estado actual del registro (antes de editar)
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

    $query_select = mysqli_query($con, $sql_select);    // Ejecuta la consulta
    $antes =  mysqli_fetch_assoc($query_select);    // Obtiene el resultado en formato asociativo (registro anterior)
    // Verifica si el rubro ya existe o si debe insertarse uno nuevo
    $rubro = verificar_nuevos_id($valores->rubro);
    $val_rubro;
    if ($rubro === true) {
        $val_rubro = $valores->rubro;
    } else {
        // Si el rubro es nuevo, lo inserta en la tabla correspondiente
        $sql_rubro = "INSERT INTO cat_rubro(rubro) VALUES ('$rubro');";
        mysqli_query($con, $sql_rubro);
        // Obtiene el ID del nuevo rubro insertado
        $sql_ver_id_rubro = "SELECT id FROM cat_rubro WHERE rubro = '$rubro';";
        $idRub = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_rubro));
        $val_rubro = $idRub['id'];
    }
    // Verificación para tipo (igual que con rubro)
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
    // Verificación para marca (igual que con tipo y rubro)
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
    // Verifica si el usuario está definido, de lo contrario asigna ID 5 por defecto
    $val_usuario = empty($valores->usuario) ? '5' : $valores->usuario;
    // Sentencia UPDATE para modificar el registro con los nuevos valores
    $sql = "UPDATE inventario_ti_sur 
            SET zona = '$valores->zona', fk_rubro = '$val_rubro', af = '$valores->af', fk_tipo ='$val_tipo', fk_marca = '$val_marca', modelo = '$valores->modelo', 
            num_serie = '$valores->num_serie', ubicacion = '$valores->ubicacion', tag = '$valores->tag', imei = '$valores->imei', linea = '$valores->linea', fk_usuario = '$val_usuario' 
            WHERE 
                id = '$valores->id';";
    //var_dump($sql);
    $result = mysqli_query($con, $sql); // Ejecuta la actualización
    // Consulta nuevamente el estado actualizado del registro
    $sql_select_nuevo = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro,
                            fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega 
                        FROM
                            inventario_ti_sur 
                        WHERE
                            id = '$valores->id'";
    // Ejecuta la consulta y obtiene el nuevo estado
    $query_select_nuevo = mysqli_query($con, $sql_select_nuevo);
    $nuevo = mysqli_fetch_assoc($query_select_nuevo);
    // Devuelve el resultado del UPDATE y los registros antes/después
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

    $registro = date("Y-m-d");

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

function consultar_para_resguardo($valores)
{
    include("../conexion.php");
    $respuesta = new stdClass();

    if ($valores === 0) {
        // SOLO celular
        $filtro_tipo = "AND ct.tipo LIKE 'telefono celular'";
    } else {
        // OTROS dispositivos (se excluye celular)
        $filtro_tipo = "AND ct.tipo NOT LIKE 'telefono celular'";
    }

    $sql_historico = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega 
                        FROM inventario_ti_sur AS inv
                            INNER JOIN cat_tipo AS ct ON ct.id = inv.fk_tipo
                        WHERE fk_usuario = '$valores->usuario' $filtro_tipo;";
    $query_historico = mysqli_query($con, $sql_historico);
    $historico = array();
    while ($fila = mysqli_fetch_object($query_historico)) {
        array_push($historico, $fila);
    }

    $sql = "call sp_info_resguardo('$valores->usuario');";
    $query = mysqli_query($con, $sql);

    $cel = $valores->cel;

    $datos = [];
    while ($fila = mysqli_fetch_assoc($query)) {
        //$datos[] = $fila;
        if ($cel === 1) {
            if ($fila['tipo'] === "Teléfono celular") {
                $datos[] = $fila;
            }
        } else {
            if ($fila['tipo'] !== "Teléfono celular") {
                $datos[] = $fila;
            }
        }
    }
    if (empty($datos)) {
        if ($cel == 1) {
            $respuesta->error = "El usuario no tiene celulares asignados";
            return $respuesta;
        } else {
            $respuesta->error = "El usuario no tiene equipos asignados";
            return $respuesta;
        }
    }
    mysqli_free_result($query);
    mysqli_next_result($con);

    $datos[0]['comentario'] = $valores->comentario ?? '';
    $datos[0]['fecha'] = $valores->fecha ?? '';
    $datos[0]['area'] = $valores->area ?? '';
    $datos[0]['ubicacion'] = $valores->ubicacion ?? '';
    $datos[0]['userPemex'] = $valores->userPemex ?? '';
    $datos[0]['userPemexCargo'] = $valores->userPemexCargo ?? '';
    $datos[0]['cel'] = $valores->cel;

    $sql_supervisor = "SELECT * FROM supervisor WHERE region = '$valores->region' AND  habilitado = 1;";
    //  var_dump($sql_supervisor);
    //$query2 = mysqli_query($con, $sql_supervisor);

    if (mysqli_query($con, $sql_supervisor)->num_rows == 0) {
        $respuesta->error =  "No hay supervisores habilitados en esta región";
        return $respuesta;
    }
    $query2 = mysqli_query($con, $sql_supervisor);
    $supervisor = [];
    while ($row = mysqli_fetch_assoc($query2)) {
        $supervisor[] = $row;
    }

    $datos[0]['supervisor'] = $supervisor[0]['nombre'] ?? '';
    $datos[0]['cargo'] = $supervisor[0]['cargo'] ?? '';
    $datos[0]['region'] = $supervisor[0]['region'] ?? '';

    //Actualizando la fecha de entrega de todos los equipos del resguardo
    $sql_fecha_update = "UPDATE inventario_ti_sur SET fecha_entrega = '$valores->fecha' where fk_usuario = '$valores->usuario'";
    mysqli_query($con, $sql_fecha_update);

    //$respuesta->datos = $datos;
    //return $respuesta;

    // Enviar a segundo PHP con cURL
    $datos_para_envio = new stdClass();
    $datos_para_envio->accion = 0;
    $datos_para_envio->datos = $datos;

    $ch = curl_init('http://localhost/Inventario_TI/database/controller_excel/controller_excel.php'); // Reemplaza con tu URL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'trama' => json_encode($datos_para_envio)
    ]);

    $respuesta_raw = curl_exec($ch);
    curl_close($ch);

    // Retornar al frontend lo que devuelva el segundo PHP
    // return json_decode($respuesta_raw);

    return array(
        'result' => json_decode($respuesta_raw),
        'resguardo' => $historico
    );
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

    // Datos generales por defecto
    $fecha = date('Y-m-d');
    $zona = "Región Sur";
    $ubicacion = "Bodega";
    $usuario = '5'; // Usuario por defecto para activos en Bodega

    $datos = [];    // Para almacenar el estado anterior de los activos
    $nuevo = [];    // Para almacenar el estado nuevo despué del traspaso

    // Valida si se envían varios IDs de activos
    if (is_array($valores->id)) {
        // Convierte IDs a cadena separada por comas para consultar SQL
        $ids = implode(",", array_map('intval', $valores->id));

        // Consulta para obtener información actual del los activos
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

        // Guardar información actual en $datos
        while ($fila = mysqli_fetch_assoc($query)) {
            array_push($datos, $fila);
        }

        // Actualización de los activos segpus el estatus
        if ($valores->estatus == 'Bodega') {
            // Si el estatus es Bodega, asignar valores por defecto
            $sql_datos = "UPDATE inventario_ti_sur SET estatus = '$valores->estatus', fk_usuario = '$usuario', zona = '$zona', ubicacion = '$ubicacion', fecha_entrega = '$fecha' WHERE id IN ($ids)";
        } else {
            // Si es otro estatus, usar los valores seleccionados para el usuario
            $sql_datos = "UPDATE inventario_ti_sur SET estatus = '$valores->estatus', fk_usuario = '$valores->usuario', zona = '$valores->zona', ubicacion = '$valores->ubicacion', fecha_entrega = '$fecha' WHERE id IN ($ids)";
        }
        // var_dump($sql_datos);
        mysqli_query($con, $sql_datos);

        // Consultar nuevamente los activos para obtener el estado actualizado
        $query_nuevo = mysqli_query($con, $sql);
        while ($fila = mysqli_fetch_assoc($query_nuevo)) {
            array_push($nuevo, $fila);
        }
        // Retorna información anterior y nueva de los activos (para histórico)
        return [
            'anterior' => $datos,
            'nuevo' => $nuevo
        ];
    } else {
        // En caso de un solo envio de activo
        $sql = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega FROM inventario_ti_sur WHERE id = '$valores->id'";
        $query = mysqli_query($con, $sql);

        $datos = [];
        while ($fila = mysqli_fetch_assoc($query)) {
            $datos[] = $fila;
        }
        // Retorna información del activo único
        return $datos;
    }
}

function cargar_resguardo_firmado($valores)
{
    $respuesta = new stdClass();

    if (isset($_FILES['resguardo']) && $_FILES['resguardo']['error'] === UPLOAD_ERR_OK) {
        $nombreOriginal = $_FILES['resguardo']['name'];
        $tmpPath = $_FILES['resguardo']['tmp_name'];

        // Validar extensión .xlsx
        $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
        if ($ext !== 'pdf') {
            $respuesta->error = "Tipo de archivo no permitido. Solo .pdf";
            return $respuesta;
        }

        //* Generar nombre único para evitar colisiones
        $nuevoNombre = date('Ymd_His') . '_' . $nombreOriginal;


        //* Ruta de la carpeta
        $ruta = __DIR__ . '/../../documentos/resguardos/' . $valores->usuario;

        //* Validando si el usuario ya tiene su carpeta o no
        if (is_dir($ruta)) {
            //* Ruta destino, __DIR__ es carpeta donde está este script PHP
            $destino = $ruta . '/' . $nuevoNombre;
        } else {
            //* Creación de la carpeta
            mkdir($ruta, 0777, true);

            //* Ruta destino
            $destino = $ruta . '/' . $nuevoNombre;
        }

        if (move_uploaded_file($tmpPath, $destino)) {
            $respuesta->mensaje = "Archivo guardado correctamente";
            //$respuesta->ruta = 'C:\\xampp\\htdocs\\Inventario_TI\\database\\controller_inventario\\' . $nuevoNombre;
        } else {
            $respuesta->error = "No se pudo mover el archivo.";
        }
    } else {
        $respuesta->error = "No se recibió ningún archivo válido.";
    }
    return $respuesta;
}

function consultar_resguardos_firmados($valores)
{
    $respuesta = new stdClass();

    $carpeta = __DIR__ . '/../../documentos/resguardos/' . $valores->usuario;

    $carpetaUrl = '/Inventario_TI/documentos/resguardos' . '/' . $valores->usuario;

    if (is_dir($carpeta)) {
        $archivos = array_diff(scandir($carpeta), ['.', '..']);

        $ruta = [];

        foreach ($archivos as $archivo) {
            $ruta[] = $carpetaUrl . '/' . $archivo;
        }
        // array_reverse($ruta);
        if (!empty($ruta)) {
            $respuesta->documentos = $ruta;
        } else {
            $respuesta->mensaje = "El usuario no tiene resguardos subidos";
        }
    } else {
        $respuesta->mensaje = "El usuario no tiene resguardos subidos";
    }

    return $respuesta;
}
