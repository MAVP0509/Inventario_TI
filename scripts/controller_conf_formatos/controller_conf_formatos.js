/* function server_marca(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_conf_marca/controller_conf_marca.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                //console.log(response);
                try {
                    resolve(JSON.parse(response))
                    //console.log(resolve(JSON.parse(response)))
                } catch (error) {
                    reject(error)
                }
            }
        })
    });
} */

// Get a reference to the file input element
let dominio = window.location.hostname
let puerto = location.port
let ruta = "htttp://"+ dominio + ":" + "puerto" + "/inventario_I/database/controller_excel/"

FilePond.registerPlugin(FilePondPluginFileValidateType);

let fileResguardo = document.getElementById('resguardo-file')

// Create a FilePond instance
const pond = FilePond.create(fileResguardo, {
    maxFiles: 1,
    labelIdle: 'Arrastra y suelta tu archivo .xlsx o <span class="filepond--label-action"> Examina </span>',
    allowMultiple: false,
    dropOnPage: true,
    dropValidation: true,
    instantUpload: false,
    acceptedFileTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    labelFileTypeNotAllowed: 'Archivo no válido. Solo se permiten archivos .xlsx',


    server: {
        process: {
            url: "database/controller_excel/controller_excel.php",
            method: 'POST',
            name: 'resguardo',
            withCredentials: false,
            ondata: (formData) => {
                const trama = {
                    accion: 1,
                };
                formData.append('trama', JSON.stringify(trama));
                return formData;
            },
            onload: (response) => {
                try {
                    const data = JSON.parse(response); // <- convierte string en objeto
                    if (data.resultado.error) {
                        //console.error("Error del servidor:", data.resultado.error);
                        alert("Error: " + data.resultado.error);
                    } else {
                        //console.log("Archivo subido:", data);
                        alert("Subido: " + data.resultado.mensaje);
                        window.open(ruta+data.resultado.mensaje, '_blank');
                        // Aquí puedes usar data.ruta si necesitas mostrarlo
                    }

                } catch (e) {
                    console.error("Error al parsear respuesta:", e);
                }
            },
            onerror: (error) => {
                console.error('Error al subir:', error);
                alert("Error al subir archivo.");
            }
        },
    }
});