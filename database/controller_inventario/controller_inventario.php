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
    // Inserta o recupera el ID del rubro, tipo y marca en su catálogo
    $val_rubro = insertar_o_obtener_id($con, 'cat_rubro', 'rubro', $valores->rubro);
    $val_tipo = insertar_o_obtener_id($con, 'cat_tipo', 'tipo', $valores->tipo);
    $val_marca = insertar_o_obtener_id($con, 'cat_marca', 'marca', $valores->marca);

    // Variable para almacenar el ID del usuario
    $val_usuario;
    // Verifica si se proporcionó un usuario
    if (empty($valores->usuario)) {
        // Usuario vacío, usar el ID 5 por defecto
        $usuario = 5;
    } else {
        // Verifica si el usuario ya existe en el sistema
        $usuario_check = verificar_nuevos_id($valores->usuario);
        // Si el usuario existe, se usa directamente el valor recibido
        if ($usuario_check === true) {
            $val_usuario = $valores->usuario;
        } else {
            // Si no existe, se prepara el nombre y cargo para insertarlos
            $nombre = mysqli_real_escape_string($con, $usuario_check);
            $cargo = mysqli_real_escape_string($con, $valores->cargo);
            // Inserta el nuevo usuario en el catálogo de usuarios
            $sql_insert = "INSERT INTO cat_usuarios(nombre, cargo) VALUES ('$nombre', '$cargo');";
            mysqli_query($con, $sql_insert);
            // Consulta el ID del usuario recién insertado
            $sql_get_id = "SELECT id FROM cat_usuarios WHERE nombre = '$nombre' AND cargo = '$cargo';";
            $result = mysqli_query($con, $sql_get_id);
            // Obtiene el ID del usuario
            $idUsuario = mysqli_fetch_assoc($result);
            $val_usuario = $idUsuario['id'];
        }
        // Asignar valor final a $usuario
        $usuario = $val_usuario;
    }
    // Define el estatus según si hay usuario asignado o no
    $val_estatus = empty($valores->usuario) ? 'Bodega' : 'Asignado';
    // Asigna valores por defecto si no se proporciona IMEI, linea, TAG, AF, número de serie
    $val_imei = empty($valores->imei) ? 'NA' : $valores->imei;
    $val_linea = empty($valores->linea) ? 'NA' : $valores->linea;
    $val_tag = empty($valores->tag) ? 'NA' : $valores->tag;
    $val_af = empty($valores->af) ? 'NA' : $valores->af;
    $val_num_serie = empty($valores->num_serie) ? 'NA' : $valores->num_serie;

    // Verifica que el número de serie no esté duplicado (si no es NA)
    if ($val_num_serie !== 'NA') {
        $sql_num = "SELECT * FROM inventario_ti_sur WHERE num_serie = '$val_num_serie' AND estatus <> 'Baja'";
        $query_num = mysqli_query($con, $sql_num);
        // Si ya existe un equipo con ese número de serie, se detiene la inserción
        if ($query_num->num_rows > 0) {
            return ["resultado" => false, "mensaje" => "Número de serie duplicado"];
        }
    }
    // Construye la consulta SQL para insertar el equipo en el inventario
    $sql = 'INSERT INTO inventario_ti_sur(zona, fk_rubro, af, fk_tipo, fk_marca, modelo, num_serie, ubicacion, tag, fk_usuario, fecha_entrega, imei, linea, estatus) 
        VALUES ("' . $valores->zona . '","' . $val_rubro . '","' . $val_af . '","' . $val_tipo . '","' . $val_marca . '","' . $valores->modelo . '","' . $val_num_serie . '","' . $valores->ubicacion . '",
        "' . $val_tag . '","' . $usuario . '", "' . $registro . '", "' . $val_imei . '", "' . $val_linea . '", "' . $val_estatus . '")';
    // Ejecuta la consulta de inserción
    $query = mysqli_query($con, $sql);
    // Obtener el ID del registro insertado
    $id_insertado = mysqli_insert_id($con);
    // Consulta el registro insertado para devolverlo como respuesta
    $sql_select = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, 
                        modelo, tag, imei, linea,  fecha_entrega 
                    FROM inventario_ti_sur 
                    WHERE 
                        id = '$id_insertado'";

    $query_select = mysqli_query($con, $sql_select);    // Ejecuta la consulta de selección
    $resultado = mysqli_fetch_assoc($query_select);     // Obtiene los datos del registro insertado
    // Retorna el resultado de la inserción y el registro creado
    return [
        'exitoso' => $query,
        'insercion' => $resultado,
    ];
}

