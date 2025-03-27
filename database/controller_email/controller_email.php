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
        $respuesta_servidor->resultado = recuperar_email($clientejson);
    } 
    print(json_encode($respuesta_servidor));


    function recuperar_email($destino) {
        //include("../conexion.php");
        include("../email/Exception.php");
        include("../email/PHPMailer.php");
        include("../email/SMTP.php");

       /*  $sql="SELECT * FROM usuario WHERE correo= '$destino->correo'";
        $query = mysqli_query($con,$sql);

        if ($query->num_rows > 0){
            return true;
        } */

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
            $mail->addAddress($destino->correo, 'Destinatario');
            // $mail->addReplyTo('otra-direccion@dominio.com', 'Responder a'); // Opcional: dirección de respuesta
        
            // Contenido del correo
            $mail->isHTML(true); // Usar HTML en el correo
            $mail->Subject = 'Asunto del correo';
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
                            <p>Este es un correo de prueba con contenido en <b>HTML</b>. Gracias por usar nuestro sistema.</p>
                            <p>Si necesitas más información, haz clic en el botón de abajo:</p>
                            <button></button>
                        </div>

                        <div class="footer">
                            <p>&copy; <span id="año"> '.$Year.'</span> Inventario_TI. Todos los derechos reservados.</p>
                        </div>

                        
                    </body>
                    
            </html>';
            $mail->AltBody = 'Este es el contenido alternativo en texto plano';
        
            // Enviar el correo
            $mail->send();

            /* if ($mail->send()) {
                return "correo enviado correctamente.";
            } else {
                return "Error al enviar el correo";
            } */

            return true;

        } catch (Exception $e) {
            /* return "Error al enviar el correo: {$mail->ErrorInfo}"; */
            return false;
        }
    }


