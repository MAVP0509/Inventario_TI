let respuesta

function server_supervisor(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_supervisores/controller_supervisores.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response) {
                //console.log(response);
                try {
                    resolve(JSON.parse(response))
                    //console.log(resolve(JSON.parse(response)))
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
    
    let response = await server_supervisor(model);

    datos = response.resultado;

    let table = $('#tabla1').DataTable();
    table.destroy();
        
    try {
        $("#tabla1").DataTable({
            data: datos,
            columns: [
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "nombre",
                    render: function(data, type, row, meta) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control
                    }
                },
                {
                    data: "cargo",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "region",
                    render: function(data, type, row) {
                        let control = `<label style="text-align: center">${data}</label>`
                        return control;
                    }
                },
                {
                    data: "habilitado",
                    render: function(data, type, row) {
                        let switchId = `switch-${row.id}`; // Usa ID único
                        let checked = (parseInt(data) === 1) ? 'checked' : ''; // Asegura que 1 = habilitado
                        let control =   `<div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success text-center">
                                            <input type="checkbox" class="custom-control-input switch-toggle" id="${switchId}"  data-id="${row.id}" ${checked}>
                                            <label class="custom-control-label" for="${switchId}"></label>
                                        </div>`
                        return control;
                    }
                },
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<div class="d-flex justify-content-center align-items-center">
                                        <button type="button" style="text-align: center" class="btn btn-warning icon" id="${data}" value="${data}" onclick="mostrar_registro(this)">
                                        <i class="fa-solid fa-pen-to-square fa-lg"></i></button></div>`
                        return control;
                    }
                },
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<div class="d-flex justify-content-center align-items-center">
                                        <button type="button" style="text-align: center" class="btn btn-danger icon" id="${data}" value="${data}" onclick="mostrar_registro(this)">
                                        <i class="fa-solid fa-trash-can fa-lg"></i></button></div>`
                        return control;
                    }
                }
            ],
            dom: `
                <'row mb-2'<'col-sm-6 text-left'f><'col-sm-6 text-right'<'btn-group'B>>>
                <'row'<'col-sm-12'tr>>
                <'row mt-2'<'col-sm-3'l><'col-sm-5 text-center'i><'col-sm-4 text-right'p>>
            `,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
                paginate: {
                    first: '<i class="fas fa-angle-double-left"></i>',
                    previous: '<i class="fas fa-angle-left"></i>',
                    next: '<i class="fas fa-angle-right"></i>',
                    last: '<i class="fas fa-angle-double-right"></i>'
                },
            },
            buttons: [
                {
                    html: `<button type="button" onclick="resguardo()" class="btn btn-info icon rounded mr-3" style="margin-left: 10px;" href="#" ><i class="fa-solid fa-file-export fa-lg"></i> Resguardo</button>`,
                },
                {
                    html: `<div>
                            <button type="button" class="btn btn-success rounded mr-3 icon" onclick="limpiar_campos()" >
                            <i class="fa-solid fa-pen-to-square fa-lg"></i> Crear Registro</button>
                        </div>`
                },
                {
                    html: `<div>
                            <button type="button" style="text-align: center" class="btn btn-danger rounded icon" onclick="confirmar_eliminacion()" >
                            <i class="fa-solid fa-trash fa-lg"></i> Eliminar Registro</button>
                        </div>`,//'<i class="fa-solid fa-trash fa-lg"></i> Eliminar registro',
                    //className: 'btn btn-danger rounded icon',
                    /* attr: {
                        title: 'Haz clic para eliminar un registro'
                    },
                    /* action: function (e, dt, node, config) {
                        
                    } */
                },
                
            ],
            stateSave: true,
            responsive: true,
           
        });
        
    } catch (error) {
        console.log(error)
    }

}



$('#tabla1 tbody').on('change', '.switch-toggle', function () {
    const id = $(this).data('id');
    const habilitado = $(this).is(':checked');
    let value

    if (habilitado){
        value = 1
    }else{
        value = 0
    }

    let model = {
        accion : 3,
        id : id,
        habilitado : value
    }

    supervisor_habilitado(model)
    //console.log(`ID: ${id}, nuevo estado: ${habilitado}`);
});

async function supervisor_habilitado(model) {
    await server_supervisor(model)
}