function editar_datos($valores)
{
    include("../conexion.php"); // Incluye la conexión a la base de datos
    // Consulta para obtener el estado actual del registro antes de ser modificado
    $sql_select = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega 
                    FROM inventario_ti_sur WHERE id = '$valores->id'";

    $query_select = mysqli_query($con, $sql_select);    // Ejecuta la consulta
    $antes =  mysqli_fetch_assoc($query_select);    // Obtiene el resultado en formato asociativo (registro anterior)

    $rubro = verificar_nuevos_id($valores->rubro);  // Verifica si el rubro ya existe o si debe insertarse uno nuevo
    $val_rubro; // Variable para almacenar el ID final del rubro
    if ($rubro === true) {
        $val_rubro = $valores->rubro;   // Si el rubro ya existe, se utiliza el valor recibido
    } else {
        // Si el rubro no existe, se inserta en el catálogo de rubros
        $sql_rubro = "INSERT INTO cat_rubro(rubro) VALUES ('$rubro');";
        mysqli_query($con, $sql_rubro);
        // Obtiene el ID del nuevo rubro insertado
        $sql_ver_id_rubro = "SELECT id FROM cat_rubro WHERE rubro = '$rubro';";
        $idRub = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_rubro));
        $val_rubro = $idRub['id'];
    }

    $tipo = verificar_nuevos_id($valores->tipo);    // Verifica si el tipo ya existe o si debe insertarse uno nuevo
    $val_tipo;  // Variable para almacenar el ID final del tipo
    if ($tipo === true) {
        $val_tipo = $valores->tipo; // Si el tipo ya existe, se utiliza el valor recibido
    } else {
        // Si el tipo no existe, se inserta en el catálogo de tipos
        $sql_tipo = "INSERT INTO cat_tipo(tipo) VALUES ('$tipo');";
        mysqli_query($con, $sql_tipo);
        // Obtiene el ID del nuevo tipo insertado
        $sql_ver_id_tipo = "SELECT id FROM cat_tipo WHERE tipo = '$tipo';";
        $idTip = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_tipo));
        $val_tipo = $idTip['id'];
    }

    $marca = verificar_nuevos_id($valores->marca);  // Verifica si la marca ya existe o si debe insertarse una nueva
    $val_marca; // Variable para almacenar el ID final de la marca
    if ($marca === true) {
        $val_marca = $valores->marca;   // Si la marca ya existe, se utiliza el valor recibido
    } else {
        // Si la marca no existe, se inserta en el catálogo de marcas
        $sql_marca = "INSERT INTO cat_marca(marca) VALUES ('$marca');";
        mysqli_query($con, $sql_marca);
        // Obtiene el ID de la nueva marca insertada
        $sql_ver_id_marca = "SELECT id FROM cat_marca WHERE marca = '$marca';";
        $idMarca = mysqli_fetch_assoc(mysqli_query($con, $sql_ver_id_marca));
        $val_marca = $idMarca['id'];
    }
    // Verifica si el usuario viene vacío, si es así asigna el ID 5 por defecto
    $val_usuario = empty($valores->usuario) ? '5' : $valores->usuario;
    // Construye la sentencia SQL para actualizar el registro con los nuevos valores
    $sql = "UPDATE inventario_ti_sur 
            SET zona = '$valores->zona', fk_rubro = '$val_rubro', af = '$valores->af', fk_tipo ='$val_tipo', fk_marca = '$val_marca', modelo = '$valores->modelo', 
            num_serie = '$valores->num_serie', ubicacion = '$valores->ubicacion', tag = '$valores->tag', imei = '$valores->imei', linea = '$valores->linea', fk_usuario = '$val_usuario' 
            WHERE 
                id = '$valores->id';";
    //var_dump($sql);
    $result = mysqli_query($con, $sql); // Ejecuta la actualización
    // Consulta nuevamente el estado actualizado del registro
    $sql_select_nuevo = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega 
                        FROM
                            inventario_ti_sur 
                        WHERE
                            id = '$valores->id'";

    $query_select_nuevo = mysqli_query($con, $sql_select_nuevo);    // Ejecuta la consulta y obtiene el nuevo estado
    $nuevo = mysqli_fetch_assoc($query_select_nuevo);   // Obtiene el registro actualizado en formato asociativo
    // Retorna el resultado de la operación y los datos antes y después de la modificación
    return [
        'exito' => $result,
        'anterior' => $antes,
        'nuevo' => $nuevo
    ];
}

