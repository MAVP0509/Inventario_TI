let respuesta

function server_inventario(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_inventario/controller_inventario.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                console.log(response);
                try {
                    resolve(JSON.parse(response))
                    console.log(resolve(JSON.parse(response)))
                    respuesta = response
                } catch (error) {
                    reject(error)
                    console.log(reject);
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
            success: function (response) {
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
let elemento
let table

let seleccionar = [];

async function consultar_informacion(params) {
    let model = {
        accion: 2
    };

    let response = await server_inventario(model);

    datos = response.resultado

        Tabulator.extendModule("localize", "langs", {
        "es": {
            "pagination": {
                "first": '<i class="fa-solid fa-angles-right fa-flip-horizontal"></i>',
                "first_title": "Primera página",
                "last": '<i class="fa-solid fa-angles-right"></i>',
                "last_title": "Última página",
                "prev": '<i class="fa-solid fa-angle-right fa-flip-horizontal"></i>',
                "prev_title": "Página anterior",
                "next": '<i class="fa-solid fa-angle-right"></i>',
                "next_title": "Página siguiente",
                "page_size": "Tamaño",

            },
            "headerFilters": {
                "default": "Filtrar columna...",
                "columns": {}
            },
            "groups": {
                "item": "ítem",
                "items": "ítems"
            },
            "ajax": {
                "loading": "Cargando...",
                "error": "Error al cargar datos"
            },
            "data": {
                "loading": "Cargando datos...",
                "error": "Error al cargar datos"
            }
        }
    });

    datos.forEach(d => d.seleccionado = false);

    let squareIcon = function (cell, formatterParams, onRendered) {
        const seleccionado = cell.getRow().getData().seleccionado;
        const iconClass = seleccionado ? "fa-solid fa-square-check" : "fa-regular fa-square";
        return `<button type='button' class='btn icon toggle-select'>
                    <i class='${iconClass} fa-lg'></i>
                </button>`;
    }

    let editIcon = function (cell, formatterParams, onRendered) {
        return `<button type='button' class='btn btn-warning icon' onclick=''><i class='fa-solid fa-pen-to-square fa-lg'></i></button>`;
    }

    async function selecionar_registro(params) {

        let index = seleccionar.indexOf(params); // Retorna el primer índice en el que se puede encontrar un elemento dado en el array,
        if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
            seleccionar.push(params); // Añade uno o más elementos al final de un array
        } else {
            seleccionar.splice(index, 1);
        }
        console.log(seleccionar)
    }

    try {
        table = new Tabulator("#tbl01", {
            //layout: "fitColumns",
            locale: "es",
            data: datos,
            pagination: true,
            paginationSize: 10,
            paginationSizeSelector: [5, 10, 25, 35],
            movableColumns: true,              //allow column order to be changed
            paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
                const totalRows = table.getDataCount(); // Asegúrate que 'table' esté accesible
                const end = Math.min(currentRowStart + pageSize - 1, totalRows);
                return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
            },
            rowFormatter: function (row) {
                data = row.getData()
                if (data.seleccionado === true) {
                    row.getElement().classList.add("bg-primary")
                } else if (data.seleccionado === false) {
                    row.getElement().classList.remove("bg-primary")
                }
            },
            columns: [
                {
                    formatter: squareIcon, width: 70, hozAlign: "center",
                    cellClick: function (e, cell) {
                        let rowData = cell.getRow().getData();
                        rowData.seleccionado = !rowData.seleccionado;
                        cell.getRow().reformat();
                        selecionar_registro(rowData.id_equipo)
                    }, headerSort: false, frozen: true
                },
                { title: "ID", field: "id_equipo" },
                { title: "Zona", field: "zona" },
                { title: "Rubro", field: "rubro" },
                { title: "Activo fijo", field: "af" },
                { title: "Tipo de dispositivo", field: "tipo" },
                { title: "Marca", field: "marca" },
                { title: "Modelo", field: "modelo" },
                { title: "Numero de serie", field: "num_serie" },
                { title: "Ubicación", field: "ubicacion" },
                { title: "TAG", field: "tag" },
                { title: "Usuario", field: "usuario" },
                { title: "Cargo del usuario", field: "posicion" },
                { title: "Fecha de registro", field: "fecha_entrega" },
                {
                    title: "Editar",
                    formatter: editIcon, width: 60, hozAlign: "center",
                    cellClick: function (e, cell) {
                        elemento = cell.getRow().getData();
                        mostrar_registro(elemento);
                    },
                    headerSort: false, frozen: true
                },

            ],

        });
    } catch (error) {
        console.log(error)
    }

}


let selecreg = ""; // No limpiar la variable

async function mostrar_registro(params) {
    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];
        if (element.id_equipo === params.id_equipo) {
            selecreg = element;
            //console.log(selecreg)
            break;
        }
    }
    // Limpia y carga los select
    await general_select2({
        selectId: 'edi-rubro',
        tabla: 'cat_rubro',
        campo: 'rubro',
        placeholder: 'Selecione un rubro',
        dropdownParent: '#modal-editar',
        tags: true
    })

    await general_select2({
        selectId: 'edi-tipo',
        tabla: 'cat_tipo',
        campo: 'tipo',
        placeholder: 'Selecione un tipo',
        dropdownParent: '#modal-editar',
        tags: true
    })

    await general_select2({
        selectId: 'edi-marca',
        tabla: 'cat_marca',
        campo: 'marca',
        placeholder: 'Seleccione una marca',
        dropdownParent: '#modal-editar',
        tags: true
    })

    await general_select2({
        selectId: 'edi-usuario',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#modal-editar',
    })

    document.getElementById("edi-zona").value = selecreg.zona;
    rellenar_select(selecreg.rubro, "edi-rubro")
    document.getElementById("edi-af").value = selecreg.af;
    rellenar_select(selecreg.tipo, "edi-tipo")
    rellenar_select(selecreg.marca, "edi-marca")
    document.getElementById("edi-modelo").value = selecreg.modelo;
    document.getElementById("edi-num-serie").value = selecreg.num_serie;
    document.getElementById("edi-ubicacion").value = selecreg.ubicacion;
    document.getElementById("edi-tag").value = selecreg.tag;
    rellenar_select(selecreg.usuario, "edi-usuario")
    document.getElementById("edi-fecha-entrega").value = selecreg.fecha_entrega;

    $("#modal-editar").modal("show");
    console.log(selecreg)
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
        mostrar_alerta('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let user = $("#inp-usuario").val().trim()
    if (user === "") {
        user = "5"
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
        usuario: user,
        fecha_entrega: $("#inp-fecha-entrega").val()
    };

    // Enviar datos al servidor
    let server = await server_inventario(model);

    // Validar respuesta del servidor
    const serie = document.getElementById('inp-num-serie');
    serie.classList.remove('is-invalid'); // Remover clase de error si existía

    if (server.resultado === true) {
        consultar_informacion();
        $("#modal-registro").modal('hide');
        await registrar_historico(model.num_serie, 'Nuevo registro', selecreg);
        mostrar_alerta('success', '¡Registro exitoso!', 'El registro se ha creado correctamente.');
    } else if (server.resultado === false) {
        if (server.mensaje === "Número de serie duplicado") {
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

    let user = $("#edi-usuario").val().trim()
    if (user === "") {
        user = "5"
    }

    let model = {
        accion: 1,
        id: selecreg.id_equipo,
        zona: $("#edi-zona").val().trim(),
        rubro: $("#edi-rubro").val().trim(),
        af: $("#edi-af").val().trim(),
        tipo: $("#edi-tipo").val().trim(),
        marca: $("#edi-marca").val().trim(),
        modelo: $("#edi-modelo").val().trim(),
        num_serie: $("#edi-num-serie").val().trim().toUpperCase(),
        ubicacion: $("#edi-ubicacion").val().trim(),
        tag: $("#edi-tag").val().trim(),
        usuario: user,
        //posicion: $("#edi-posicion").select2('data')[0].text,
        fecha_entrega: $("#edi-fecha-entrega").val()
    }

    await registrar_historico(model.num_serie, 'Anterior edición de registro', selecreg);

    let server = await server_inventario(model);
    //let response = JSON.parse(respuesta);
    //console.log(server);


    if (server.resultado === true) {
        
        await registrar_historico(model.num_serie, 'Edición de registro', model);
        mostrar_alerta('success', '¡Edición exitosa!', 'El registro se ha actualizado correctamente.');
    } else {
        mostrar_alerta('error', 'Error', 'No se pudo editar el registro. Inténtalo nuevamente.');
        return
    }

    consultar_informacion();
    $("#modal-editar").modal("hide");

}

async function desactivar_registro() {
    let model = {
        accion: 3,
        id: seleccionar, // IDs seleccionados
    };

    let response = await server_inventario(model);
    //console.log(response)
    if (Array.isArray(response.resultado)) {
        await registrar_historico(null, 'Eliminación de registro', response.resultado);
        mostrar_alerta('success', '¡Eliminación exitosa!', 'El registro se ha eliminado correctamente.');
        consultar_informacion();
    } else {
        mostrar_alerta('error', 'Error', 'No se pudo eliminar el registro. Inténtalo nuevamente.');
    }
}

//TODO: Validación de funciones

async function confirmar_eliminacion() {
    if (seleccionar.length === 0) {
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

function limpiar_campos() {
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
        tabla: 'cat_rubro',
        campo: 'rubro',
        placeholder: 'Seleciona un rubro',
        dropdownParent: '#modal-registro',
        tags: true
    });

    general_select2({
        selectId: 'inp-tipo',
        tabla: 'cat_tipo',
        campo: 'tipo',
        placeholder: 'Seleciona un tipo',
        dropdownParent: '#modal-registro',
        tags: true
    });

    general_select2({
        selectId: 'inp-marca',
        tabla: 'cat_marca',
        campo: 'marca',
        placeholder: 'Seleccione una marca',
        dropdownParent: '#modal-registro',
        tags: true
    })

    general_select2({
        selectId: 'inp-usuario',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#modal-registro',
    });

    $("#modal-registro").modal('show');

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

//TODO Funciones de los Select2

async function general_select2({ selectId, tabla, campo, placeholder, dropdownParent, tags }) {
    //try {
    const response = await server_inventario({
        accion: 6,
        tabla: tabla,
        campo: campo
    });

    //console.log('Respuesta del servidor para select2:', response);

    const opciones = response.resultado.map(item => ({
        id: item.id || '',
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

function rellenar_select(texto, select) {
    let textoBuscado = texto;
    let $select = $('#' + select);

    $select.find('option').filter(function () {
        return $(this).text().trim() === textoBuscado;
    }).prop('selected', true);

    $select.trigger('change');
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
function resguardo() {
    let inputs = document.getElementsByName('resg-inpt')
    for (let i = 0; i < inputs.length; i++) {
        const element = inputs[i].value = "";
    }
    $('#select-usu').val(null).trigger('change');
    $('#select-supervisor').val(null).trigger('change');


    $(document).ready(function () {
        let hoy = new Date().toISOString().split('T')[0];
        $('#fecha-resguardo').val(hoy);
    });

    general_select2({
        selectId: 'select-usu',
        tabla: 'cat_usuarios',
        campo: 'nombre',
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
        accion: 5,
        usuario: $('#select-usu').val().trim(),
        //region : $('#select-region').val().trim(),
        region: $("#select-region").select2('data')[0].text,
        comentario: $('#txt-area').val().trim(),
        fecha: $('#fecha-resguardo').val()
    }
    let server = await server_inventario(model)


    infoResguardo = server.resultado
    //console.log(infoResguardo)
    consultar_informacion();


    $("#mdl-res").modal('hide')
    mostrar_toast_cargando()
    descargar_excel()
}


async function descargar_excel(params) {
    dominio = window.location.hostname,
        puerto = location.port
    let model = {
        accion: 0,
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

    ruta.resultado = ruta.resultado.replace("C:/xampp/htdocs", "http://" + dominio + ":" + puerto)
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
    $('[data-toggle="popover"]').popover();
});

