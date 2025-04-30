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
                            <button type="button" onclick="nuevo_supervisor()" class="btn btn-success icon"><i class="fa-solid fa-plus fa-lg"></i> Nuevo Supervisor</button>
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

//*TODO Controlar el switch de la tabla para activar o desactivar supervisores
$('#tabla1 tbody').on('change', '.switch-toggle', function () {
    const switchElement = $(this);
    const id = switchElement.data('id');
    const isChecked = switchElement.is(':checked');

    const table = $('#tabla1').DataTable();
    const rowData = table.row(switchElement.closest('tr')).data();
    const region = rowData.region;

    const data = table.rows().data();

    // Contar cuántos están habilitados en la misma región
    let habilitadosEnRegion = 0;
    data.each(function (item) {
        if (item.region === region && parseInt(item.habilitado) === 1) {
            habilitadosEnRegion++;
        }
    });

    if (isChecked) {
        // Validar: si ya hay uno habilitado en la región, deshabilitarlo
        if (habilitadosEnRegion >= 1) {
            data.each(function (item, index) {
                if (item.region === region && item.id !== id && parseInt(item.habilitado) === 1) {
                    // Deshabilitar visualmente
                    const rowIdx = table.row(function (idx, data, node) {
                        return data.id === item.id;
                    });
                    const checkbox = $(table.row(rowIdx).node()).find('.switch-toggle');
                    checkbox.prop('checked', false);

                    // Actualizar en DataTable y backend
                    item.habilitado = 0;
                    supervisor_habilitado({
                        accion: 3,
                        id: item.id,
                        habilitado: 0
                    });
                }
            });
        }

        // Actualizar actual habilitado
        rowData.habilitado = 1;
        supervisor_habilitado({
            accion: 3,
            id: id,
            habilitado: 1
        });

    } else {
        // Si este es el único habilitado, no permitir deshabilitar
        if (habilitadosEnRegion <= 1) {
            //alert('Debe haber al menos un supervisor habilitado por región.');
            mostrar_toast('warning', 'Advertencia', 'Debe haber un supervisor habilitado por región.');
            switchElement.prop('checked', true);
            return;
        }

        // Actualizar y guardar
        rowData.habilitado = 0;
        supervisor_habilitado({
            accion: 3,
            id: id,
            habilitado: 0
        });
    }
});

async function supervisor_habilitado(model) {
    await server_supervisor(model)
}

//TODO Funciones para un nuevo supervisor
function nuevo_supervisor(){
    limpiar_campos_nuevo_supervisor()

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
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }

    let model = {
        accion : 0,
        nombre : $('#inp-nombre').val().trim(),
        cargo  : $('#inp-cargo').val().trim(),
        region : $('#inp-region').val().trim(),
    }

    let server = await server_supervisor(model)

    let resultado = JSON.parse(respuesta)

    if(resultado.resultado === true){
        mostrar_toast("success", "Supervisor registrado", "El supervisor ha sido registrado exitosamente")
        consultar_informacion()   
        $("#modalInsertar").modal('hide');

    }else{
        mostrar_toast("error", "Error", "Supervisor ya existente")
        return
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

        campo.addEventListener('input', function () {
            if (campo.value.trim()) {
                campo.classList.remove('is-invalid');
            }
        });
    });

    return valido;
}

function limpiar_campos_nuevo_supervisor(){
    /* let inputs = document.getElementsByName('insertMdl');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = ""; // Limpia el valor del input
        inputs[i].classList.remove('is-invalid'); // Elimina la clase de validación
    } */
    
    $('.select').each(function () {
        $(this).val(null).trigger('change'); // Restablece el valor y actualiza visualmente
        $(this).removeClass('is-invalid'); // Elimina la clase de validación
    });

    general_select2({
        selectId: 'inp-nombre',
        tabla: 'inventario_ti_sur',
        campo: 'usuario',
        placeholder: 'Seleciona un usuario',
        dropdownParent: '#modalInsertar',
        tags: true
      });
    
    general_select2({
        selectId: 'inp-cargo',
        tabla: 'inventario_ti_sur',
        campo: 'posicion',
        placeholder: 'Seleciona un cargo',
        dropdownParent: '#modalInsertar',
        tags: true
      });

    general_select2({
        selectId: 'inp-region',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Seleccione una región',
        dropdownParent: '#modalInsertar',
        tags: true,
    });
}

//TODO Funciones para editar los supervisores
let selecreg =""

async function mostrar_registro(params) {
    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];
        if(element.id===params.value){
            selecreg = element;
            break;
        }
    }
    // Limpia y carga los select
    await general_select2({
        selectId: 'edi-nombre',
        tabla: 'inventario_ti_sur',
        campo: 'usuario',
        placeholder: 'Selecione un nombre',
        dropdownParent: '#modalEditar',
        tags: true
    })
    
    await general_select2({
        selectId: 'edi-cargo',
        tabla: 'inventario_ti_sur',
        campo: 'posicion',
        placeholder: 'Selecione un cargo',
        dropdownParent: '#modalEditar',
        tags: true
    })
    
    await general_select2({
        selectId: 'edi-region',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Seleccione una region',
        dropdownParent: '#modalEditar',
    })
    
        $('#edi-nombre').val(selecreg.nombre).trigger('change');
        $('#edi-cargo').val(selecreg.cargo).trigger('change');
        $('#edi-region').val(selecreg.region).trigger('change');

        $("#modalEditar").modal('show');
}

async function editar_supervisor(params) {
    
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

function mostrar_toast(tipo, titulo, mensaje) {
    Swal.fire({
        icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
        title: titulo,
        text: mensaje,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
    });
}