function consultar_datos()
{
    include("../conexion.php");
    $sql = "SELECT * FROM  vinventario_ti_sur;";    // Define la consulta SQL para obtener todos los registros de la vista vinventario_ti_sur
    $query = mysqli_query($con, $sql);  // Ejecuta la consulta en la base de datos
    $array = array();   // Inicializa un arreglo vacío para almacenar los resultados
    while ($fila = mysqli_fetch_object($query)) {   // Recorre cada fila obtenida por la consulta
        array_push($array, $fila);  // Agrega cada registro (objeto) al arreglo
    }
    return $array;  // Retorna el arreglo con todos los registros obtenidos
}

function desactivar_datos($valores)
{
    include("../conexion.php");

    $registro = date("Y-m-d");
    // Verifica si el parámetro id es un arreglo (múltiples registros)
    if (is_array($valores->id)) {
        // Convierte el arreglo de IDs en una cadena separada por comas (1,2,3)
        $ids = implode(",", array_map('intval', $valores->id));
        // Consulta para obtener los datos actuales de los registros que se van a dar de baja
        $sql_datos = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega FROM inventario_ti_sur WHERE id IN ($ids)";
        $query = mysqli_query($con, $sql_datos);    // Ejecuta la consulta

        $datos = [];    // Inicializa un arreglo para guardar los registros obtenidos
        // Recorre cada fila obtenida y la agrega al arreglo
        while ($fila = mysqli_fetch_object($query)) {
            array_push($datos, $fila);
        }
        // Actualiza los registros: cambia el estatus a 'Baja' y asigna la fecha actual
        $sql = "UPDATE inventario_ti_sur SET estatus = 'Baja', fecha_entrega = '$registro' WHERE id IN ($ids);";
        mysqli_query($con, $sql);   // Ejecuta la actualización
        return $datos;  // Retorna los datos de los registros que fueron dados de baja
    } else {
        // Consulta para dar de baja un solo registro por ID
        $sql = "UPDATE inventario_ti_sur SET estatus = 'Baja', fecha_entrega = '$registro' where id='$valores->id';";
        mysqli_query($con, $sql);   // Ejecuta la actualización
        // Consulta para obtener los datos del registro dado de baja
        $sql_num2 = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega FROM inventario_ti_sur WHERE id = '$valores->id'";
        $query_num2 = mysqli_query($con, $sql_num2);

        $datos = [];    // Inicializa un arreglo para almacenar el resultado
        // Recorre el resultado y guarda el registro en el arreglo
        while ($fila = mysqli_fetch_object($query_num2)) {
            array_push($datos, $fila);
        }
        return $datos;  // Retorna el registro dado de baja
    }
}

