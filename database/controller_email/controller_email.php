<?php

use PHPMailer\PHPMailer\PHPMailer;

    header('Content-Type: text/html; charset=UTF-8');
    date_default_timezone_set('America/Mexico_City');

    $clientejson = json_decode($_POST['trama']);

    $respuesta_servidor = new stdClass();


    /* $persona= new stdClass();
    $persona->Nombre = "oswaldo";
    $persona->fechanac = date("Y-m-d H:i:s");
    print("Hola soy".$persona->Nombre ."hoy es". $persona->fechanac  );
 */

   // print($persona->Nombre);
    //var_dump($persona);
    //print($clientejson->nombre);

    if ($clientejson->accion==0) {
        $respuesta_servidor->resultado = verificar_email($clientejson->correo);
    } 
    print(json_encode($respuesta_servidor));


    function verificar_email($correo){ //Verifica que el correo existe y genera el token
        include("../conexion.php");

        $sql="SELECT * FROM usuario WHERE correo= '$correo'";
        $query = mysqli_query($con,$sql);

        if ($query->num_rows > 0) { //verifica email
            $usuario =mysqli_fetch_assoc($query);
            $token = bin2hex(random_bytes(4)); //Creación del token
            $token_expiracion = date("Y-m-d H:i:s", time() + 300); //fecha del token
            token_expirados($correo);
            $update_token_sql = "UPDATE usuario SET token = '$token', token_expiracion = '$token_expiracion' WHERE correo = '$correo'";
            if (mysqli_query($con, $update_token_sql)) {
                return email_recuperacion($correo, $token);
            }
            else {
                return false;
            }
        } else {
            return false;
        }
    }

    function token_expirados($correo) {
        include("../conexion.php");

        $sql = "UPDATE usuario SET token = NULL, token_expiracion = NULL WHERE token_expiracion < NOW() AND correo='$correo'";
        mysqli_query($con, $sql);

    }

    function email_recuperacion($destino, $token) {
        
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
            $mail->Username = 'janny.garcia703@gmail.com'; // Tu dirección de correo electrónico
            $mail->Password = 'cgwrbvbjzgmjuyws'; // Tu contraseña de correo electrónico
            $mail->Port = 465; // Puerto SMTP
            
            $Year =  date("Y");
            $mail->CharSet = 'UTF-8';
            // Configuración del remitente y destinatario
            $mail->setFrom('janny.garcia703@gmail.com', 'Inventario_TI');
            $mail->addAddress($destino, 'Destinatario');
            $reset_link = "http://localhost/Inventario_TI/recuperacion.html?ftygui=$token";
            // $mail->addReplyTo('otra-direccion@dominio.com', 'Responder a'); // Opcional: dirección de respuesta
        
            // Contenido del correo
            $mail->isHTML(true); // Usar HTML en el correo
            $mail->Subject = 'Recuperación de contraseña';
            $mail->Body = 
            $mail->Body = 
            '<html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f9fafc;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                        }
                        .email-container {
                            max-width: 400px;
                            background-color: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                            border: 1px solid #e0e0e0;
                            text-align: center;
                        }
                        .header {
                            background-color: #007bff;
                            color: #ffffff;
                            padding: 20px;
                            text-align: center;
                            font-size: 20px;
                            font-weight: bold;
                        }
                        .content {
                            padding: 20px;
                            text-align: center;
                        }
                        .content h2 {
                            color: #007bff;
                            margin-bottom: 15px;
                            font-size: 22px;
                        }
                        .content p {
                            font-size: 16px;
                            line-height: 1.6;
                            color: #555;
                            margin-bottom: 20px;
                        }
                        .content a {
                            display: inline-block;
                            background-color: #007bff;
                            color: #ffffff;
                            text-decoration: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            font-size: 16px;
                            font-weight: bold;
                            margin-top: 10px;
                        }
                        .content a:hover {
                            background-color: #0056b3;
                        }
                        .footer {
                            background-color: #f9fafc;
                            color: #888;
                            text-align: center;
                            padding: 15px;
                            font-size: 12px;
                            border-top: 1px solid #e0e0e0;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            Notificación de Inventario_TI
                        </div>
                        <div class="content">
                            <h2>Recuperación de contraseña</h2>
                            <p>Hemos recibido una solicitud para recuperar tu contraseña.</p>
                            <p>Haz clic en el botón de abajo para restablecer tu contraseña:</p>
                            <a href="'.$reset_link.'">Restablecer Contraseña</a>
                            <p>Este mensaje es válido por 5 minutos.</p>
                            <p>Si no solicitaste este cambio, ignora este correo.</p>
                        </div>
                        <div class="footer">
                            &copy; '.$Year.' Inventario_TI. Todos los derechos reservados.
                        </div>
                    </div>
                </body>
            </html>';
            $mail->AltBody = 'Recuperación de contraseña.';
        
            // Enviar el correo
            $mail->send();
            /* if ($mail->send()) {
                return "correo enviado correctamente.";
            } else {
                return "Error al enviar el correo";
            } */
            return true;

            } catch (Exception $e) {
            return false;
        }
    }