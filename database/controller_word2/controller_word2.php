<?php

require_once __DIR__ . '\..\..\libraries\PhpWord\Autoloader.php';
\PhpOffice\PhpWord\Autoloader::register();
\PhpOffice\PhpWord\Settings::setDefaultPaper('Letter');


    // Creating the new document...
    $phpWord = new \PhpOffice\PhpWord\PhpWord();

    /* Note: any element you append to a document must reside inside of a Section. */

    // Adding an empty Section to the document...
    $section = $phpWord->addSection();
    // Adding Text element to the Section having font styled by default...
    $section->addText(
        '"Learn from yesterday, live for today, hope for tomorrow. '
            . 'The important thing is not to stop questioning." '
            . '(Albert Einstein)'
    );

    /*
     * Note: it's possible to customize font style of the Text element you add in three ways:
     * - inline;
     * - using named font style (new font style object will be implicitly created);
     * - using explicitly created font style object.
     */

    // Adding Text element with font customized inline...
    $section->addText(
        '"Great achievement is usually born of great sacrifice, '
            . 'and is never the result of selfishness." '
            . '(Napoleon Hill)',
        array('name' => 'Tahoma', 'size' => 10)
    );

    // Adding Text element with font customized using named font style...
    $fontStyleName = 'oneUserDefinedStyle';
    $phpWord->addFontStyle(
        $fontStyleName,
        array('name' => 'Tahoma', 'size' => 10, 'color' => '1B2232', 'bold' => true)
    );
    $section->addText(
        '"The greatest accomplishment is not in never falling, '
            . 'but in rising again after you fall." '
            . '(Vince Lombardi)',
        $fontStyleName
    );

    // Adding Text element with font customized using explicitly created font style object...
    $fontStyle = new \PhpOffice\PhpWord\Style\Font();
    $fontStyle->setBold(true);
    $fontStyle->setName('Tahoma');
    $fontStyle->setSize(13);
    $myTextElement = $section->addText('"Believe you can and you\'re halfway there." (Theodor Roosevelt)');
    $myTextElement->setFontStyle($fontStyle);


    $wordfile = 'Prueba.docx';

    /* header("Content-Description: File Transfer");
    header('Content-Disposition: attachment; filename="' . $wordfile. '"');
    header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    header('Content-Transfer-Encoding: binary');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Expires: 0');
    header("Pragma: public"); */
   

    $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
    //$objWriter->save('php://output');
    $docxPath = __DIR__ . '/Prueba.docx';
    $objWriter->save($docxPath);


    $pdfPath = __DIR__ . '/Prueba.pdf';
    $libreoffice = ' "C:\Program Files\LibreOffice\program\soffice.bin"';
    $cmd = $libreoffice . ' --headless --convert-to pdf --outdir ' . escapeshellarg(__DIR__) . ' ' . escapeshellarg($docxPath);
    exec($cmd, $output, $result);

    if ($result === 0 && file_exists($pdfPath)) {
        // Enviar PDF al navegador
        header("Content-Type: application/pdf");
        header('Content-Disposition: attachment; filename="Prueba.pdf"');
        readfile($pdfPath);
    
        // Limpieza opcional
        unlink($docxPath);
        unlink($pdfPath);
        exit;
    } else {
        echo "❌ Error al generar el PDF<br><pre>";
        print_r($output);
        echo "</pre>";
    }
   
    //echo "<li><a href='helloWorld.docx' download>Descargar Word (.docx)</a></li>";
     
    exit;



