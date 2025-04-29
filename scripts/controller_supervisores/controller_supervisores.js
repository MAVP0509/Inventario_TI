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
                    html: `<div>
                            <button type="button" onclick="nuevo_supervisor()" class="btn btn-success icon"><i class="fa-solid fa-plus fa-lg"></i> Nuevo Usuario</button>
                        </div>`,
                },
                
            ],
            stateSave: true,
            responsive: true,
           
        });
        
    } catch (error) {
        console.log(error)
    }

}


//*Controlar el switch de la tabla para activar o desactivar supervisores
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


function nuevo_supervisor(){
    limpiar_campos()

    $("#modalInsertar").modal('show');
}

async function insertar_supervisor() {
    // Campos requeridos para validación
    const validacion = [
        "inp-nombre",
        "inp-cargo",
        "inp-region",
    ];
    if (!validar_campos(validacion)) {
        mostrar_alerta('error', 'Error', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }
}



function validar_campos(campos) {
    let valido = true;

    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (!campo) {
            valido = false;
            return;
        }

        if ($(campo).hasClass('is-required') && !campo.value.trim()) {
            campo.classList.add('is-invalid'); // Agrega la clase de advertencia
            valido = false;
        } else if (!campo.value.trim()) {
            campo.classList.add('is-invalid'); // Agrega la clase de advertencia
            valido = false;
        } else {
            campo.classList.remove('is-invalid'); // Remueve la clase si el campo es válido
        }

        /* if (!campo.value.trim()) {
            campo.classList.add('is-invalid'); // Agrega la clase de advertencia
            valido = false;
        } else {
            campo.classList.remove('is-invalid'); // Remueve la clase si el campo es válido
        } */

        campo.addEventListener('input', function () {
            if (campo.value.trim()) {
                campo.classList.remove('is-invalid');
            }
        });
    });

    return valido;
}

function limpiar_campos(){
    let inputs = document.getElementsByName('insertMdl');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = ""; // Limpia el valor del input
        inputs[i].classList.remove('is-invalid'); // Elimina la clase de validación
    }
    
    $('.select').each(function () {
        $(this).val(null).trigger('change'); // Restablece el valor y actualiza visualmente
        $(this).removeClass('is-invalid'); // Elimina la clase de validación
    });

    general_select2({
        selectId: 'inp-nombre',
        tabla: 'inventario_ti_sur',
        campo: 'usuario',
        placeholder: 'Seleciona un usuario',
        dropdownParent: '#insertMdl',
        tags: true
      });
    
    general_select2({
        selectId: 'inp-cargo',
        tabla: 'inventario_ti_sur',
        campo: 'posicion',
        placeholder: 'Seleciona un cargo',
        dropdownParent: '#modal-registro',
        tags: true
      });

    general_select2({
        selectId: 'inp-usuario',
        tabla: 'inventario_ti_sur',
        campo: 'usuario',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#modal-registro',
    });

    general_select2({
        selectId: 'inp-posicion',
        tabla: 'inventario_ti_sur',
        campo: 'posicion',
        placeholder: 'Seleccione un cargo',
        dropdownParent: '#modal-registro',
    });
}

async function general_select2({selectId, tabla, campo, placeholder, dropdownParent, tags}){
    //try {
        const response = await server_supervisor({
            accion: 4,
            tabla: tabla, 
            campo: campo
        });

        //console.log('Respuesta del servidor para select2:', response);

        const opciones = response.resultado.map(item => ({
            id: item[campo] || '',
            text: item[campo] || ''
          }));

        const $select = $('#' + selectId);
        $select.empty().append(new Option('', '', false, false));

        $select.select2({
            theme: 'bootstrap4',
            allowClear: true,
            placeholder: placeholder,
            tags: tags,
            dropdownParent: $(dropdownParent),
            data: opciones
        });

        $select.val(null).trigger('change');

    //} catch (error) {
        
    //}
  }