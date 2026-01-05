<?

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico-City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = consultar_auditoria($clientejson);
} elseif ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = guardar_reportes($clientejson);
} elseif ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = validar_reporte_mismo_año($clientejson);
} elseif ($clientejson->accion == 3) {
    $respuesta_servidor->resultado = consultar_reporte($clientejson);
} elseif ($clientejson->accion == 4) {
    $respuesta_servidor->resultado = consultar_anio_auditoria($clientejson);
} elseif ($clientejson->accion == 5) {
    $respuesta_servidor->resultado = unir_reportes_auditoria($clientejson);
} elseif ($clientejson->accion == 6) {
    $respuesta_servidor->resultado = guardar_programa($clientejson);
} elseif ($clientejson->accion == 7) {
    $respuesta_servidor->resultado = consultar_programa_firmado($clientejson);
}

print(json_encode($respuesta_servidor));

function consultar_auditoria($valores)
{
    include("../conexion.php");

    $sql = "SELECT * FROM vauditoria WHERE anio = '$valores->anio' ORDER BY fecha ASC";
    $query = mysqli_query($con, $sql);

    $datos = [];
    while ($fila = mysqli_fetch_object($query)) {
        $datos[] = $fila;
    }

    return $datos;
}

function consultar_anio_auditoria()
{
    include("../conexion.php");

    $sql = "SELECT MAX(anio) AS anio FROM auditoria";
    //$sql = "SELECT * FROM auditoria";
    $query = mysqli_query($con, $sql);

    $fila = mysqli_fetch_object($query);

    return $fila;
}
