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
                //console.log(response);
                try {
                    resolve(JSON.parse(response))
                    console.log(resolve(JSON.parse(response)))
                    respuesta = response
                } catch (error) {
                    reject(error)
                    //console.log(reject);
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

async function consultar_informacion() {
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
        // console.log(seleccionar)
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
                    }, headerSort: false, frozen: true, width: 70, hozAlign: "center",
                },
                { title: "ID", field: "id_equipo", width: 70, hozAlign: "center", headerSort: false, headerHozAlign: "center", },
                {
                    title: "Zona", field: "zona", headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "list",
                    headerFilterParams: {
                        valuesLookup: true, clearable: true // se auto genera a partir de los valores únicos de la columna
                    },
                },
                { title: "Rubro", field: "rubro", headerHozAlign: "center", headerFilter: "input", headerSort: false },
                { title: "Activo fijo", field: "af", headerSort: false, headerHozAlign: "center", hozAlign: "center", headerFilter: "input" },
                { title: "Tipo de dispositivo", field: "tipo", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center" },
                { title: "Marca", field: "marca", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center" },
                { title: "Modelo", field: "modelo", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center" },
                { title: "Numero de serie", field: "num_serie", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center" },
                { title: "Ubicación", field: "ubicacion", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center" },
                { title: "TAG", field: "tag", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center", width: 170 },
                { title: "IMEI", field: "imei", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center", width: 170 },
                { title: "Usuario", field: "usuario", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center" },
                { title: "Cargo del usuario", field: "posicion", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center" },
                { title: "Fecha de registro", field: "fecha_entrega", sorter: "date", headerFilter: "input", headerSort: false },
                { title: "Estatus", field: "estatus", width: 120, frozen: true, headerHozAlign: "center", headerFilter: "list", headerFilterParams: { values: { "Asignado": "Asignado", "Bodega": "Bodega" }, clearable: true }, headerSort: false },
                {
                    formatter: editIcon, width: 60, hozAlign: "center",
                    cellClick: function (e, cell) {
                        elemento = cell.getRow().getData();
                        mdl_editar(elemento);
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

async function mdl_editar(params) {
    let inputs = document.getElementsByName('mdl-reg');
    for (let i = 0; i < inputs.length; i++) {
        //inputs[i].value = ""; // Limpia el valor del input
        inputs[i].classList.remove('is-invalid'); // Elimina la clase de validación
    }

    $('.select').each(function () {
        $(this).val(null).trigger('change'); // Restablece el valor y actualiza visualmente
        $(this).removeClass('is-invalid'); // Elimina la clase de validación
    });

    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];
        if (element.id_equipo === params.id_equipo) {
            selecreg = element;
            // console.log(selecreg)
            break;
        }
    }
    //*Mostrar la fecha
    $('#lbl-fecha-reg').show()
    $('#inp-fecha-reg').show()

    //* Deshabilitando los input de usuario y fecha
    $('#inp-usuario').prop('disabled', true)
    $('#inp-fecha-entrega').prop('disabled', true)


    // Limpia y carga los select
    await general_select2({
        selectId: 'inp-rubro',
        tabla: 'cat_rubro',
        campo: 'rubro',
        placeholder: 'Selecione un rubro',
        dropdownParent: '#mdl-inventario',
        tags: true,
        popoverTitle: "Descripción",
        popoverContent: "Categoría general del activo. Agrupa dispositivos por su tipo funcional, como computadoras, dispositivos móviles, etc."
    })

    await general_select2({
        selectId: 'inp-tipo',
        tabla: 'cat_tipo',
        campo: 'tipo',
        placeholder: 'Selecione un tipo',
        dropdownParent: '#mdl-inventario',
        tags: true,
        popoverTitle: "Descripción",
        popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
    })

    await general_select2({
        selectId: 'inp-marca',
        tabla: 'cat_marca',
        campo: 'marca',
        placeholder: 'Seleccione una marca',
        dropdownParent: '#mdl-inventario',
        tags: true,
        popoverTitle: "Descripción",
        popoverContent: "Es la marca del activo."
    })

    await general_select2({
        selectId: 'inp-zona',
        tabla: 'inventario_ti_sur',
        campo: 'zona',
        placeholder: 'Selecciona una zona',
        dropdownParent: '#mdl-inventario',
        tags: true,
        popoverTitle: "Descripción",
        popoverContent: "Zona operativa donde se ubica el activo."
    });

    await general_select2({
        selectId: 'inp-usuario',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'NA',
        dropdownParent: '#mdl-inventario',
    })

    rellenar_select(selecreg.zona, "inp-zona")
    //document.getElementById("inp-zona").value = selecreg.zona;
    rellenar_select(selecreg.rubro, "inp-rubro")
    document.getElementById("inp-af").value = selecreg.af;
    rellenar_select(selecreg.tipo, "inp-tipo")
    rellenar_select(selecreg.marca, "inp-marca")
    document.getElementById("inp-modelo").value = selecreg.modelo;
    document.getElementById("inp-num-serie").value = selecreg.num_serie;
    document.getElementById("inp-ubicacion").value = selecreg.ubicacion;
    document.getElementById("inp-tag").value = selecreg.tag;
    rellenar_select(selecreg.usuario, "inp-usuario")
    document.getElementById("inp-fecha-entrega").value = selecreg.fecha_entrega;

    document.getElementById('title-mdl-inventario').textContent = "Edición de Activo"
    document.getElementById('btn-mdl-inventario').onclick = function () { editar_registro() }

    $("#mdl-inventario").modal("show");
    //console.log(selecreg)
}
async function editar_registro() {
    //deshabilitar_campo();
    const validacion = [
        "inp-zona",
        "inp-rubro",
        "inp-tipo",
        "inp-ubicacion",
    ];
    let user = $("#inp-usuario").val().trim()
    if (user === "") {
        user = "5"
    }

    let model = {
        accion: 1,
        id: selecreg.id_equipo,
        zona: $("#inp-zona").select2('data')[0].text,
        //zona: $("#inp-zona").val().trim(),
        rubro: $("#inp-rubro").val().trim(),
        af: $("#inp-af").val().trim(),
        tipo: $("#inp-tipo").val().trim(),
        marca: $("#inp-marca").val().trim(),
        modelo: $("#inp-modelo").val().trim(),
        num_serie: $("#inp-num-serie").val().trim().toUpperCase(),
        ubicacion: $("#inp-ubicacion").val().trim(),
        tag: $("#inp-tag").val().trim(),
        usuario: user,
        //posicion: $("#edi-posicion").select2('data')[0].text,
        fecha_entrega: $("#inp-fecha-entrega").val()
    }

    

    let server = await server_inventario(model);
    //let response = JSON.parse(respuesta);
    //console.log(server);
    if (server.resultado.exito === true) {
        await registrar_historico('Anterior edición de registro', server.resultado.anterior);
        await registrar_historico('Edición de registro', server.resultado.nuevo);
        mostrar_alerta('success', '¡Edición exitosa!', 'El registro se ha actualizado correctamente.');
    } else {
        mostrar_alerta('error', 'Error', 'No se pudo editar el registro. Inténtalo nuevamente.');
        return
    }

    consultar_informacion();
    $("#mdl-inventario").modal("hide");

}

let ususelect = [];
function mdl_nvo_registro() {
    let inputs = document.getElementsByName('mdl-reg');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = ""; // Limpia el valor del input
        inputs[i].classList.remove('is-invalid'); // Elimina la clase de validación
    }

    $('.select').each(function () {
        $(this).val(null).trigger('change'); // Restablece el valor y actualiza visualmente
        $(this).removeClass('is-invalid'); // Elimina la clase de validación
    });

    //* Habilitando los inputs de usuario y fecha
    $('#inp-usuario').prop('disabled', false)
    $('#inp-fecha-entrega').prop('disabled', false)

    //*Escondiendo la fecha
    $('#lbl-fecha-reg').hide()
    $('#inp-fecha-reg').hide()

    general_select2({
        selectId: 'inp-rubro',
        tabla: 'cat_rubro',
        campo: 'rubro',
        placeholder: 'Seleciona un rubro',
        dropdownParent: '#mdl-inventario',
        tags: true,
        popoverTitle: "Descripción",
        popoverContent: "Categoría general del activo. Agrupa dispositivos por su tipo funcional, como computadoras, dispositivos móviles, etc."
    });

    general_select2({
        selectId: 'inp-tipo',
        tabla: 'cat_tipo',
        campo: 'tipo',
        placeholder: 'Seleciona un tipo',
        dropdownParent: '#mdl-inventario',
        tags: true,
        popoverTitle: "Descripción",
        popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
    });

    general_select2({
        selectId: 'inp-marca',
        tabla: 'cat_marca',
        campo: 'marca',
        placeholder: 'Seleccione una marca',
        dropdownParent: '#mdl-inventario',
        tags: true,
        popoverTitle: "Descripción",
        popoverContent: "Es la marca del activo."
    })

    general_select2({
        selectId: 'inp-zona',
        tabla: 'inventario_ti_sur',
        campo: 'zona',
        placeholder: 'Selecciona una zona',
        dropdownParent: '#mdl-inventario',
        tags: true,
        popoverTitle: "Descripción",
        popoverContent: "Zona operativa donde se ubica el activo."
    });

    general_select2({
        selectId: 'inp-usuario',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#mdl-inventario',
    });

    document.getElementById('title-mdl-inventario').textContent = "Registro de Activo"
    document.getElementById('btn-mdl-inventario').onclick = function () { crear_registro() }

    $("#mdl-inventario").modal('show');

}

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
        zona: $("#inp-zona").select2('data')[0].text,
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
        $("#mdl-inventario").modal('hide');
        await registrar_historico('Nuevo registro', model);
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

async function traspasos() {


    let model = {
        accion: 6,
        id: seleccionar,
        estatus: $('#mdl-estado').val(),
        usuario: $('#mdl-usuario').val(),
    }

    let server = await server_inventario(model);

    if (server.resultado) {
        seleccionar = []
        consultar_informacion();
        $('#mdl-traspaso').modal('hide')
        await registrar_historico('Anterior asignación', server.resultado.anterior);
        await registrar_historico('Generarción de traspaso', server.resultado.nuevo);
        mostrar_alerta('success', '¡Traspaso exitoso!', 'El traspaso se ha realizado correctamente');
        if (selected) {
            let userSelected = $('#mdl-usuario').val()
            //let userSelected = $('#mdl-usuario').select2('data')[0].text
            resguardo(userSelected)
        }

    } else {
        mostrar_alerta('error', 'Error', 'No se pudo realizar el traspaso. Inténtalo nuevamente.');
    }
}

async function mostrar_traspaso() {
    if (seleccionar.length == 0) {
        mostrar_alerta('warning', 'Alerta', 'Selecione al menos un activo. Inténtalo nuevamente.')
    } else {

        await general_select2({
            selectId: 'mdl-estado',
            tabla: 'inventario_ti_sur',
            campo: 'estatus',
            placeholder: 'Selecione un estatus',
            dropdownParent: '#mdl-traspaso',
            tags: false,
        })
        await general_select2({
            selectId: 'mdl-usuario',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Selecciones un usuario',
            dropdownParent: '#mdl-traspaso',
            tags: false,
        })

        selected = false
        $("#check-resguardo-icon").removeClass("fa-solid fa-square-check")
        $("#check-resguardo-icon").addClass("fa-regular fa-square ")
        $("#mdl-traspaso").modal("show");
    }

}

async function desactivar_registro() {
    let model = {
        accion: 3,
        id: seleccionar, // IDs seleccionados
    };

    let response = await server_inventario(model);
    // console.log(response)
    if (Array.isArray(response.resultado)) {
        await registrar_historico('Eliminación de registro', response.resultado);
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
        mostrar_alert('warning', `¿Está seguro de eliminar ${seleccionar.length} activos(s)?`, false, desactivar_registro)
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

async function general_select2({ selectId, tabla, campo, placeholder, dropdownParent, tags, popoverTitle, popoverContent }) {
    //try {
    const response = await server_inventario({
        accion: 5,
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

    //  Si se pasan datos de popover, aplicarlo
    if (popoverTitle && popoverContent) {
        const $select2Container = $select.next('.select2-container');

        $select2Container.attr({
            'data-toggle': 'popover',
            'data-trigger': 'hover',
            'data-html': 'true',
            'title': popoverTitle,
            'data-content': popoverContent
        });

        $select2Container.popover();
    }

}

function rellenar_select(texto, select) {
    let textoBuscado = texto;
    let $select = $('#' + select);

    $select.find('option').filter(function () {
        return $(this).text().trim() === textoBuscado;
    }).prop('selected', true);

    $select.trigger('change');
}

//* Deshabilitando el input TAG del registro
$(document).ready(function () {
    // Escucha cambios en el campo "inp-tipo"
    $('#inp-tipo').on('change', function () {
        const tipoSeleccionado = $(this).val(); // Obtiene el valor seleccionado

        if (tipoSeleccionado === '58' || tipoSeleccionado === '40') {
            // Habilita el campo TAG y lo hace obligatorio
            $('#inp-tag').prop('disabled', false).addClass('is-required');
        } else {
            // Deshabilita el campo TAG y elimina la obligatoriedad
            $('#inp-tag').prop('disabled', true).removeClass('is-required').val('');
        }
    });
});

$(document).ready(function () {
    $('#mdl-estado').on('change', function () {
        const seleccionado = $(this).val();

        if (seleccionado === 'Asignado') {
            $('#mdl-usuario').prop('disabled', false).addClass('is-requerid');
            document.getElementById('alert-traspaso').style.display = 'block'
        } else {
            $('#mdl-usuario').prop('disabled', true).removeClass('is-requerid').val('')
            document.getElementById('alert-traspaso').setAttribute('style', 'display:none !important; background-color:#e7f3fe; border-color:#b8daff; color:#004085; padding-right: 4rem;');
        }
    })
})

let selected = false
$("#check-resguardo").on('click', function () {
    selected = !selected;

    // Cambiar el ícono del checkbox
    let check = $("#check-resguardo-icon");
    if (selected) {
        check.removeClass("fa-regular fa-square");
        check.addClass("fa-solid fa-square-check");
    } else {
        check.removeClass("fa-solid fa-square-check");
        check.addClass("fa-regular fa-square ");
    }

    // Habilitar o deshabilitar el botón dependiendo de "selected"
    //document.getElementById('mdl-btn-conf').disabled = !selected;
});

//TODO: Funciones para el resguardo
async function resguardo(userSelect) {
    let inputs = document.getElementsByName('inp-resg')
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].classList.remove('is-invalid')
        inputs[i].value = "";

    }

    $('#select-usu').val(null).trigger('change');
    $('#select-usu').prop('disabled', false)
    $('#select-region').val(null).trigger('change');

    $collapse = $('#collapse-resguardo');
    $collapse.slideUp();
    $collapse.closest('.card').addClass('collapsed-card');
    $collapse.closest('.card')
        .find('[data-card-widget="collapse"] i')
        .removeClass('fa-minus')
        .addClass('fa-plus');

    $(document).ready(function () {
        let hoy = new Date().toISOString().split('T')[0];
        $('#fecha-resguardo').val(hoy);
    });

    await general_select2({
        selectId: 'select-usu',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#mdl-res',
        tags: false
    });

    await general_select2({
        selectId: 'select-region',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Seleccione una región',
        dropdownParent: '#mdl-res',
        tags: false
    });
    if(userSelect){
        $('#select-usu').val(userSelect).trigger('change')
        $('#select-usu').prop('disabled', true)
    }
    
    console.log(userSelect)

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
        accion: 4,
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
    // console.log(ruta.resultado)
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

    var start = moment().subtract(10, 'days');
    var end = moment();
    $('#rango-fecha').daterangepicker({
        startDate: start,
        endDate: end,
        locale: {
            format: 'YYYY/MM/DD',
            applyLabel: 'Aplicar',
            cancelLabel: 'Cancelar',
            fromLabel: "Desde",
            toLabel: "Hasta",
            customRangeLabel: 'Personalizado',
            daysOfWeek: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
            monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        },
        firstDay: 1,
        myCallback

    }, /* function (start, end) {
        $('#rango-fecha').val(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));
    } */);
})//.val(start + " - " + end);

function myCallback(start, end) {
    $("#rango-fecha span").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"))


}

