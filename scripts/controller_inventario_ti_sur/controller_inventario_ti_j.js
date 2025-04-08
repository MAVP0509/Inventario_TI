let respuesta

function server_inventario(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_inventario_ti_sur/controller_inventario_ti_j.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response) {
                try {
                    resolve(JSON.parse(response))
                    respuesta = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    });


}

let usuario = [];

async function consultar_informacion(params) {

    let model = {
        accion: 2
    };
    

    let response = await server_inventario(model);
    //console.log(response);
    usuario = response.resultado;

    try {
        $("#tabla1").DataTable({
            data: usuario,
            columns: [
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<div class="form-group form-check">
                            <input type="checkbox" class="form-check-input check-change">
                        </div>`
                        return control;
                    }
                },
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "zona",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "rubro",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "af",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "tipo",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "marca",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "modelo",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "num_serie",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "mac_adress",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "ubicacion",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "tag",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "usuario",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "posicion",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                }
            ],
            dom: `
                <'row'<'col-sm-3'l><'col-sm-6 text-center'f><'col-sm-3 text-right'B>>
                <'row'<'col-sm-12'tr>>
                <'row'<'col-sm-5'i><'col-sm-7'p>>
            `,
            buttons: [
                /* {
                    extend: 'excelHtml5',
                    text: 'Exportar a Excel',
                    className: 'btn btn-sm btn-success'
                },
                {
                    extend: 'pdfHtml5',
                    text: 'Exportar a PDF',
                    className: 'btn btn-sm btn-danger'
                },
                {
                    extend: 'print',
                    text: 'Imprimir',
                    className: 'btn btn-sm btn-primary'
                }, */
                {
                    text: 'Crear registro',
                    className: 'btn btn-sm btn-primary',
                    attr: {
                        style: 'background-color: green; color: white; border-radius: 8px; padding: 10px 20px;', // Estilos inline
                        title: 'Haz clic para agregar un usuario'
                    },
                    action: function (e, dt, node, config) {
                        crear_registro();
                    }
                },
                {
                    text: 'Editar registro',
                    className: 'btn btn-sm btn-primary',
                    attr: {
                        style: 'background-color: blue; color: white; border-radius: 8px; padding: 10px 20px;', // Estilos inline
                        title: 'Haz clic para agregar un usuario'
                    },
                    action: function (e, dt, node, config) {
                        $('#modal-registro').modal('show');
                    }
                }
            ],
            stateSave: true,
            resposive: true,
           
        });
    } catch (error) {
        console.log(error)
    }



}

let ususelect = "";
async function selecionar_datos(params) {
    for (let i = 0; i < usuarios.length; i++) {
        const element = usuarios[i];
        
        if (element.id === params.value) {
            ususelect = element;
            break;
            
        }
        modal
    }

    document.getElementById("inp-zona").value = ususelect.zona;
    document.getElementById("inp-fecha-entraga").value = ususelect.fecha_entrega;

    modal = new bootstrap.Modal(document.getElementById('modal-registro'));
    modal.show();
}

let modal = ""

async function crear_registro(params) {
    let model = {
        accion: 0,
        rubro: $("#inp-rubro").val().trim(),
        af: $("#inp-af").val().trim(),
        tipo: $("#inp-tipo").val().trim(),
        marca: $("#inp-marca").val().trim(),
        modelo: $("#inp-modelo").val().trim(),
        num_serie: $("#inp-num-serie").val().trim(),
        mac_adress: $("#inp-mac-adress").val().trim(),
        ubicacion: $("#inp-ubicacion").val().trim(),
        tag: $("#inp-tag").val().trim(),
        usuario: $("#inp-usuario").val().trim(),
        posicion: $("#inp-posicion").val().trim()
        
    }

    let server = await server_inventario(model);
    let response = JSON.parse(respuesta);

    try {
        if (response.resultado === true) {
            //mostrar_alerta('success', '¡Registro exitoso!', 'El registro se ha creado correctamente.');
        } else {
            mostrarAlerta('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
        }
    } catch (error) {
        
    }
    modal = new bootstrap.Modal(document.getElementById('modal-registro'));
    modal.show();
    
}

async function editar_registro(params) {
    
}

async function eliminar_registro(params) {
    let response = await server_inventario({ accion: 4, id: id });
        if (response.resultado === true) {
            mostrar_alerta('success', '¡Eliminación exitosa!', 'El registro se ha eliminado correctamente.');
            $('#tabla1').DataTable().ajax.reload(); // Recargar la tabla
        } else {
            mostrarAlerta('error', 'Error', 'No se pudo eliminar el registro. Inténtalo nuevamente.');
        }
}

function mostrar_alerta(tipo, titulo, mensaje) {
    Swal.fire({
        icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
        title: titulo,
        text: mensaje,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
}