<?php

use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set('America/Mexico_City');

$clientejson = json_decode($_POST['trama']);

$respuesta_servidor = new stdClass();

if ($clientejson->accion == 0) {
    $respuesta_servidor->resultado = verificar_email($clientejson);
} else if ($clientejson->accion == 1) {
    $respuesta_servidor->resultado = email_reporte_mantenimiento($clientejson);
} else if ($clientejson->accion == 2) {
    $respuesta_servidor->resultado = correo_reporte_auditoria($clientejson);
}
print(json_encode($respuesta_servidor));

//*Funciones para correo de recuperación de contraseña
function verificar_email($valores)
{ //Verifica que el correo existe y genera el token
    include("../conexion.php");

    $sql = "SELECT * FROM usuario WHERE correo= '$valores->correo'";
    $query = mysqli_query($con, $sql);

    if ($query->num_rows > 0) { //verifica email
        $usuario = mysqli_fetch_assoc($query);
        $token = bin2hex(random_bytes(16)); //Creación del token
        $token_expiracion = date("Y-m-d H:i:s", time() + 300); //fecha de expiracion del token (5 minutos)
        token_expirados($valores->correo);
        $update_token_sql = "UPDATE usuario SET token = '$token', token_expiracion = '$token_expiracion' WHERE correo = '$valores->correo'";
        if (mysqli_query($con, $update_token_sql)) {
            return email_recuperacion($valores, $token);
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function token_expirados($correo)
{
    include("../conexion.php");

    $sql = "UPDATE usuario SET token = NULL, token_expiracion = NULL WHERE token_expiracion < NOW() AND correo='$correo'";
    mysqli_query($con, $sql);
}
//* Función que envía el correo de recuperación
function email_recuperacion($destino, $token)
{

    include("../email/Exception.php");
    include("../email/PHPMailer.php");
    include("../email/SMTP.php");

    $mail = new PHPMailer();

    try {
        // Configuración del servidor SMTP
        $mail->isSMTP(); // Usar el servidor SMTP
        $mail->Host = 'smtp.gmail.com'; // Servidor SMTP de Gmail (ajustar según el servidor que uses)
        $mail->SMTPSecure = "ssl";
        $mail->SMTPAuth = true; // Habilitar la autenticación SMTP
        $mail->Username = 'diavazdsp@diavaz.com'; // Dirección de correo electrónico
        $mail->Password = 'nttbycbzoljyqitu'; // Contraseña de correo electrónico
        $mail->Port = 465; // Puerto SMTP

        $Year =  date("Y");
        $mail->CharSet = 'UTF-8';
        // Configuración del remitente y destinatario
        $mail->setFrom('diavazdsp@diavaz.com', 'Inventario_TI');
        $mail->addAddress($destino->correo, 'Destinatario');
        //$IP = exec("curl https://checkip.amazonaws.com");
        //$Puerto = $_SERVER['SERVER_PORT'];

        $reset_link = "http://$destino->dominio:$destino->puerto/Inventario_TI/recuperacion.html?ftygui=$token";
        // $mail->addReplyTo('otra-direccion@dominio.com', 'Responder a'); // Opcional: dirección de respuesta

        // Contenido del correo
        $mail->isHTML(true); // Usar HTML en el correo
        $mail->Subject = 'Recuperación de contraseña';
        $mail->Body =
            '<html>
                <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: Arial, Helvetica, sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="420" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; border:1px solid #dcdcdc; overflow:hidden;">
                                    <!-- Header -->
                                    <tr>
                                        <td align="center" style="background-color:#0D3D7D; padding:25px;">
                                            <span style="color:#ffffff; font-size:22px; font-weight:bold; letter-spacing:0.5px;">
                                                Notificación Inventario TI
                                            </span>
                                        </td>
                                    </tr>
                                    <!-- Body -->
                                    <tr>
                                        <td style="padding:30px 30px 10px 30px; text-align:center;">
                                            <h2 style="color:#0D3D7D; margin:0 0 15px 0; font-size:22px;">
                                                Recuperación de contraseña
                                            </h2>
                                            <p style="font-size:15px; color:#555; line-height:1.6; margin-bottom:10px;">
                                                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Inventario TI.
                                            </p>
                                            <p style="font-size:15px; color:#555; line-height:1.6; margin-bottom:25px;">
                                                Haz clic en el siguiente botón para continuar:
                                            </p>
                                            <!-- Button -->
                                            <a href="' . $reset_link . '" 
                                            style="display:inline-block; background-color:#0D3D7D; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:8px; font-size:15px; font-weight:bold; letter-spacing:0.3px; box-shadow:0 4px 10px rgba(13,61,125,0.3);">
                                                Restablecer Contraseña
                                            </a>
                                            <p style="font-size:13px; color:#888; margin-top:30px; line-height:1.5;">
                                                Por tu seguridad, este enlace expirará en <strong>5 minutos</strong>. Si el tiempo se agota, deberás solicitar un nuevo enlace desde nuestra plataforma.<br>
                                            </p>
                                            <p style="font-size:13px; color:#888; margin-top:30px; line-height:1.5;">
                                                <strong>¿No solicitaste este cambio?</strong><br>
                                                No te preocupes, tu contraseña actual sigue siendo segura. Puedes ignorar este correo o contactar al equipo de soporte si crees que alguien está intentando acceder a tu cuenta.
                                            </p>
                                        </td>
                                    </tr>
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color:#f9fafc; text-align:center; padding:18px; font-size:12px; color:#999; border-top:1px solid #e6e6e6;">
                                            &copy; ' . $Year . ' Inventario T.I.
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>';
        $mail->AltBody = 'Recuperación de contraseña';

        // Enviar el correo
        $mail->send();
        return true;
    } catch (Exception $e) {
        return false;
    }
}

function email_reporte_mantenimiento($valores)
{
    // Incluye las librerías necesarias para el envío de correos y la conexión a BD
    include("../email/Exception.php");
    include("../email/PHPMailer.php");
    include("../email/SMTP.php");
    include("../conexion.php");

    $mail = new PHPMailer();

    $datos_equipo = $valores->datos;        // Datos del equipo a mantener
    $anio = $datos_equipo->anio;            // Año del mantenimiento
    $id_equipo = $datos_equipo->id;         // ID del equipo
    $region_val = $datos_equipo->zona ?? ''; // Zona/región del equipo

    // Define el prefijo del folio según la región del equipo
    $prefijo = 'MTO';
    $r_lower = mb_strtolower($region_val);
    if (strpos($r_lower, 'sur') !== false) {
        $prefijo = 'MTO-VHA-';
    } elseif (strpos($r_lower, 'tamp') !== false || strpos($r_lower, 'tampico') !== false) {
        $prefijo = 'MTO-TAMP-';
    } elseif (strpos($r_lower, 'norte') !== false || strpos($r_lower, 'poza rica') !== false || strpos($r_lower, 'pr') !== false) {
        $prefijo = 'MTO-PR-';
    }

    // Verifica si el equipo ya tiene un folio de reporte asignado
    $check_sql = "SELECT num_reporte FROM mantenimiento WHERE id_equipo = '$id_equipo' AND anio = '$anio'";
    $check_q = mysqli_query($con, $check_sql);
    $check_row = mysqli_fetch_assoc($check_q);

    if (!empty($check_row['num_reporte'])) {
        // Si ya tiene folio, lo reutiliza para no generar duplicados
        $report_code = $check_row['num_reporte'];
    } else {
        // Cuenta cuántos reportes existen en la misma región para generar el siguiente número de secuencia
        $seq_sql = "SELECT COUNT(*) AS cnt FROM mantenimiento m
                INNER JOIN inventario_ti_sur inv ON inv.id = m.id_equipo
                WHERE m.num_reporte IS NOT NULL
                AND inv.zona LIKE '%$region_val%'";
        // Nota: agregar AND m.anio = '$anio' si se desea reiniciar la secuencia por año
        $seq_q = mysqli_query($con, $seq_sql);
        $seq_num = 0;
        if ($seq_q) {
            $seq_row = mysqli_fetch_assoc($seq_q);
            $seq_num = (int)$seq_row['cnt'];
        }

        $seq_num++;     // Incrementa la secuencia para el nuevo folio
        $seq_formatted = str_pad($seq_num, 3, '0', STR_PAD_LEFT);  // Formatea con ceros a la izquierda (ej. 001)
        $report_code = $prefijo . $seq_formatted;                   // Construye el folio completo (ej. MTO-VHA-001)

        // Guarda el nuevo folio en la base de datos
        mysqli_query($con, "UPDATE mantenimiento SET num_reporte = '$report_code' WHERE id_equipo = '$id_equipo' AND anio = '$anio'");
    }

    try {
        // Configuración del servidor SMTP
        $mail->isSMTP(); // Usar el servidor SMTP
        $mail->Host = 'smtp.gmail.com'; // Servidor SMTP de Gmail (ajustar según el servidor que uses)
        $mail->SMTPSecure = "ssl";
        $mail->SMTPAuth = true; // Habilitar la autenticación SMTP
        $mail->Username = 'diavazdsp@diavaz.com'; // Dirección de correo electrónico
        $mail->Password = 'nttbycbzoljyqitu'; // Contraseña de correo electrónico
        $mail->Port = 465; // Puerto SMTP

        $Year =  date("Y");
        $Month = date("m");
        $mail->CharSet = 'UTF-8';
        // Configuración del remitente y destinatario
        $mail->setFrom('diavazdsp@diavaz.com', 'Inventario TI');
        $mail->addAddress($valores->correo, 'Destinatario');

        // Contenido del correo
        $mail->isHTML(true); // Usar HTML en el correo
        $mail->Subject = 'Mantenimiento de equipo: ' . $valores->datos->tipo . ' Folio ' . $report_code;
        // Cuerpo del correo en HTML con la información del equipo y tabla de detalles
        $mail->Body =
            '<html>
                <body style="font-family: Arial, sans-serif; background-color: #f9fafc; color: #333; margin: 0; padding: 0;">
                    <div style="max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #dcdcdc; text-align: center;">
                    <div style="background-color: #0D3D7D; color: #ffffff; padding: 20px; font-size: 20px; font-weight: bold;">
                        Mantenimiento Preventivo – Inventario TI
                    </div>
                    <div style="padding: 20px; text-align: center;">
                        <h2 style="color: #333333; margin-bottom: 15px; font-size: 22px;">Su equipo será revisado este mes</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #555; text-align: justify;">Le informamos que como parte de nuestro plan de mantenimiento preventivo, su equipo ' . $valores->datos->tipo . ' está 
                        programado para mantenimiento durante el mes </p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">Información del mantenimiento:</p>
                        <table style="width: 100%; margin-top: 15px; border-collapse: separate; border-spacing: 0 5px;font-size: 14px; color: #333;">
                            <tr style="background-color: #eef2f7; border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Equipo</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->tipo . '</td>
                            </tr>
                            <tr style=" border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Marca</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->marca . '</td>
                            </tr>
                            <tr style="background-color: #eef2f7; border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Número de serie</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->num_serie . '</td>
                            </tr>
                            <tr style=" border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Modelo</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->modelo . '</td>
                            </tr>
                            <tr style="background-color: #eef2f7; border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Ubicación</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->ubicacion . '</td>
                            </tr>
                            <tr style=" border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Usuario asignado</td>
                                <td style="padding: 10px; text-align: left;border-radius: 0 5px 5px 0;">' . $valores->datos->usuario . '</td>
                            </tr>
                        </table>
                    </div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmRyMTBmbGpxMmFzYmN5cDZ4aTgzamhpODloN21nenlhcWtzaGtubCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/5W0i0seIes4mDYtC0p/giphy.gif" alt="Animación mantenimiento" width="120" style="display: block; margin: 0 auto;" />
                    </div>
                    <div style="background-color: #f9fafc; color: #888; text-align: center; padding: 15px; font-size: 12px; border-top: 1px solid #e0e0e0;">
                        &copy; ' . $Year . ' Inventario TI.
                    </div>
                    </div>
                </body>
            </html>';
        $mail->AltBody = 'Mantenimiento de equipos';    // Versión de texto plano como alternativa

        // Enviar el correo
        $mail->send();
        // Marca el correo como enviado en la tabla de mantenimiento
        $sql = "UPDATE mantenimiento SET correo_enviado = 1 WHERE id_equipo = '$datos_equipo->id' AND  anio = '$datos_equipo->anio'";
        if (!mysqli_query($con, $sql)) {
            return "No se pudo actualizar la BD";
        }
        // Si el usuario no es 'NA', guarda o actualiza su correo en el catálogo de usuarios
        if ($valores->datos->usuario !== 'NA') {
            $user = $valores->datos->usuario;
            $sql_correo_usuario = "UPDATE cat_usuarios SET correo_usuario = '$valores->correo' WHERE nombre = '$user'";
            if (!mysqli_query($con, $sql_correo_usuario)) {
                return "No se pudo guardar el correo";
            }
        }

        return true;    // Retorna true si todo fue exitoso
    } catch (Exception $e) {
        return false;   // Retorna false si ocurre algún error durante el envío
    }
}

function correo_reporte_auditoria($valores)
{
    // Incluye las librerías necesarias para el envío de correos y la conexión a BD
    include("../email/Exception.php");
    include("../email/PHPMailer.php");
    include("../email/SMTP.php");
    include("../conexion.php");

    $mail = new PHPMailer();

    $datos_equipo = $valores->datos;    // Datos del equipo a auditar

    try {
        // Configuración del servidor SMTP
        $mail->isSMTP(); // Usar el servidor SMTP
        $mail->Host = 'smtp.gmail.com'; // Servidor SMTP de Gmail (ajustar según el servidor que uses)
        $mail->SMTPSecure = "ssl";
        $mail->SMTPAuth = true; // Habilitar la autenticación SMTP
        $mail->Username = 'diavazdsp@diavaz.com'; // Dirección de correo electrónico
        $mail->Password = 'nttbycbzoljyqitu'; // Contraseña de correo electrónico
        $mail->Port = 465; // Puerto SMTP

        $Year =  date("Y");
        $Month = date("m");
        $mail->CharSet = 'UTF-8';
        // Configuración del remitente y destinatario
        $mail->setFrom('diavazdsp@diavaz.com', 'Inventario TI');
        $mail->addAddress($valores->correo, 'Destinatario');

        // Contenido del correo
        $mail->isHTML(true); // Usar HTML en el correo
        $mail->Subject = 'Notificación de Auditoría TI: ' . $valores->datos->tipo . ' Folio ' . $valores->datos->id;
        // Cuerpo del correo en HTML con la información del equipo y tabla de detalles
        $mail->Body =
            '<html>
                <body style="font-family: Arial, sans-serif; background-color: #f9fafc; color: #333; margin: 0; padding: 0;">
                    <div style="max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #dcdcdc; text-align: center;">
                    <div style="background-color: #0D3D7D; color: #ffffff; padding: 20px; font-size: 20px; font-weight: bold;">
                        Auditoria de activos – Inventario TI
                    </div>
                    <div style="padding: 20px; text-align: center;">
                        <h2 style="color: #333333; margin-bottom: 15px; font-size: 22px;">Su equipo entrará en proceso de auditoría este mes</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #555; text-align: justify;">Le informamos que como parte de nuestro protocolo de control de activos y cumplimiento normativo, su equipo ' . $valores->datos->tipo . ' ha sido seleccionado 
                        para una auditoría programada para este mes. </p>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">Información del equipo:</p>
                        <table style="width: 100%; margin-top: 15px; border-collapse: separate; border-spacing: 0 5px;font-size: 14px; color: #333;">
                            <tr style="background-color: #eef2f7; border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Equipo</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->tipo . '</td>
                            </tr>
                            <tr style=" border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Marca</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->marca . '</td>
                            </tr>
                            <tr style="background-color: #eef2f7; border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Número de serie</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->num_serie . '</td>
                            </tr>
                            <tr style=" border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Modelo</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->modelo . '</td>
                            </tr>
                            <tr style="background-color: #eef2f7; border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Ubicación</td>
                                <td style="padding: 10px; text-align: left; border-radius: 0 5px 5px 0;">' . $valores->datos->ubicacion . '</td>
                            </tr>
                            <tr style=" border-radius: 5px;">
                                <td style="padding: 10px; text-align: left; font-weight: bold; width: 40%; border-radius: 5px 0 0 5px;">Usuario asignado</td>
                                <td style="padding: 10px; text-align: left;border-radius: 0 5px 5px 0;">' . $valores->datos->usuario . '</td>
                            </tr>
                        </table>
                    </div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmRyMTBmbGpxMmFzYmN5cDZ4aTgzamhpODloN21nenlhcWtzaGtubCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/5W0i0seIes4mDYtC0p/giphy.gif" alt="Animación mantenimiento" width="120" style="display: block; margin: 0 auto;" />
                    </div>
                    <div style="background-color: #f9fafc; color: #888; text-align: center; padding: 15px; font-size: 12px; border-top: 1px solid #e0e0e0;">
                        &copy; ' . $Year . ' Inventario TI.
                    </div>
                    </div>
                </body>
            </html>';

        $mail->AltBody = 'Auditoría de equipos';    // Versión de texto plano como alternativa

        // Enviar el correo
        $mail->send();

        // Marca el correo como enviado en la tabla de auditoría
        $sql = "UPDATE auditoria SET correo_enviado = 1 WHERE id_equipo = '$datos_equipo->id' AND  anio = '$datos_equipo->anio'";
        // var_dump($sql);
        if (!mysqli_query($con, $sql)) {
            return "No se pudo actualizar la BD";
        }
        // Si el usuario no es 'NA', guarda o actualiza su correo en el catálogo de usuarios
        if ($valores->datos->usuario !== 'NA') {
            $user = $valores->datos->usuario;
            $sql_correo_usuario = "UPDATE cat_usuarios SET correo_usuario = '$valores->correo' WHERE nombre = '$user'";
            if (!mysqli_query($con, $sql_correo_usuario)) {
                return "No se pudo guardar el correo";
            }
        }

        return true;    // Retorna true si todo fue exitoso
    } catch (Exception $e) {
        return false;   // Retorna false si ocurre algún error durante el envío
    }
}
