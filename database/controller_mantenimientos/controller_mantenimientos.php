<?php
//TODO Consultas a la bd realizadas en la pestaña de mantenimiento

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

//require_once('vendor/autoload.php');
require __DIR__ . '/../../vendor/autoload.php';

use Ilovepdf\Ilovepdf;

//*La funcion de unir pdfs puede tardar mas de dos minutos, es necesario aumentar ese tiempo
set_time_limit(300);
ini_set('max_execution_time', 300);




$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_datos($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = guardar_reportes($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = validar_reporte_mismo_año($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = consultar_reporte($clientejson);
} elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = consultar_anio_mantenimiento($clientejson);
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = unir_reportes_mantenimiento($clientejson);
} elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = guardar_programa($clientejson);
} elseif ($clientejson->accion == 7) {
    $respuesta_servidor->resultado = consultar_programa_firmado($clientejson);
}

print(json_encode($respuesta_servidor));

function consultar_datos($valores)
{
    include("../conexion.php");
    // Obtiene la región y año; si no existe, se asigna null
    $region = $valores->region ?? null;
    $anio   = $valores->anio ?? null;
    // Si no se recibe el año, no se puede realizar la consulta
    if (!$anio) {
        return [];  // retorna un arrglo vacío
    }
    // Verifica si la región está vacía
    if (empty($region)) {
        // Si no viene región -> es admin
        $sql = "SELECT * 
                FROM vmantenimiento
                WHERE anio = '$anio' 
                ORDER BY fecha ASC";
    } else {
        // Si viene región -> es usuario normal
        $sql = "SELECT * 
                FROM vmantenimiento
                WHERE anio = '$anio' 
                AND zona LIKE '%$region%' 
                ORDER BY fecha ASC";
    }

    $query = mysqli_query($con, $sql);

    $datos = [];    // Inicializa el arreglo para almacenar los resultados
    // Recorre cada fila obtenida en la consulta
    while ($fila = mysqli_fetch_object($query)) {
        $datos[] = $fila;   // Agrega cada registro como objeto al arreglo de resultados
    }

    return $datos;  // Retorna el arreglo con todos los registros obtenidos
}

function guardar_reportes($valores)
{
    include("../conexion.php");

    $respuesta = new stdClass();
    //var_dump($_FILES['reporte_mantenimiento']);

    $validacion = validar_reporte_mismo_año($valores);
    if ($validacion && isset($validacion->resultado)) {
        unlink($validacion->resultado);
    }

    if (isset($_FILES['reporte_mantenimiento']) && $_FILES['reporte_mantenimiento']['error'] === UPLOAD_ERR_OK) {
        $nombreOriginal = $_FILES['reporte_mantenimiento']['name'];
        $tmpPath = $_FILES['reporte_mantenimiento']['tmp_name'];

        // Validar extensión .xlsx
        $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
        if ($ext !== 'pdf') {
            $respuesta->error = "Tipo de archivo no permitido. Solo .pdf";
            return $respuesta;
        }
        $nombreOriginalArreglado = explode(' ', $nombreOriginal);
        $nombreOriginalArreglado = join('_', $nombreOriginalArreglado);
        //* Generar nombre único para evitar colisiones
        $nuevoNombre = $valores->id_equipo . '-' . $nombreOriginalArreglado;

        $fechaMantenimiento = explode('-', $valores->fecha_mnto);
        //var_dump($nuevoNombre);


        //* Ruta de la carpeta
        $rutaAnio =  __DIR__ . '/../../Documentos/mantenimiento/reporte/' . $fechaMantenimiento[0];
        $rutaMes =  __DIR__ . '/../../Documentos/mantenimiento/reporte/' . $fechaMantenimiento[0] . '/' . $fechaMantenimiento[1];
        //$ruta = __DIR__ . '/../../Documentos/mantenimiento/reporte/'. $fechaMantenimiento[0].'/'. $fechaMantenimiento[1].'/'. $valores->id_equipo;

        //* Validando si el año de mantenimiento ya tiene su carpeta o no
        if (is_dir($rutaAnio)) {
            //* Validando si el mes ya tiene su carpeta
            if (is_dir($rutaMes)) {
                $destino = $rutaMes . '/' . $nuevoNombre;
            } else {
                //*Se crea la carpeta del mes
                mkdir($rutaMes, 0777, true);
                $destino = $rutaMes . '/' . $nuevoNombre;
            }
        } else {
            //* Creación de la carpeta del año
            mkdir($rutaAnio, 0777, true);
            //*Se crea la carpeta del mes
            mkdir($rutaMes, 0777, true);

            //* Ruta destino
            $destino = $rutaMes . '/' . $nuevoNombre;
        }

        if (move_uploaded_file($tmpPath, $destino)) {
            $añoMantenimiento = $fechaMantenimiento[0];
            $sql = "UPDATE mantenimiento SET reporte_subido = 1, estado = 'Realizado' WHERE id_equipo = '$valores->id_equipo' AND anio = '$añoMantenimiento'";
            $query  = mysqli_query($con, $sql);
            if (!$query) {
                return $respuesta->error = "No se pudo registrar en la base datos, favor de avisar a TI";
            }
            $respuesta->mensaje = "Archivo guardado correctamente";
        } else {
            $respuesta->error = "No se pudo mover el archivo.";
        }
    } else {
        $respuesta->error = "No se recibió ningún archivo válido.";
    }
    return $respuesta;
}

