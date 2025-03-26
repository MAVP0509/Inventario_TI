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

    if($clientejson->accion==0){
        $respuesta_servidor->resultado = enviar_email($clientejson);
    } 
    print(json_encode($respuesta_servidor));


    function enviar_email($destino){
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
        
            // Configuración del remitente y destinatario
            $mail->setFrom('janny.garcia703@gmail.com', 'Inventario_TI');
            $mail->addAddress($destino->correo, 'Destinatario');
            // $mail->addReplyTo('otra-direccion@dominio.com', 'Responder a'); // Opcional: dirección de respuesta
        
            // Contenido del correo
            $mail->isHTML(true); // Usar HTML en el correo
            $mail->Subject = 'Asunto del correo';
            $mail->Body    = 'Este es el contenido del correo en <b>HTML</b>';
            $mail->AltBody = 'Este es el contenido alternativo en texto plano';
        
            // Enviar el correo
            $mail->send();
            /* if ($mail->send()){
                return true;
            }else{
                return $mail;
            } */
        } catch (Exception $e) {
            
        }
    }

