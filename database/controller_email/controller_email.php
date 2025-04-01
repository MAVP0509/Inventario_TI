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

    function verificar_email($correo){
        include("../conexion.php");

        $sql="SELECT * FROM usuario WHERE correo= '$correo'";
        $query = mysqli_query($con,$sql);

        if ($query->num_rows > 0) {
            $usuario =mysqli_fetch_assoc($query);
            $token = bin2hex(random_bytes(4)); //Creación del token
            $token_expiracion = date("Y-m-d H:i:s", time() + 300);
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
            // Configuración del remitente y destinatario
            $mail->setFrom('janny.garcia703@gmail.com', 'Inventario_TI');
            $mail->addAddress($destino, 'Destinatario');
            $reset_link = "http://localhost/Inventario_TI/login.html?token=$token";
            // $mail->addReplyTo('otra-direccion@dominio.com', 'Responder a'); // Opcional: dirección de respuesta
        
            // Contenido del correo
            $mail->isHTML(true); // Usar HTML en el correo
            $mail->Subject = 'Recuperación de contraseña';
            $mail->Body = 
            '<html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f9;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            flex-direction: column;
                            min-height: 100vh;
                        }
                        .header {
                            background-color: #007bff;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            font-size: 24px;
                            font-weight: bold;
                        }
                        .card {
                            border: 1px solid #ddd;
                            border-radius: 10px;
                            width: 350px;
                            margin: 20px auto;
                            background-color: #fff;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            text-align: center;
                            padding: 20px;
                        }
                        .card h2 {
                            color: #007bff;
                            margin-bottom: 15px;
                        }
                        .card p {
                            font-size: 16px;
                            line-height: 1.5;
                            color: #555;
                        }
                        .footer {
                            background-color: #f4f4f9;
                            color: #666;
                            text-align: center;
                            padding: 10px;
                            font-size: 12px;
                            margin-top: auto;
                        }
                    </style>
                </head>

                    <body>
                        <div class="header">
                            Notificación de Inventario_TI
                        </div>

                        <div class="card">
                            <h2>Recuperación de contraseña</h2>
                            <p>Hemos recibido una solicitud para recuperar tu contraseña.</p>
                            <p>Haz clic en el enlace para restablecer su contraseña:</p>
                            <a href="'.$reset_link.'">Restablecer Contraseña</a>
                            <p>Este token es valido por 5 minutos.</p>
                            <p>Si no solicitaste este cambio ignore este correo.</p>
                        </div>

                        <div class="footer">
                            <p>&copy; <span id="año"> '.$Year.'</span> Inventario_TI. Todos los derechos reservados.</p>
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