function validar_reporte_mismo_año($valores)
{
    $respuesta = new stdClass();
    //var_dump($valores);
    $fecha = explode('-', $valores->fecha_mnto);
    $año = $fecha[0];
    $mes = $fecha[1];

    //*ruta física del servidor
    $carpeta = __DIR__ . '/../../documentos/mantenimiento/reporte/' . $año . '/' . $mes;

    //* Verifica si existe la carpeta
    if (is_dir($carpeta)) {

        //* Escanea los archivos, los guarda en un array ignorando sus extensiones
        $archivos = array_diff(scandir($carpeta), ['.', '..']);

        //*Arma un array de enlaces para acceder al documento 
        foreach ($archivos as $archivo) {
            $partes = explode('-', $archivo);

            $idEquipo = $partes[0];

            if ($idEquipo === $valores->id_equipo) {
                $respuesta->resultado = $carpeta . '/' . $archivo;
                return $respuesta;
            }
        }
    }
    return false;
}

function consultar_reporte($valores)
{
    $respuesta = new stdClass();
    // Separar la fecha en año y mes
    // Ejemplo: "2027-03-15" -> ['2027', '03', '15']
    $fecha = explode('-', $valores->fecha_mnto);
    $año = $fecha[0];   // Primer elemento: año
    $mes = $fecha[1];   // Segundo elemento: mes
    // Construir la ruta física de la carpeta donde se almacenan los reportes
    $carpeta = __DIR__ . '/../../documentos/mantenimiento/reporte/' . $año . '/' . $mes;
    // Construir la URL relativa para acceder al archivo desde el navegador
    $carpetaUrl = '/Inventario_TI/documentos/mantenimiento/reporte/' . $año . '/' . $mes;
    // Verificar si la carpeta existe
    if (is_dir($carpeta)) {
        // Obtener todos los archivos de la carpeta, excluyendo '.' y '..'
        $archivos = array_diff(scandir($carpeta), ['.', '..']);
        // Recorrer cada archivo buscando el que corresponde al equipo
        foreach ($archivos as $archivo) {
            // Los archivos tienen formato: {id_equipo}-{resto_del_nombre}.pdf
            // Separar por '-' para extraer el ID del equipo
            $partes = explode('-', $archivo);
            $idEquipo = $partes[0]; // Primer parte es el ID del equipo
            // Si el ID del archivo coincide con el ID buscado
            if ($idEquipo === $valores->id_equipo) {
                // Construir la URL completa del documento
                $respuesta->documento = $carpetaUrl . '/' . $archivo;
                // Retornar inmediatamente al encontrar el archivo
                return $respuesta;
            }
        }
    } else {
        // Si la carpeta no existe, significa que no hay reportes para ese mes/año
        $respuesta->aviso = "El activo no tiene reporte subido";
    }
    return $respuesta;
}