function insertar_o_obtener_id($con, $tabla, $campo, $valor)
{
    // Verifica si el valor recibido contiene solo dígitos (es decir, ya es un ID numérico)
    if (ctype_digit($valor)) {
        // Retorna el valor convertido a entero sin hacer más validaciones
        return (int)$valor;
    }
    // Limpia el valor eliminando espacios y caracteres peligrosos para evitar inyección SQL
    $valor_limpio = mysqli_real_escape_string($con, trim($valor));

    // Verificar si ya existe el valor en la tabla
    $sql_check = "SELECT id FROM $tabla WHERE $campo = '$valor_limpio' LIMIT 1;";
    $result_check = mysqli_query($con, $sql_check);
    // Si se encuentra un registro con ese valor
    if ($row = mysqli_fetch_assoc($result_check)) {
        return (int)$row['id']; // Retorna el ID existente convertido a entero
    }

    // Insertar el nuevo valor
    $sql_insert = "INSERT INTO $tabla($campo) VALUES ('$valor_limpio');";
    mysqli_query($con, $sql_insert);

    // Obtener el ID del valor recién insertado
    $sql_id = "SELECT id FROM $tabla WHERE $campo = '$valor_limpio' LIMIT 1;";
    $result_id = mysqli_query($con, $sql_id);
    $row_id = mysqli_fetch_assoc($result_id);   // Obtiene el resultado como arreglo asociativo

    return (int)$row_id['id'];  // Retorna el ID obtenido convertido a entero
}

