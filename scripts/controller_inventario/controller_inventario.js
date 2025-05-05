let respuesta

function server_inventario(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_inventario/controller_inventario.php",
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

function server_excel(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_excel/controller_excel.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response) {
                try {
                    resolve(JSON.parse(response))
                    Swal.close()
                    //console.log(resolve(JSON.parse(response)))
                    respuesta = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    });


}

window.addEventListener('load', function () {
    // Leemos el mensaje del registro desde localStorage
    const mensajeRegistro = sessionStorage.getItem('bienvenido');
    
    if (mensajeRegistro) {
        // Si el mensaje existe, mostramos el toast
        mostrar_alerta('success', 'Bienvenido', mensajeRegistro);



        // Eliminamos el mensaje para evitar que aparezca nuevamente
        sessionStorage.removeItem('bienvenido');
    }
})

let datos = [];

async function consultar_informacion(params) {
    /* let usuarioLog = JSON.parse(sessionStorage.getItem('user'))
    let user = document.getElementById('user')
    user.textContent = usuarioLog.resultado[0] */
    
    let model = {
        accion: 2
    };
    
    let response = await server_inventario(model);
    //console.log(response);
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
                        let control = `<div class="form-group form-check">
                            <input type="checkbox" class="form-check-input form-control-lg"
                            onclick="selecionar_registro(${data})" value="${data}" id="check${data}">
                        </div>`
                        return control;
                    }
                },
                {
                    data: "id",
                    render: function(data, type, row, meta) {
                        let control = `<label style="font-weight: normal; font-size: 12px; text-align: center;">${meta.row + 1}</label>`;
                        return control;
                    }
                },
                {
                    data: "zona",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        //data ? data.replace(/_/g, '...') : "NA"
                        return control;
                    }
                },
                {
                    data: "rubro",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "af",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "tipo",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "marca",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "modelo",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }
                },
                {
                    data: "num_serie",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "ubicacion",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "tag",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "usuario",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "posicion",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "fecha_entrega",
                    render: function(data, type, row) {
                        let control = `<label style="font-weight: normal; font-size: 12px;">${data ? (data.length > 20 ? data.substring(0, 20) + "..." : data) : "NA"}</label>`
                        return control;
                    }, 
                },
                {
                    data: "id",
                    render: function(data, type, row) {
                        let control = `<div class="d-flex justify-content-center align-items-center">
                                        <button type="button" style="text-align: center" class="btn btn-warning icon" id="${data}" value="${data}" onclick="mostrar_registro(this)">
                                        <i class="fa-solid fa-pen-to-square fa-lg"></i></button></div>`
                                        return control;
                    }, //orderable: false
                }
            ],
            dom: `
                <'row mb-2'<'col-sm-6 text-left'f><'col-sm-6 text-right'<'btn-group'B>>>
                <'row'<'col-sm-12 text-center'tr>>
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
            select: {
                style: 'multi', // Permite selecionar múltiples filas
                selector: 'td:not(:first-child)' // Evita selecionar al hacer click en el checkbox (opcional)
            },
            rowCallback: function (row, data) {
                $(row).on('click', function() {

                    if ($(event.target).closest('.btn-warning.icon').length > 0) {
                        return;
                    }
                    
                    const checkbox = $(this).find('input[type="checkbox"]');
                    const isChecked = checkbox.prop('checked');
                    
                    checkbox.prop('checked', !isChecked); // Alterna el estado del checkbox
                    // Muestra la selección
                    if (!isChecked) {
                        $(this).attr('style', 'background-color: #d1ecf1; color: #0c5460;'); // Estilo para seleccionado
                    } else {
                        $(this).removeAttr('style'); // Deselecionar
                    }
                    selecionar_registro(data.id); // Llama a la función para manejar la selección
                });
            },
            buttons: [
                {
                    html: `<button type="button" onclick="resguardo()" class="btn btn-info icon rounded mr-3" style="margin-left: 10px;" href="#" ><i class="fa-solid fa-file-export fa-lg"></i> Resguardo</button>`,
                },
                {
                    html: `<div>
                            <button type="button" class="btn btn-success rounded mr-3 icon" onclick="limpiar_campos()" >
                            <i class="fa-solid fa-plus fa-lg"></i> Crear Registro</button>
                        </div>`
                },
                {
                    html: `<div>
                            <button type="button" style="text-align: center" class="btn btn-danger rounded icon" onclick="confirmar_eliminacion()" >
                            <i class="fa-solid fa-trash-can fa-lg"></i> Eliminar Registro</button>
                        </div>`
                },
                
            ],
            stateSave: true,
            resposive: true,
            autoWidth: false,
            scrollX: true,
            fixedColumns: {
                right: 1
            },
        });

        const table = $('#tabla1').DataTable();

        $('.dataTables_filter input').off().on('input', function () {
            const searchValue = this.value.trim(); // Captura el valor ingresado
            console.log('Valor ingresado:', searchValue);
        
            if (searchValue === '') {
                table.search('').draw(); // Limpia la búsqueda si está vacío
                return;
            }
        
            // Divide los términos por comas, elimina espacios y caracteres especiales
            const terms = searchValue.split(',').map(term =>
                term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            ).filter(term => term !== '');
        
            console.log('Términos procesados:', terms);
        
            // Une los términos con el operador OR para crear una expresión regular
            const regex = terms.join('|');
            console.log('Expresión regular generada:', regex);
        
            // Aplica la búsqueda con la expresión regular
            table.search(regex, true, false).draw(); // true: usa regex, false: desactiva búsqueda inteligente
        });
        
    } catch (error) {
        console.log(error)
    }

}


let selecreg ="";
let modalE

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
        selectId: 'edi-rubro',
        tabla: 'inventario_ti_sur',
        campo: 'rubro',
        placeholder: 'Selecione un rubro',
        dropdownParent: '#modal-editar',
        tags: true
    })
    
    await general_select2({
        selectId: 'edi-tipo',
        tabla: 'inventario_ti_sur',
        campo: 'tipo',
        placeholder: 'Selecione un rubro',
        dropdownParent: '#modal-editar',
        tags: true
    })
    
    await general_select2({
        selectId: 'edi-usuario',
        tabla: 'inventario_ti_sur',
        campo: 'usuario',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#modal-editar',
    })
    await general_select2({
        selectId: 'edi-posicion',
        tabla: 'inventario_ti_sur',
        campo: 'posicion',
        placeholder: 'Seleccione un cargo',
        dropdownParent: '#modal-editar',
    })
        document.getElementById("edi-zona").value = selecreg.zona;
        $('#edi-rubro').val(selecreg.rubro).trigger('change');
        document.getElementById("edi-af").value = selecreg.af;
        $('#edi-tipo').val(selecreg.tipo).trigger('change');
        document.getElementById("edi-marca").value = selecreg.marca;
        document.getElementById("edi-modelo").value = selecreg.modelo;
        document.getElementById("edi-num-serie").value = selecreg.num_serie;
        document.getElementById("edi-ubicacion").value = selecreg.ubicacion;
        document.getElementById("edi-tag").value = selecreg.tag;
        $('#edi-usuario').val(selecreg.usuario).trigger('change');
        $('#edi-posicion').val(selecreg.posicion).trigger('change');
        document.getElementById("edi-fecha-entrega").value = selecreg.fecha_entrega;

        modalE = new bootstrap.Modal(document.getElementById('modal-editar'));
        modalE.show();
}

let ususelect = [];

async function crear_registro() {
    // Campos requeridos para validación
    const validacion = [
        "inp-zona",
        "inp-rubro",
        "inp-tipo",
        "inp-ubicacion",
        "inp-marca",
        "inp-modelo",
        "inp-num-serie",
    ];

    if (!$('#inp-tag').prop('disabled')) {
        validacion.push('inp-tag');
    }

    // Validar campos
    if (!validar_campos(validacion)) {
        mostrar_alerta('error', 'Error', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }

    // Crear el modelo con los datos del formulario
    let model = {
        accion: 0,
        zona: $("#inp-zona").val().trim(),
        rubro: $("#inp-rubro").val().trim(),
        af: $("#inp-af").val().trim(),
        tipo: $("#inp-tipo").val().trim(),
        marca: $("#inp-marca").val().trim(),
        modelo: $("#inp-modelo").val().trim(),
        num_serie: $("#inp-num-serie").val().trim().toUpperCase(),
        ubicacion: $("#inp-ubicacion").val().trim(),
        tag: $("#inp-tag").val().trim(),
        usuario: $("#inp-usuario").val().trim(),
        posicion: $("#inp-posicion").val().trim(),
        fecha_entrega: $("#inp-fecha-entrega").val()
    };

    // Enviar datos al servidor
    let respuesta = await server_inventario(model);

    // Validar respuesta del servidor
    const serie = document.getElementById('inp-num-serie');
    serie.classList.remove('is-invalid'); // Remover clase de error si existía

    if (respuesta.resultado === true) {
        let table = $('#tabla1').DataTable();
        table.destroy();
        consultar_informacion();
        $("#modal-registro").modal('hide');
        mostrar_alerta('success', '¡Registro exitoso!', 'El registro se ha creado correctamente.');
    } else if (respuesta.resultado === false) {
        if (respuesta.mensaje === "Número de serie duplicado") {
            serie.classList.add('is-invalid'); // Marcar el campo como inválido si hay un número de serie duplicado
            mostrar_alerta('warning', 'Número de serie duplicado', 'Este número de serie ya está registrado.');
        } else {
            mostrar_alerta('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
        }
    } else {
        mostrar_alerta('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
    }
    

}

async function editar_registro(params) {
    //deshabilitar_campo();
    const validacion = [
        "inp-zona",
        "inp-rubro",
        "inp-tipo",
        "inp-ubicacion",
    ];
    let model = {
        accion: 1,
        id: selecreg.id,
        zona: $("#edi-zona").val().trim(),
        rubro: $("#edi-rubro").val().trim(),
        af: $("#edi-af").val().trim(),
        tipo: $("#edi-tipo").val().trim(),
        marca: $("#edi-marca").val().trim(),
        modelo: $("#edi-modelo").val().trim(),
        num_serie: $("#edi-num-serie").val().trim().toUpperCase(),
        ubicacion: $("#edi-ubicacion").val().trim(),
        tag: $("#edi-tag").val().trim(),
        usuario: $("#edi-usuario").val().trim(),
        posicion: $("#edi-posicion").val().trim(),
        fecha_entrega: $("#edi-fecha-entrega").val()
    }

    let server = await server_inventario(model);
    let response = JSON.parse(respuesta);


    if (response.resultado === true) {
        mostrar_alerta('success', '¡Edición exitosa!', 'El registro se ha actualizado correctamente.');
        
    } else {
        mostrar_alerta('error', 'Error', 'No se pudo editar el registro. Inténtalo nuevamente.');
    }

        consultar_informacion();
        modalE.hide();
    
}

async function desactivar_registro(params) {
    let response = await server_inventario({ accion: 3, id: select });
        if (response.resultado === true) {
            mostrar_alerta('success', '¡Eliminación exitosa!', 'El registro se ha eliminado correctamente.');

            let table = $('#tabla1').DataTable();
            table.destroy();
            consultar_informacion();

        } else {
            mostrar_alerta('error', 'Error', 'No se pudo eliminar el registro. Inténtalo nuevamente.');
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

        //TODO: Validación de funciones

let select = [];

async function selecionar_registro(params) {

    let index = select.indexOf(params); // Retorna el primer índice en el que se puede encontrar un elemento dado en el array,
    if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
        select.push(params); // Añade uno o más elementos al final de un array
    } else {
        select.splice(index, 1); 
    } 
}

async function confirmar_eliminacion() {
    if (select.length === 0) {
        mostrar_alerta('error', 'Error', 'Seleccione al menos un usuario. Inténtalo nuevamente.');
    } else {
        Swal.fire({
            title: '¿Está seguro de eliminarlo?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                desactivar_registro(); // Llama a la función para eliminar el registro
            }
        });
    }
}

/* function deshabilitar_campo(){
    // Al cambiar la opción en el select, bloqueamos o habilitamos el campo
    $("#edi-rubro").on('change', function() {
        if ($(this).val() !== "") {  // Si el valor no está vacío
            $(this).prop('disabled', true);  // Bloquear el campo select
        } else {
            $(this).prop('disabled', false);  // Habilitar el campo si no tiene valor
        }
    });

    // Verifica si el campo #edi-rubro ya tiene un valor
    if ($("#edi-rubro").val() !== "") {
        // Si tiene un valor, deshabilitar el campo
        $("#edi-rubro").prop('disabled', false);
    } else {
        // Si no tiene un valor, habilitar el campo
        $("#edi-rubro").prop('disabled', true);
    }
}

$(document).ready(function() {
    deshabilitar_campo();  // Llamamos a la función para asegurar que el campo se habilite/deshabilite al cargar
}); */

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
    let inputs = document.getElementsByName('mdl-reg');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = ""; // Limpia el valor del input
        inputs[i].classList.remove('is-invalid'); // Elimina la clase de validación
    }
    
    $('.select').each(function () {
        $(this).val(null).trigger('change'); // Restablece el valor y actualiza visualmente
        $(this).removeClass('is-invalid'); // Elimina la clase de validación
    });

    general_select2({
        selectId: 'inp-rubro',
        tabla: 'inventario_ti_sur',
        campo: 'rubro',
        placeholder: 'Seleciona un rubro',
        dropdownParent: '#modal-registro',
        tags: true
      });
    
    general_select2({
        selectId: 'inp-tipo',
        tabla: 'inventario_ti_sur',
        campo: 'tipo',
        placeholder: 'Seleciona un tipo',
        dropdownParent: '#modal-registro',
        tags: true
      });

    general_select2({
        selectId: 'inp-usuario',
        tabla: 'inventario_ti_sur',
        campo: 'usuario',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#modal-registro',
        tags: true
    });

    general_select2({
        selectId: 'inp-posicion',
        tabla: 'inventario_ti_sur',
        campo: 'posicion',
        placeholder: 'Seleccione un cargo',
        dropdownParent: '#modal-registro',
        tags: true
    });

    // modal = new bootstrap.Modal(document.getElementById('modal-registro'));
    $("#modal-registro").modal('show');
    //modal.show();
}

//TODO: Alertas, confirmaciones

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

//TODO: Configuración del select2
 /*  $(document).ready(function() {
    $(".select").each(function() { //recorre cada <select class="select">
      const $select = $(this);
  
      // Encuentra el modal contenedor más cercano
      const $modal = $select.closest('.modal'); //
  
      $select.select2({
        theme: 'bootstrap4',
        placeholder: "Selecciona un rubro",
        allowClear: true,
        tags: true,
        dropdownParent: $modal.length ? $modal : $(document.body) // por si no está en modal
      });
    });
  }); */
  
  //*SELECT2 para hacer el resguardo

  async function general_select2({selectId, tabla, campo, placeholder, dropdownParent, tags}){
    //try {
        const response = await server_inventario({
            accion: 6,
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

  $(document).ready(function () {
    // Escucha cambios en el campo "inp-tipo"
    $('#inp-tipo').on('change', function () {
        const tipoSeleccionado = $(this).val(); // Obtiene el valor seleccionado

        if (tipoSeleccionado === 'Laptop' || tipoSeleccionado === 'Desktop') {
            // Habilita el campo TAG y lo hace obligatorio
            $('#inp-tag').prop('disabled', false).addClass('is-required');
        } else {
            // Deshabilita el campo TAG y elimina la obligatoriedad
            $('#inp-tag').prop('disabled', true).removeClass('is-required').val('');
        }
    });
});


  //TODO: Funciones para el resguardo
function resguardo(){
    let inputs = document.getElementsByName('resg-inpt')
    for (let i = 0; i < inputs.length; i++) {
        const element = inputs[i].value = "";
    }
    $('#select-usu').val(null).trigger('change');
    $('#select-supervisor').val(null).trigger('change');


    $(document).ready(function() {
        let hoy = new Date().toISOString().split('T')[0];
        $('#fecha-resguardo').val(hoy);
    });
    
    general_select2({
        selectId: 'select-usu',
        tabla: 'inventario_ti_sur',
        campo: 'usuario',
        placeholder: 'Selecione un usuario',
        dropdownParent: '#mdl-res',
        tags: false
    });

    general_select2({
        selectId: 'select-region',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Selecione una región',
        dropdownParent: '#mdl-res',
        tags: false
    });

    $("#mdl-res").modal('show')
}

let infoResguardo
async function crear_resguardo(params) {

    const validacion = [
        "select-usu",
        "select-region",
    ];
    if (!validar_campos(validacion)) {
        mostrar_alerta('error', 'Error', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }

    let model = {
        accion : 5,
        usuario : $('#select-usu').val().trim(),
        region : $('#select-region').val().trim(),
        comentario : $('#txt-area').val().trim(),
        fecha: $('#fecha-resguardo').val()
    }
    let server = await server_inventario(model)

    
    infoResguardo = server.resultado
    //console.log(infoResguardo)
    let table = $('#tabla1').DataTable();
    table.destroy();
    consultar_informacion();


    $("#mdl-res").modal('hide')
    mostrar_toast_cargando()
    descargar_excel()
}


async function descargar_excel(params) {
    dominio = window.location.hostname,
    puerto = location.port
    let model = {
        accion : 0,
        datos: infoResguardo
    }
    let server = await server_excel(model)

    let ruta = JSON.parse(respuesta)
    // Elimina comillas si vienen así: '"C:\\ruta\\archivo.xlsx"'
    ruta.resultado = ruta.resultado.replace(/^"|"$/g, '');

    // Reemplaza las \ por /
    ruta.resultado = ruta.resultado.replace(/\\/g, '/');

    // Cambia la extensión
    ruta.resultado = ruta.resultado.replace(/\.xlsx$/i, '.pdf');

    ruta.resultado = ruta.resultado.replace("C:/xampp/htdocs", "http://"+dominio+":"+puerto)
    console.log(ruta.resultado)
    window.open(ruta.resultado, '_blank');
}

function mostrar_toast_cargando() {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        showCloseButton: false,
        timer: undefined, // No cerrar automáticamente
        allowOutsideClick: false,
        background: '#fff',
        html: `
            <div style="display: flex; align-items: center;">
                <i class="fas fa-spinner fa-spin fa-lg" style="margin-right: 10px; color: #007bff;"></i>
                <span style="font-weight: 500;">Cargando...</span>
            </div>
        `,
        didOpen: () => {
            //Swal.showLoading(); Esto muestra el spinner por default de SweetAlert, pero ya no es necesario, ya que se usa uno de fontAwesome
        }
    });
}

$(document).ready(function () {
    
    $('.select').select2().attr({
    'data-toggle': 'popover',
      'data-trigger': 'hover',
      'data-content': 'Este es un select potenciado con Select2.',
      'title': 'Información adicional'
    });
    $('[data-toggle="popover"]').popover();
});
   