function guardar_programa($valores)
{
    $respuesta = new stdClass();
    // Validar que se recibió un archivo válido
    if (
        !isset($_FILES['reporte_programa']) ||
        $_FILES['reporte_programa']['error'] !== UPLOAD_ERR_OK
    ) {
        $respuesta->error = "No se recibió ningún archivo válido.";
        return $respuesta;
    }
    // Obtener información del archivo subido
    $archivo = $_FILES['reporte_programa'];
    // Extraer nombre sin extensión y la extensión por separado
    $nombreOriginal = pathinfo($archivo['name'], PATHINFO_FILENAME);
    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    $tmpPath = $archivo['tmp_name'];    // Ruta temporal del archivo
    // Validar que sea un archivo PDF
    if ($extension !== 'pdf') {
        $respuesta->error = "Tipo de archivo no permitido. Solo PDF.";
        return $respuesta;
    }

    // Limpiar el nombre del archivo, reemplazando caracteres especiales por '_'
    // Permite solo letras, números, puntos, guiones y guiones bajos
    $nombreLimpio = preg_replace('/[^A-Za-z0-9._-]/', '_', $nombreOriginal);
    // Obtener la ruta base absoluta de la carpeta de programas
    $base = realpath(__DIR__ . '/../../documentos/mantenimiento/programa');
    if ($base === false) {
        $respuesta->error = "No se encontró la ruta base.";
        return $respuesta;
    }
    // Crear carpeta específica para el año si no existe
    // Estructura: /documentos/mantenimiento/programa/{año}
    $carpeta_anual = $base . DIRECTORY_SEPARATOR . $valores->anio;

    if (!is_dir($carpeta_anual)) {
        // Crear carpeta con permisos 0755 (lectura/escritura/ejecución para owner, lectura/ejecución para grupo y otros)
        if (!mkdir($carpeta_anual, 0755, true)) {
            $respuesta->error = "No se pudo crear la carpeta del año.";
            return $respuesta;
        }
    }
    // Eliminar cualquier PDF existente en la carpeta del año
    // Esto asegura que solo exista una versión del programa firmado por año
    foreach (glob($carpeta_anual . DIRECTORY_SEPARATOR . '*.pdf') as $pdfExistente) {
        unlink($pdfExistente);
    }
    // Construir el nombre final del archivo con la fecha actual
    // Formato: {nombre_original}_{YYYYMMDD}.pdf
    $fecha = date('Ymd');
    $archivo_final = $carpeta_anual
        . DIRECTORY_SEPARATOR
        . $nombreLimpio . '_' . $fecha . '.pdf';
    // Mover el archivo desde la ubicación temporal a la ubicación final
    if (move_uploaded_file($tmpPath, $archivo_final)) {
        $respuesta->mensaje = "Archivo guardado correctamente.";
        $respuesta->ruta_guardada = basename($archivo_final);   // Solo el nombre del archivo
        $respuesta->fecha_subida = $fecha;
    } else {
        $respuesta->error = "No se pudo guardar el archivo.";
    }

    return $respuesta;
}

function consultar_programa_firmado($valores)
{
    // Obtener la ruta absoluta de la carpeta base donde se almacenan los programas firmados
    // realpath() convierte rutas relativas a absolutas y valida que la ruta exista
    $base = realpath(__DIR__ . '/../../documentos/mantenimiento/programa');
    // Si la ruta base no existe o no es accesible
    if ($base === false) {
        return [
            "existe" => false   // Indica que no existe programa
        ];
    }
    // Construir la ruta de la carpeta específica del año
    $carpeta = $base . DIRECTORY_SEPARATOR . $valores->anio;
    // Verificar si la carpeta del año existe
    // Si no existe la carpeta, significa que nunca se subió un programa para ese año
    if (!is_dir($carpeta)) {
        return [
            "existe" => false
        ];
    }
    // Buscar todos los archivos PDF en la carpeta del año
    // glob() retorna un array con las rutas completas de los archivos que coinciden con el patrón
    // El patrón '*.pdf' encuentra todos los archivos con extensión .pdf
    $archivos = glob($carpeta . DIRECTORY_SEPARATOR . '*.pdf');
    // Si se encontró al menos un archivo PDF
    if (!empty($archivos)) {
        // Obtener solo el nombre del archivo (sin la ruta completa)
        // Se usa el primer archivo encontrado ([0]) ya que solo debe existir uno por año
        $archivo = basename($archivos[0]);
        // Obtener el nombre del host del servidor
        $host = $_SERVER['HTTP_HOST'];
        // Determinar el protocolo (http o https)
        // Verifica si la conexión es segura (HTTPS) o normal (HTTP)
        $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        // Construir la URL completa para acceder al archivo desde el navegador
        $url = "{$protocolo}://{$host}/Inventario_TI/documentos/mantenimiento/programa/{$valores->anio}/{$archivo}";
        // Retornar información completa del archivo encontrado
        return [
            "existe" => true,   // Indicar que existe un programa
            "archivo" => $archivo,  // Nombre del archivo (para mostrar en interfaz)
            "url" => $url          // URL completa para descargar/visualizar
        ];
    }
    // Si la carpeta existe pero no contiene archivos PDF
    return [
        "existe" => false
    ];
}

