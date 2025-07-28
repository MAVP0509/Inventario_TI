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
        mostrar_toast('success', 'Bienvenido', mensajeRegistro);

        // Eliminamos el mensaje para evitar que aparezca nuevamente
        sessionStorage.removeItem('bienvenido');
    }

})

let datos = [];
let elemento
let table

let equipo_seleccionado = [];

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

    try {
        table = new Tabulator("#tbl01", {
            //layout: "fitColumns",
            locale: "es",
            data: datos,
            pagination: true,
            height: "800px",
            paginationSize: 10,
            paginationSizeSelector: [10, 25, 35, true],
            movableColumns: true,              //allow column order to be changed
            // printAsHtml: true,
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
                        seleccionar_registro(rowData.id_equipo, equipo_seleccionado)
                    }, headerSort: false, frozen: true, width: 70, hozAlign: "center",
                },
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
                {
                    title: "Ubicación", field: "ubicacion", headerHozAlign: "center", headerFilter: "list", headerSort: false, hozAlign: "center",
                    headerFilterParams: {
                        valuesLookup: true, clearable: true // se auto genera a partir de los valores únicos de la columna
                    },
                },
                { title: "TAG", field: "tag", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center", width: 170 },
                { title: "IMEI", field: "imei", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center", width: 170 },
                { title: "Linea", field: "linea", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center", width: 170 },
                { title: "Usuario", field: "usuario", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center" },
                { title: "Cargo del usuario", field: "posicion", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center" },
                { title: "Fecha de asignación", field: "fecha_entrega", sorter: "date", headerFilter: "input", headerSort: false },
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
        // console.log(datos)

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
    $('#inp-cargo').prop('disabled', true)


    // Limpia y carga los select
    await Promise.allSettled([
        await general_select2({
            selectId: 'inp-rubro',
            tabla: 'cat_rubro',
            campo: 'rubro',
            placeholder: 'Selecione un rubro',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Categoría general del activo. Agrupa dispositivos por su tipo funcional, como computadoras, dispositivos móviles, etc."
        }),

        general_select2({
            selectId: 'inp-tipo',
            tabla: 'cat_tipo',
            campo: 'tipo',
            placeholder: 'Selecione un tipo',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'inp-marca',
            tabla: 'cat_marca',
            campo: 'marca',
            placeholder: 'Seleccione una marca',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Es la marca del activo."
        }),

        general_select2({
            selectId: 'inp-zona',
            tabla: 'inventario_ti_sur',
            campo: 'zona',
            placeholder: 'Selecciona una zona',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Zona operativa donde se ubica el activo."
        }),

        general_select2({
            selectId: 'inp-ubicacion',
            tabla: 'inventario_ti_sur',
            campo: 'ubicacion',
            placeholder: 'Selecciona una ubicacion',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Indica el lugar específico dentro de la zona donde se encuentra físicamente el dispositivo."
        }),

        general_select2({
            selectId: 'inp-usuario',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'NA',
            dropdownParent: '#mdl-inventario',
        }),

        general_select2({
            selectId: 'inp-cargo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'NA',
            dropdownParent: '#mdl-inventario',
        }),
    ])

    rellenar_select(selecreg.zona, "inp-zona")
    //document.getElementById("inp-zona").value = selecreg.zona;
    rellenar_select(selecreg.rubro, "inp-rubro")
    document.getElementById("inp-af").value = selecreg.af;
    rellenar_select(selecreg.tipo, "inp-tipo")
    rellenar_select(selecreg.marca, "inp-marca")
    document.getElementById("inp-modelo").value = selecreg.modelo;
    document.getElementById("inp-num-serie").value = selecreg.num_serie;
    rellenar_select(selecreg.ubicacion, "inp-ubicacion")
    document.getElementById("inp-tag").value = selecreg.tag;
    document.getElementById("inp-imei").value = selecreg.imei;
    document.getElementById("inp-linea").value = selecreg.linea;
    rellenar_select(selecreg.usuario, "inp-usuario")
    rellenar_select(selecreg.cargo, "inp-cargo")
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
        ubicacion: $("#inp-ubicacion").select2('data')[0].text,
        tag: $("#inp-tag").val().trim(),
        imei: $("#inp-imei").val().trim(),
        linea: $("#inp-linea").val().trim(),
        usuario: $("#inp-usuario").val(),
        cargo: $("#inp-cargo").val(),
        //posicion: $("#edi-posicion").select2('data')[0].text,
        fecha_entrega: $("#inp-fecha-entrega").val()
    }

    let server = await server_inventario(model);
    //let response = JSON.parse(respuesta);
    //console.log(server);
    if (server.resultado.exito === true) {
        await registrar_historico('Anterior edición de registro', server.resultado.anterior);
        await registrar_historico('Edición de registro', server.resultado.nuevo);
        mostrar_toast('success', '¡Edición exitosa!', 'El registro se ha actualizado correctamente.');
    } else {
        mostrar_toast('error', 'Error', 'No se pudo editar el registro. Inténtalo nuevamente.');
        return
    }

    consultar_informacion();
    $("#mdl-inventario").modal("hide");

}

async function mdl_nvo_registro() {
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

    await Promise.allSettled([
        general_select2({
            selectId: 'inp-rubro',
            tabla: 'cat_rubro',
            campo: 'rubro',
            placeholder: 'Seleciona un rubro',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Categoría general del activo. Agrupa dispositivos por su tipo funcional, como computadoras, dispositivos móviles, etc."
        }),

        general_select2({
            selectId: 'inp-tipo',
            tabla: 'cat_tipo',
            campo: 'tipo',
            placeholder: 'Seleciona un tipo',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'inp-marca',
            tabla: 'cat_marca',
            campo: 'marca',
            placeholder: 'Seleccione una marca',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Es la marca del activo."
        }),

        general_select2({
            selectId: 'inp-zona',
            tabla: 'inventario_ti_sur',
            campo: 'zona',
            placeholder: 'Selecciona una zona',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Zona operativa donde se ubica el activo."
        }),

        general_select2({
            selectId: 'inp-ubicacion',
            tabla: 'inventario_ti_sur',
            campo: 'ubicacion',
            placeholder: 'Seleccione una ubicación',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Indica el lugar específico dentro de la zona donde se encuentra físicamente el dispositivo."
        }),

        general_select2({
            selectId: 'inp-usuario',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Seleccione un usuario',
            dropdownParent: '#mdl-inventario',
            tags: true,
            popoverTitle: "Aviso",
            popoverContent: "Si se ingresa un nuevo usuario, favor de asignarle un cargo",
            placement: 'top',
        }),

        general_select2({
            selectId: 'inp-cargo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Selecione un cargo',
            dropdownParent: '#mdl-inventario',
            tags: true,
            // sincronizarCon: 'inp-usuario',
            // sincronizarCampo: 'cargo',
        })
    ])

    document.getElementById('title-mdl-inventario').textContent = "Registro de Activo"
    document.getElementById('btn-mdl-inventario').onclick = function () { crear_registro() }

    $("#mdl-inventario").modal('show');

}

$('#inp-usuario').off('change').on('change', function () {
    let userSelected = $(this).val()?.trim();
    let select = $(this);
    let nuevo = true;
    const cargo = $('#inp-cargo')
    let texto = "";

    select.find('option').each(function () {
        if ($(this).val() === userSelected && !$(this).attr('data-select2-tag')) {
            nuevo = false; // Es un valor existente, no fue escrito por el usuario
        }
    });

    if (userSelected && nuevo) {
        $('#inp-cargo').prop('disabled', false);
        $('#inp-cargo').val(null).trigger('change');

    } else {

        cargo.prop('disabled', true);
        // Verifica si el valor ya existe como opción
        if (!cargo.find(userSelected).length) {
            const vista = select.find('option:selected').text().trim();

            for (let i = 0; i < datos.length; i++) {
                const element = datos[i];
                if (element.usuario === vista) {
                    texto = element.posicion;
                    // console.log(selecreg)
                    break;
                }
            }
            // Si no existe, agrégalo dinámicamente como nueva opción
            const nueva_opcion = new Option(texto, userSelected, true, true);

            cargo.append(nueva_opcion).trigger('change');
        } else {
            cargo.val(userSelected).trigger('change');
        }
    }
});

async function crear_registro() {
    // Campos requeridos para validación
    let validacion = [
        "inp-zona",
        "inp-rubro",
        "inp-tipo",
        "inp-ubicacion",
        "inp-marca",
        "inp-modelo",
        "inp-num-serie",
    ];

    const tipo_seleccionado = $('#inp-tipo').val();

    switch (tipo_seleccionado) {
        case '58':
        case '40':
            validacion.push("inp-tag");
            break;
        case '132':
            validacion.push('inp-imei', 'inp-linea');
        default:
            validacion
            break;
    }
    // console.log(validacion)

    // Validar campos
    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
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
        ubicacion: $("#inp-ubicacion").select2('data')[0].text,
        tag: $("#inp-tag").val().trim(),
        imei: $("#inp-imei").val().trim(),
        linea: $("#inp-linea").val().trim(),
        usuario: $("#inp-usuario").val().trim(),
        cargo: $("#inp-cargo").select2('data')[0].text,
        fecha_entrega: $("#inp-fecha-entrega").val()
    };

    // Enviar datos al servidor
    let server = await server_inventario(model);

    // Validar respuesta del servidor
    const serie = document.getElementById('inp-num-serie');
    serie.classList.remove('is-invalid'); // Remover clase de error si existía

    if (server.resultado.exitoso === true) {
        consultar_informacion();
        $("#mdl-inventario").modal('hide');
        await registrar_historico('Nuevo registro', server.resultado.insercion);
        mostrar_toast('success', '¡Registro exitoso!', 'El registro se ha creado correctamente.');
    } else if (server.resultado.resultado === false) {
        if (server.resultado.mensaje === "Número de serie duplicado") {
            serie.classList.add('is-invalid'); // Marcar el campo como inválido si hay un número de serie duplicado
            mostrar_toast('warning', 'Número de serie duplicado', 'Este número de serie ya está registrado.');
        } else {
            mostrar_toast('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
        }
    } else {
        mostrar_toast('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
    }

}

async function traspasos() {

    const validacion = ['mdl-estado']

    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellene los campos. Inténtalo nuevamente');
        return false
    }

    let model = {
        accion: 6,
        id: equipo_seleccionado,
        estatus: $('#mdl-estado').val(),
        usuario: $('#mdl-usuario').val(),
    }

    let server = await server_inventario(model);

    if (server.resultado) {
        equipo_seleccionado = []
        consultar_informacion();
        $('#mdl-traspaso').modal('hide')
        await registrar_historico('Anterior asignación', server.resultado.anterior);
        await registrar_historico('Generarción de traspaso', server.resultado.nuevo);
        mostrar_toast('success', '¡Traspaso exitoso!', 'El traspaso se ha realizado correctamente');
        if (selected) {
            let userSelected = $('#mdl-usuario').val()
            //let userSelected = $('#mdl-usuario').select2('data')[0].text
            resguardo(userSelected)
        }

    } else {
        mostrar_toast('error', 'Error', 'No se pudo realizar el traspaso. Inténtalo nuevamente.');
    }
}

async function mostrar_traspaso() {
    if (equipo_seleccionado.length == 0) {
        mostrar_toast('warning', 'Alerta', 'Selecione al menos un activo. Inténtalo nuevamente.')
    } else {

        await general_select2({
            selectId: 'mdl-estado',
            tabla: 'inventario_ti_sur',
            campo: 'estatus',
            placeholder: 'Seleccione un estatus',
            dropdownParent: '#mdl-traspaso',
            tags: false,
        })
        await general_select2({
            selectId: 'mdl-usuario',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Seleccione un usuario',
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
        id: equipo_seleccionado, // IDs seleccionados
    };

    let response = await server_inventario(model);
    // console.log(response)
    if (Array.isArray(response.resultado)) {
        await registrar_historico('Baja de activo', response.resultado);
        mostrar_toast('success', '¡Baja de activo exitosa!', 'El registro se ha eliminado correctamente.');
        consultar_informacion();
    } else {
        mostrar_toast('error', 'Error', 'No se pudo realizar la baja del activo. Inténtalo nuevamente.');
    }
}

function limpiarTexto(texto) {
    if (typeof texto !== "string") return texto;
    return texto.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""); // elimina acentos
}

async function mdl_imprimir() {

    const check_columnas = document.querySelector("#mdl-imprimir .modal-body");
    const columnas_exp = table.getColumns().filter(col => col.getField() && col.getDefinition().title);

    check_columnas.innerHTML = "<p>Selecciona las columnas que deseas incluir en el PDF:</p>";

    columnas_exp.forEach(col => {
        const field = col.getField();
        const title = col.getDefinition().title;

        const div = document.createElement("div");
        div.className = "form-check";

        div.innerHTML = `
            <div class="form-check">
                <button type="button" class="btn btn-lg toggle-select icon" data-field="${field}" data-checked="true">
                    <i class="fa-solid fa-square-check"></i>
                </button>
                <span>${title}</span>
            </div>`;
        check_columnas.appendChild(div);


    });

    if (!check_columnas.dataset.listenerAttached) {
        check_columnas.addEventListener("click", function (e) {
            const button = e.target.closest(".toggle-select");
            if (!button) return;

            const checked = button.dataset.checked === "true";
            button.dataset.checked = (!checked).toString();

            button.innerHTML = checked
                ? '<i class="fa-regular fa-square"></i>'
                : '<i class="fa-solid fa-square-check"></i>';
        });

        check_columnas.dataset.listenerAttached = "true";
    }

    $("#mdl-imprimir").modal("show");

}

async function imprimir_pdf() {

    let seleccionados = document.querySelectorAll("#mdl-imprimir .toggle-select[data-checked='true']");
    let campos_selecionados = Array.from(seleccionados).map(el => el.dataset.field);

    const filtrados = table.getData("active");

    let campos
    if (campos_selecionados.length >= 14) {
        campos = Array(campos_selecionados.length).fill(40)

    } else {
        campos = Array(campos_selecionados.length).fill('auto')
    }

    let headers = campos_selecionados.map(field => {
        const col = table.getColumn(field);
        return col ? col.getDefinition().title : field;
    });

    let body = [
        headers,
        ...filtrados.map(row =>
            campos_selecionados.map(field => row[field] || "")
        )
    ];

    const docDefinition = {
        pageOrientation: 'landscape',
        pageMargins: [10, 10, 10, 10],
        content: [
            { text: 'Inventario de Activos', style: 'header' },
            {
                table: {
                    headerRows: 1,
                    widths: campos,
                    body: body,
                    dontBreakRows: true
                },
                layout: 'lightHorizontalLines'
            }
        ],
        styles: {
            header: {
                fontSize: 16,
                bold: true,
                margin: [0, 0, 0, 10]
            }
        },
        defaultStyle: {
            fontSize: 7,
            alignment: 'center',
            wordBreak: 'break-word',
        }
    };

    pdfMake.createPdf(docDefinition).download("Inventario_TI.pdf");

    $('#mdl-imprimir').modal('hide'); // Cierra modal
}

function imprimir_excel() {
    table.download("xlsx", "Inventario_TI.xlsx", {
        sheetName: "Inventario",
    })
}

//TODO: Validación de funciones


let tbl_baja = null;
async function confirmar_eliminacion() {

    let data = datos.filter(el => equipo_seleccionado.includes(el.id_equipo));
    if (equipo_seleccionado.length === 0) {
        mostrar_toast('info', 'Información', 'Selecciona al menos un activo. Inténtalo nuevamente.');
        return;
    }

    let estado = data.some(item => item.estatus === 'Asignado')
    // console.log(estado)
    if (estado) {
        mostrar_toast('warning', 'Alerta', 'Uno o más activos se encuentran asignados. Inténtalo nuevamente.');
        return;

    } else {
        mostrar_alert('warning', `¿Está seguro de eliminar ${equipo_seleccionado.length} activos(s)?`, false, desactivar_registro, true, 'Generar formato <i class="fa-solid fa-file-excel"></i>', mostrar_baja)
    }

    // mostrar_alert('warning', `¿Está seguro de eliminar ${equipo_seleccionado.length} activos(s)?`, false, desactivar_registro)
}

async function mostrar_baja() {
    let input = $('[name="lmp-baja"]');

    input.each(function () { $(this).val(''); });  // Limpia el valo de los inputs

    let data = datos.filter(el => equipo_seleccionado.includes(el.id_equipo));

    let opcion = [
        { id: 1, text: 'Inservible' },
        { id: 2, text: 'Robo' },
        { id: 3, text: 'Extravio' },
        { id: 4, text: 'Venta' },
        { id: 6, text: 'Reubicación de instalación o pozo' },
        { id: 5, text: 'Otro' }
    ]
    // console.time('selects');
    await Promise.allSettled([
        general_select2({
            selectId: 'slc-motivo',
            data: opcion,
            placeholder: 'Selecione un motivo',
            dropdownParent: '#step-1',
            tags: true,
            // popoverTitle: 'Descripción',
            // popoverContent: 'Causa por la cual no se encuentre en condiciones óptimas para su uso y/o aprovechamiento.',
            // placement: "right",

        }),

        general_select2({
            selectId: 'slc-emisor',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#step-3',
            tags: true,
        }),

        general_select2({
            selectId: 'cg-emisor',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#step-3',
            sincronizarCon: 'slc-emisor',
            sincronizarCampo: 'cargo',
            tags: true,
        }),

        general_select2({
            selectId: 'slc-supervisor',
            tabla: 'supervisor',
            campo: 'nombre',
            placeholder: 'Selecciona al usuario que supervisa la baja',
            dropdownParent: '#step-3',
            tags: true,
        }),

        general_select2({
            selectId: 'cg-supervisor',
            tabla: 'supervisor',
            campo: 'cargo',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#step-3',
            sincronizarCon: 'slc-supervisor',
            sincronizarCampo: 'cargo',
            tags: true,
        }),

        general_select2({
            selectId: 'slc-vobo',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Seleccione un usuario',
            dropdownParent: '#step-3',
            tags: true,
        }),

        general_select2({
            selectId: 'cg-vobo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#step-3',
            sincronizarCon: 'slc-vobo',
            sincronizarCampo: 'cargo',
            tags: true,
        }),

        general_select2({
            selectId: 'slc-autorizo',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Seleccione un usuario',
            dropdownParent: '#step-3',
            tags: true,
        }),

        general_select2({
            selectId: 'cg-autorizo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#step-3',
            sincronizarCon: 'slc-autorizo',
            sincronizarCampo: 'cargo',
            tags: true,
        })
    ])
    // console.timeEnd('selects');
    // console.log(opcion)
    $('#inp-motivo, #inp-monto, #inp-quincena, #inp-reubicacion').prop('disabled', true);
    $('#cg-emisor, #cg-supervisor, #cg-vobo, #cg-autorizo').prop('disabled', true);

    $('#smartwizard').smartWizard("reset");
    $('#smartwizard').smartWizard({
        theme: 'dots',
        autoAdjustHeight: true,
        // selected: 0,
        toolbarSettings: {
            toolbarPosition: 'top',
            showNextButton: true,
            showPreviousButton: true,
        },
        keyboard: {
            keyNavigation: true,
            keyLeft: [37],
            keyRight: [39]
        },
        lang: {
            next: 'Siguiente',
            previous: 'Anterior'
        },
        anchor: {
            enableDoneState: true,
        }
    });

    $('#smartwizard').on('leaveStep', function (e, anchorObject, currentStepIndex, nextStepIndex, stepDirection) {
        // Solo valida el avance (no al retroceder)
        if (stepDirection === 'forward') {
            const validacion = {
                0: ['slc-motivo', 'inp-motivo', 'inp-monto', 'inp-quincena', 'inp-reubicacion'],    // Paso 1: Validar campo con ID
                1: ['inp-observaciones'],   // Paso 2: Validar campo con ID
                2: ['slc-emisor', 'slc-supervisor', 'slc-vobo', 'slc-autorizo'],    // Paso 3: Validar campo con ID
            };

            // Obtiene los campos del paso actual
            const campos_v = validacion[currentStepIndex];
            const campos_habilitados = campos_v.filter(id => !$('#' + id).prop('disabled'));

            // Si hay campos definidos para este paso, se validan
            if (campos_habilitados.length && !validar_campos(campos_habilitados)) {
                // Previene que el wizard avance si la validación falla
                return false;
            }
        }

        // Permite avanzzar si no hay problemas
        return true;
    });

    $('#mdl-baja').modal("show");

    $('#slc-motivo').on('change', function () {
        let motivo_seleccionado = $(this).val();

        if (motivo_seleccionado === '5') {
            $('#inp-motivo').prop('disabled', false);
        } else {
            $('#inp-motivo').prop('disabled', true);
        }
        if (motivo_seleccionado === '3') {
            $('#inp-monto, #inp-quincena').prop('disabled', false);
        } else {
            $('#inp-monto, #inp-quincena').prop('disabled', true);
        }
        if (motivo_seleccionado === '6') {
            $('#inp-reubicacion').prop('disabled', false);
        } else {
            $('#inp-reubicacion').prop('disabled', true);
        }


        if (!motivo_seleccionado) {
            if (tbl_baja) tbl_baja.clearData();
            return;
        }

        let data_motivo = data.map(item => ({ ...item, motivo_baja_id: motivo_seleccionado }));

        if (!tbl_baja) {
            tbl_baja = new Tabulator('#tbl-baja', {
                height: "300px",
                data: data_motivo,
                columns: [
                    { title: "ITEM", formatter: "rownum", hozAlign: "center" },
                    { title: "TIPO", field: "motivo_baja_id", hozAlign: "center" },
                    {
                        title: "DESCRIPCIÓN", hozAlign: "center",
                        formatter: function (cell) {
                            let d = cell.getData();
                            return `${d.tipo || ''} Marca ${d.marca || ''} Serie ${d.num_serie || ''} Modelo ${d.modelo || ''}`;
                        }
                    },
                    { title: "LOTE", field: "lote", hozAlign: "center", },
                    { title: "ÁREA", field: "ubicacion", hozAlign: "center", },
                    { title: "ACTIVO FIJO", field: "af", hozAlign: "center", },
                ]
            });
        } else {
            // Actualizar datos si ya existe tabla
            tbl_baja.setData(data_motivo);
        }

    })
}

async function generar_baja() {

    if (!tbl_baja) {
        mostrar_toast('error', 'Error', 'No hay datos en la tabla para generar la baja.');
        return;
    }
    let model = {
        accion: 2,
        motivo: $("#slc-motivo").val(),
        otro: $("#inp-motivo").val().trim(),
        reubicacion: $("#inp-reubicacion").val().trim(),
        monto: $("#inp-monto").val().trim(),
        quincena: $("#inp-quincena").val().trim(),
        observaciones: $("#inp-observaciones").val().trim(),
        emisor: $("#slc-emisor").select2('data')[0].text,
        cg_emisor: $("#cg-emisor").select2('data')[0].text,
        supervisor: $("#slc-supervisor").select2('data')[0].text,
        cg_supervisor: $("#cg-supervisor").select2('data')[0].text,
        vobo: $("#slc-vobo").select2('data')[0].text,
        cg_vobo: $("#cg-vobo").select2('data')[0].text,
        autorizo: $("#slc-autorizo").select2('data')[0].text,
        cg_autorizo: $("#cg-autorizo").select2('data')[0].text,
        tabla_baja: tbl_baja.getData().map((item, index) => ({
            ...item,
            rownum: index + 1,
            descripcion: `${item.tipo || ''} Marca ${item.marca || ''} Serie ${item.num_serie || ''} Modelo ${item.modelo || ''}`
        })),

    }

    mostrar_toast_cargando();
    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        // mostrar_toast('success', '¡Baja exitosa!', 'El activo se ha dado de baja correctamente.');
        window.location = server.resultado.url;
        desactivar_registro();
        $('#mdl-baja').modal("hide");
    } else {
        mostrar_toast('error', 'Error', 'No se pudo dar de baja el activo. Inténtalo nuevamente.')
    }
}


//TODO Funciones de los Select2

async function general_select2({ selectId, tabla, campo, data, placeholder, dropdownParent, tags, popoverTitle, popoverContent, placement, sincronizarCon, sincronizarCampo }) {
    //try {
    let opciones = [];

    if (data && Array.isArray(data)) {
        // Si se pasan los datos directamente
        opciones = data.map(item => ({
            id: item.id ?? '',
            text: item.text ?? ''

        }));

    } else if (tabla && campo) {
        let response = await server_inventario({
            accion: 5,
            tabla: tabla,
            campo: campo
        });
        //console.log('Respuesta del servidor para select2:', response);
        opciones = response.resultado.map(item => ({
            id: item.id || '',
            text: item[campo] || ''
        }));

    }

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
            'data-content': popoverContent,
            'data-placement': placement
        });

        $select2Container.popover();
    }

    // Sincronización aútomatica
    if (sincronizarCon && sincronizarCampo) {
        const origen = $(`#${sincronizarCon}`);
        const destino = $(`#${selectId}`);

        origen.off(`change.sync-${selectId}`);  // Limpia el evento anterior
        origen.on(`change.sync-${selectId}`, async function () {
            const id_selecionado = $(this).val();
            const data_seleccionada = $(this).select2('data')[0];
            const origen_seleccionado = origen.data('select2')?.opts?.tags === true;
            const nuevo = origen_seleccionado && data_seleccionada && data_seleccionada.element === undefined;

            if (id_selecionado && nuevo) {
                destino.prop('disabled', false);
                destino.val(null).trigger('change');
                // destino.focus();
            } else {
                destino.prop('disabled', true);
                destino.empty();

                let response = await server_inventario({
                    accion: 5,
                    tabla: tabla,
                    campo: sincronizarCampo,
                    id: id_selecionado,
                });

                const registro = response?.resultado?.[0];
                const texto_destino = registro?.[sincronizarCampo];

                // destino.prop('disabled', true);
                // Borra opciones previas si existieran
                // destino.empty()

                if (texto_destino) {
                    // Crea la opción sincronizada y la selecciona
                    const nueva_opcion = new Option(texto_destino, texto_destino, true, true);
                    destino.append(nueva_opcion).trigger('change');
                } else {
                    destino.val(null).trigger('change');
                }
            }

        });
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
    $('#sh-tag, #sh-imei, #sh-linea').hide();
    $('#inp-tipo').on('change', function () {
        const tipoSeleccionado = $(this).val(); // Obtiene el valor seleccionado

        if (tipoSeleccionado === '58' || tipoSeleccionado === '40') {
            // Habilita el campo TAG y lo hace obligatorio
            $('#sh-tag').show();
        } else {
            // Deshabilita el campo TAG y elimina la obligatoriedad
            $('#sh-tag').hide();
        }

        if (tipoSeleccionado === '132') {
            $('#sh-imei, #sh-linea').show();
        } else {
            $('#sh-imei, #sh-linea').hide();
        }

        $('#inp-imei, #inp-linea').on('input', function () {
            this.value = this.value.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
        });/*  */
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
$('.check-button').on('click', function () {
    button_checked($(this))
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
    if (userSelect) {
        $('#select-usu').val(userSelect).trigger('change')
        $('#select-usu').prop('disabled', true)
    }

    document.getElementById('col-pemex').style.display = 'none'

    selected = false
    $("#check-resguardo-pemex-icon").removeClass("fa-solid fa-square-check")
    $("#check-resguardo-pemex-icon").addClass("fa-regular fa-square ")
    $("#mdl-res").modal('show')
}

//*Validando si será un resguardo de PEMEX
$(document).ready(function () {
    // Escucha cambios en el campo "inp-tipo"
    $('#check-resguardo-pemex').on('click', function () {

        //console.log(selected)

        if (selected) {
            $('#inp-user-pemex').addClass('is-required');
            $('#inp-cargo-pemex').addClass('is-required');
            document.getElementById('col-pemex').style.display = 'block'
        } else {
            $('#inp-user-pemex').removeClass('is-required').val('');
            $('#inp-cargo-pemex').removeClass('is-required').val('');
            document.getElementById('col-pemex').style.display = 'none'
        }
    });
});

let infoResguardo
async function crear_resguardo() {

    const validacion = [
        "select-usu",
        "select-region",
        "inp-ubicacion-resg",
        "inp-area",
    ];
    if (selected) {
        validacion.push("inp-user-pemex", "inp-cargo-pemex")
    }
    if (!validar_campos(validacion)) {
        mostrar_toast('warning', 'Aviso', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }

    let model = {
        accion: 4,
        usuario: $('#select-usu').val().trim(),
        //region : $('#select-region').val().trim(),
        region: $("#select-region").select2('data')[0].text,
        comentario: $('#txt-area').val().trim(),
        fecha: $('#fecha-resguardo').val(),
        area: $('#inp-area').val(),
        ubicacion: $('#inp-ubicacion-resg').val(),
        userPemex: $('#inp-user-pemex').val(),
        userPemexCargo: $('#inp-cargo-pemex').val()
    }
    let server = await server_inventario(model)

    if (server.resultado.error) {
        mostrar_toast('warning', 'Aviso', server.resultado.error)
    } else {
        infoResguardo = server.resultado.datos
        consultar_informacion();


        $("#mdl-res").modal('hide')
        mostrar_toast_cargando()
        descargar_excel()
    }


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

function button_checked(button) {
    selected = !selected;

    let icon = button.find('i')

    if (selected) {
        icon.removeClass("fa-regular fa-square").addClass("fa-solid fa-square-check");
    } else {
        icon.removeClass("fa-solid fa-square-check").addClass("fa-regular fa-square");
    }
}