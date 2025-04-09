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

let datos = [];

async function consultar_informacion(params) {

    let model = {
        accion: 2
    };
    

    let response = await server_inventario(model);
    //console.log(response);
    datos = response.resultado;

    try {
        $("#tabla1").DataTable({
            data: datos,
            columns: [
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<div class="form-group form-check">
                            <input type="checkbox" class="form-check-input check-change"
                            onclick="selecionar_registro(${data})" value="${data}" id="check${data}">
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
                        let modal = new bootstrap.Modal(document.getElementById('modal-registro'));
                        modal.show();
                        mostrar_datos()
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
                        /* let modal = new bootstrap.Modal(document.getElementById('modal-editar'));
                        modal.show(); */
                        //mostrar_registro()
                        

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

let ususelect = [];
async function mostrar_datos(params) {

    let zona = "Base operativa región Sur";
    let registro = dayjs().format('YYYY-MM-DD HH:mm:ss');//new Date().toISOString().slice(0, 19).replace('T', ' ');

    $("#inp-zona").val(zona);
    $("#inp-fecha-entrega").val(registro);

    let modal = new bootstrap.Modal(document.getElementById('modal-registro'));
    modal.show();
}

registroSeleccionado ="";

/* async function mostrar_registro(params) {
    let zona = "Base operativa región Sur";
    let registro = dayjs().format('YYYY-MM-DD HH:mm:ss');//new Date().toISOString().slice(0, 19).replace('T', ' ');

    $("#inp-zona").val(zona);
    $("#inp-rubro").val(registroSeleccionado.rubro);
    $("#inp-af").val(registroSeleccionado.af);
    $("#inp-tipo").val(registroSeleccionado.tipo);
    $("#inp-marca").val(registroSeleccionado.marca);
    $("#inp-modelo").val(registroSeleccionado.modelo);
    $("#inp-num-serie").val(registroSeleccionado.num_serie);
    $("#inp-mac-adress").val(registroSeleccionado.mac_adress);
    $("#inp-ubicacion").val(registroSeleccionado.ubicacion);
    $("#inp-tag").val(registroSeleccionado.tag);
    $("#inp-usuario").val(registroSeleccionado.usuario);
    $("#inp-posicion").val(registroSeleccionado.posicion);
    $("#inp-fecha-entrega").val(registro);

    let modal = new bootstrap.Modal(document.getElementById('modal-editar'));
    modal.show();
} */

selecreg = [];

async function selecionar_registro(params) {

    let index = selecreg.indexOf(params); // Retorna el primer índice en el que se puede encontrar un elemento dado en el array,
    if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
        selecreg.push(params); // Añade uno o más elementos al final de un array
    } else {
        selecreg.splice(index, 1); 
    } 
    
}

let modal = ""

async function crear_registro(params) {
    
    let model = {
        accion: 0,
        zona: $("#inp-zona"),
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
        posicion: $("#inp-posicion").val().trim(),
        fecha_entrega: $("inp-fecha-entrega")
    }

    let server = await server_inventario(model);
    let response = JSON.parse(respuesta);

    
        if (response.resultado === true) {
            mostrar_alerta('success', '¡Registro exitoso!', 'El registro se ha creado correctamente.');
            
        } else {
            mostrarAlerta('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
        }
    /* modal = new bootstrap.Modal(document.getElementById('modal-registro'));
    modal.show(); */
    
    let table = $('#tabla1').DataTable();
    table.destroy();
    consultar_informacion();
    let modal = new bootstrap.getInstance(document.getElementById('modal-registro'));
    modal.hide();
}

async function editar_registro(params) {
    let model = {
        accion: 1,
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
        posicion: $("#inp-posicion").val().trim(),
    }

    let server = await server_inventario(model);
    let response = JSON.parse(respuesta);

    if (response.respuesta === true) {
        mostrar_alerta('success', '¡Edición exitosa!', 'El registro se ha actualizado correctamente.');

        let table = $('#tabla1').DataTable();
        table.destroy();
        consultar_informacion();
        let modal = new bootstrap.getInstance(document.getElementById('modal-editar'));
        modal.hide();
        
    } else {
        mostrar_alerta('error', 'Error', 'No se pudo editar el registro. Inténtalo nuevamente.');
    }

    consultar_informacion();
    model = new bootstrap.Modal(document.getElementById('modal-editar'));
    model.hide();
    
}

async function desactivar_registro(params) {
    let model = {
        accion: 3,
    }
}

/* async function eliminar_registro(params) {
    let response = await server_inventario({ accion: 4, id: id });
        if (response.resultado === true) {
            mostrar_alerta('success', '¡Eliminación exitosa!', 'El registro se ha eliminado correctamente.');
            $('#tabla1').DataTable().ajax.reload(); // Recargar la tabla
            $('#modal-registro').modal('hide');
        } else {
            mostrarAlerta('error', 'Error', 'No se pudo eliminar el registro. Inténtalo nuevamente.');
        }
} */

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