function consultar_anio_mantenimiento()
{
    include("../conexion.php");

    $sql = "SELECT MAX(anio) AS anio FROM mantenimiento";
    //$sql = "SELECT * FROM mantenimiento";
    $query = mysqli_query($con, $sql);

    $fila = mysqli_fetch_object($query);

    return $fila;
}

function unir_reportes_mantenimiento($valores)
{
    $respuesta = new stdClass();

    $carpeta_reporte =  __DIR__ . '/../../documentos/mantenimiento/reporte/' . $valores->anio . '/reportes_unidos';
    $archivoFinal = $carpeta_reporte . '/Reporte_' . $valores->anio . '_' . $valores->mes . '.pdf';
    $carpetaUrl = '/Inventario_TI/documentos/mantenimiento/reporte/' . $valores->anio . '/reportes_unidos/Reporte_' . $valores->anio . '_' . $valores->mes . '.pdf';

    try {
        $ilovepdf = new Ilovepdf(
            'project_public_ecd8df30001f3773a605a14a2c0416c9_I--AV17bdca45d44f5b70e44a9960a810a1ab',
            'secret_key_181ece80f4c57be30267facf2f3890af_TcklQ6a753e75d95f5b32aef79aac42c0d33c',
            [
                'timeout' => 300,
                'connect_timeout' => 60
            ]
        );
        // Create a new task
        $myTaskMerge = $ilovepdf->newTask('merge');
        // Add files to task for upload
        $carpeta = __DIR__ . '/../../documentos/mantenimiento/reporte/' . $valores->anio . '/' . $valores->mes;

        if (!is_dir($carpeta)) {
            $respuesta->error = "No se pudo encontrar la ruta";
            return $respuesta;
        }

        $archivos = array_diff(scandir($carpeta), ['.', '..']);

        $ruta = [];

        foreach ($archivos as $archivo) {

            $rutaCompleta = $carpeta . '/' . $archivo;

            if (is_file($rutaCompleta) && strtolower(pathinfo($archivo, PATHINFO_EXTENSION)) === 'pdf') {  //  ignora carpetas
                $ruta[] = $rutaCompleta;
            }
        }

        if (empty($ruta)) {
            $respuesta->error = "No se pudo encontrar los archivos";
            return $respuesta;
        }

        foreach ($ruta as $archivo) {
            $myTaskMerge->addFile($archivo);
        }

        // Crear carpeta antes de descargar
        if (!is_dir($carpeta_reporte)) {
            mkdir($carpeta_reporte, 0777, true);
        }

        // Execute the task
        $myTaskMerge->execute();
        $myTaskMerge->download($carpeta_reporte);

        //*Renombrando el pdf generado
        $archivoDescargado = $carpeta_reporte . '/merged.pdf';

        $nuevoNombre = $archivoFinal;

        if (file_exists($archivoDescargado)) {
            if (rename($archivoDescargado, $nuevoNombre)) {
                $respuesta->mensaje = "Archivos unidos correctamente";
                //$respuesta->error = "Archivo renombrado correctamente a $nuevoNombre";
            } else {
                $respuesta->error =  "Error al renombrar el archivo";
                return $respuesta;
            }
        } else {
            $respuesta->error =  "El archivo original no existe";
            return $respuesta;
        }

        $respuesta->ruta = $carpetaUrl;
    } catch (\Ilovepdf\Exceptions\AuthException $e) {
        $respuesta->error = "Error de autenticación Ilovepdf: " . $e->getMessage();
    } catch (\Ilovepdf\Exceptions\TaskException $e) {
        $respuesta->error = "Error en la tarea Ilovepdf: " . $e->getMessage();
    } catch (\Exception $e) {
        $respuesta->error = "Error general: " . $e->getMessage();
    }

    return $respuesta;
}