function consultar_para_resguardo($valores)
{
    include("../conexion.php");

    $respuesta = new stdClass();    // Crea un objeto estándar para almacenar respuestas
    // Verifica si se solicitó solo celular o dispositivos distintos
    if ($valores === 0) {
        // Filtro para obtener únicamente teléfonos celulare
        $filtro_tipo = "AND ct.tipo LIKE 'telefono celular'";
    } else {
        // Filtro para obtener dispositivos que NO sean teléfonos celulares
        $filtro_tipo = "AND ct.tipo NOT LIKE 'telefono celular'";
    }
    // Consulta para obtener el histórico de equipos del usuario según el tipo
    $sql_historico = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, tag, imei, linea, fecha_entrega 
                        FROM inventario_ti_sur AS inv
                            INNER JOIN cat_tipo AS ct ON ct.id = inv.fk_tipo
                        WHERE fk_usuario = '$valores->usuario' $filtro_tipo;";
    $query_historico = mysqli_query($con, $sql_historico);

    $historico = array();   // Consulta para obtener el histórico de equipos del usuario según el tipo
    // Recorre los resultados del histórico
    while ($fila = mysqli_fetch_object($query_historico)) {
        array_push($historico, $fila);  // Agrega cada fila al arreglo histórico
    }
    // Ejecuta el procedimiento almacenado para obtener información del resguardo
    $sql = "call sp_info_resguardo('$valores->usuario');";
    $query = mysqli_query($con, $sql);

    $cel = $valores->cel;   // Obtiene si el resguardo es de celular o no
    $datos = [];    // Inicializa arreglo para almacenar los datos finales
    // Recorre los resultados del procedimiento almacenado
    while ($fila = mysqli_fetch_assoc($query)) {
        // Si es resguardo de celular
        if ($cel === 1) {
            if ($fila['tipo'] === "Teléfono celular") {
                $datos[] = $fila;   // Agrega solo filas de celulares
            }
        } else {
            // Si es resguardo de otros dispositivos
            if ($fila['tipo'] !== "Teléfono celular") {
                $datos[] = $fila;   // Agrega solo filas que no sean celulares
            }
        }
    }
    // Verifica si no se obtuvieron datos
    if (empty($datos)) {
        if ($cel == 1) {
            $respuesta->error = "El usuario no tiene celulares asignados";
            return $respuesta;  // Retorna error
        } else {
            $respuesta->error = "El usuario no tiene equipos asignados";
            return $respuesta;  // Retorna error
        }
    }
    mysqli_free_result($query); // Libera los resultados del procedimiento
    mysqli_next_result($con);   // Limpia el siguiente resultado pendiente en la conexión
    // Agrega información adicional al primer registro
    $datos[0]['comentario'] = $valores->comentario ?? '';   // Asigna comentario si existe
    $datos[0]['fecha'] = $valores->fecha ?? ''; // Asigna fecha si existe
    $datos[0]['area'] = $valores->area ?? '';   // Asigna área si existe
    $datos[0]['ubicacion'] = $valores->ubicacion ?? ''; // Asigna ubicación si existe
    $datos[0]['userPemex'] = $valores->userPemex ?? ''; // Asigna usuario Pemex si existe
    $datos[0]['userPemexCargo'] = $valores->userPemexCargo ?? '';   // Asigna cargo Pemex si existe
    $datos[0]['cel'] = $valores->cel;   // Asigna tipo de resguardo (celular u otro)
    // Consulta para obtener supervisor habilitado por región
    $sql_supervisor = "SELECT * FROM supervisor WHERE region = '$valores->region' AND  habilitado = 1;";
    // Verifica si existen supervisores habilitados en la región
    if (mysqli_query($con, $sql_supervisor)->num_rows == 0) {
        $respuesta->error =  "No hay supervisores habilitados en esta región";
        return $respuesta;
    }

    $query2 = mysqli_query($con, $sql_supervisor);  // Ejecuta consulta de supervisor
    $supervisor = [];   // Inicializa arreglo de supervisores
    // Recorre los resultados de supervisores
    while ($row = mysqli_fetch_assoc($query2)) {
        $supervisor[] = $row;
    }
    // Asigna datos del supervisor al primer registro
    $datos[0]['supervisor'] = $supervisor[0]['nombre'] ?? '';
    $datos[0]['cargo'] = $supervisor[0]['cargo'] ?? '';
    $datos[0]['region'] = $supervisor[0]['region'] ?? '';

    // Actualiza la fecha de entrega de todos los equipos del usuario
    $sql_fecha_update = "UPDATE inventario_ti_sur SET fecha_entrega = '$valores->fecha' where fk_usuario = '$valores->usuario'";
    mysqli_query($con, $sql_fecha_update);

    // Prepara objeto para enviar a segundo PHP con cURL
    $datos_para_envio = new stdClass(); // Crea objeto para envío
    $datos_para_envio->accion = 0;  // Define acción
    $datos_para_envio->datos = $datos;  // Asigna datos
    // Inicializa petición cURL hacia el generador de Excel/PDF
    $ch = curl_init('http://localhost/Inventario_TI/database/controller_excel/controller_excel.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Indica que devuelva respuesta
    curl_setopt($ch, CURLOPT_POST, true);   // Define método POST
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'trama' => json_encode($datos_para_envio)   // Envía datos como JSON
    ]);

    $respuesta_raw = curl_exec($ch);    // Ejecuta la petición cURL
    curl_close($ch);    // Cierra la sesión cURL
    // Retorna al frontend el resultado del segundo PHP y el histórico
    return array(
        'result' => json_decode($respuesta_raw),    // Resultado del generador de documento
        'resguardo' => $historico   // Histórico de equipos
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
    $nuevo = [];    // Para almacenar el estado nuevo después del traspaso

    // Valida si se envían varios IDs de activos
    if (is_array($valores->id)) {
        // Convierte IDs a cadena separada por comas para consultar SQL
        $ids = implode(",", array_map('intval', $valores->id));

        // Consulta para obtener información actual del los activos
        $sql = "SELECT num_serie, fk_usuario, zona, ubicacion, af, fk_rubro, fk_tipo, fk_marca, modelo, imei, linea, tag, fecha_entrega 
                FROM inventario_ti_sur 
                WHERE id IN ($ids)";

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
    $respuesta = new stdClass();    // Se crea un objeto estándar para almacenar la respuesta (mensaje o error)
    // Verifica si se recibió un archivo llamado 'resguardo' y si no ocurrió ningún error al subirlo
    if (isset($_FILES['resguardo']) && $_FILES['resguardo']['error'] === UPLOAD_ERR_OK) {
        $nombreOriginal = $_FILES['resguardo']['name']; // Obtiene el nombre original del archivo cargado
        $tmpPath = $_FILES['resguardo']['tmp_name'];    // Obtiene la ruta temporal donde PHP guardó el archivo subido

        // Obtiene la extensión del archivo (pdf, xlsx, etc.) en minúsculas
        $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
        // Valida que la extensión sea únicamente PDF
        if ($ext !== 'pdf') {
            $respuesta->error = "Tipo de archivo no permitido. Solo .pdf";
            return $respuesta;  // Termina la ejecución y regresa el error
        }
        // Genera un nombre único concatenando fecha, hora y el nombre original del archivo
        $nuevoNombre = date('Ymd_His') . '_' . $nombreOriginal;
        // Construye la ruta donde se almacenará el archivo, separándolo por usuario
        $ruta = __DIR__ . '/../../documentos/resguardos/' . $valores->usuario;

        // Verifica si la carpeta del usuario ya existe
        if (is_dir($ruta)) {
            // Si existe, define la ruta final del archivo dentro de esa carpeta
            $destino = $ruta . '/' . $nuevoNombre;
        } else {
            // Si no existe la carpeta, la crea con permisos completos
            mkdir($ruta, 0777, true);
            // Define la ruta final del archivo una vez creada la carpeta
            $destino = $ruta . '/' . $nuevoNombre;
        }
        // Mueve el archivo desde la carpeta temporal a la carpeta destino
        if (move_uploaded_file($tmpPath, $destino)) {
            $respuesta->mensaje = "Archivo guardado correctamente";
        } else {
            $respuesta->error = "No se pudo mover el archivo.";
        }
    } else {    // Si no se recibió un archivo válido, asigna mensaje de error
        $respuesta->error = "No se recibió ningún archivo válido.";
    }
    return $respuesta;  // Retorna el objeto con el resultado del proceso
}

function consultar_resguardos_firmados($valores)
{
    $respuesta = new stdClass();    // Se crea un objeto estándar para almacenar la respuesta (documentos o mensajes)
    // Construye la ruta física del servidor donde se guardan los resguardos del usuario
    $carpeta = __DIR__ . '/../../documentos/resguardos/' . $valores->usuario;
    // Construye la ruta accesible desde el navegador (URL) para esos mismos archivos
    $carpetaUrl = '/Inventario_TI/documentos/resguardos' . '/' . $valores->usuario;
    // Verifica si la carpeta del usuario existe en el servidor
    if (is_dir($carpeta)) {
        // Obtiene la lista de archivos dentro de la carpeta y elimina "." y ".."
        $archivos = array_diff(scandir($carpeta), ['.', '..']);
        // Inicializa un arreglo para almacenar las rutas de los archivos
        $ruta = [];
        // Recorre cada archivo encontrado en la carpeta
        foreach ($archivos as $archivo) {
            // Construye la ruta pública (URL) de cada archivo y la guarda en el arreglo
            $ruta[] = $carpetaUrl . '/' . $archivo;
        }
        // Verifica si el arreglo de rutas no está vacío
        if (!empty($ruta)) {
            // Asigna al objeto de respuesta el listado de documentos encontrados
            $respuesta->documentos = $ruta;
        } else {
            $respuesta->mensaje = "El usuario no tiene resguardos subidos";
        }
    } else {
        $respuesta->mensaje = "El usuario no tiene resguardos subidos";
    }
    // Retorna el objeto con los documentos o el mensaje correspondiente
    return $respuesta;
}
