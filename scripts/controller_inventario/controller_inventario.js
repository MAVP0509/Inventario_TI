let respuesta
let loading = false

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
                    if (loading) {
                        Swal.close()
                        loading = !loading
                    }

                    //console.log(resolve(JSON.parse(response)))
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
        console.log('Mensaje encontrado:', mensajeRegistro);

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
            //layout: "fitData",
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
                        valuesLookup: true, clearable: true, // se auto genera a partir de los valores únicos de la columna
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text"
                        }
                    },
                },
                {
                    title: "Rubro", field: "rubro", headerHozAlign: "center", headerFilter: "input", headerSort: false,
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Activo fijo", field: "af", headerSort: false, headerHozAlign: "center", hozAlign: "center", headerFilter: "input",
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Tipo de dispositivo", field: "tipo", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center",
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Marca", field: "marca", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center",
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Modelo", field: "modelo", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center",
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Numero de serie", field: "num_serie", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center",
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Ubicación", field: "ubicacion", headerHozAlign: "center", headerFilter: "list", headerSort: false, hozAlign: "center",
                    headerFilterParams: {
                        valuesLookup: true, clearable: true, // se auto genera a partir de los valores únicos de la columna
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text"
                        }
                    },
                },
                {
                    title: "TAG", field: "tag", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center", width: 170,
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "IMEI", field: "imei", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center", width: 170,
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Linea", field: "linea", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center", width: 170,
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Usuario", field: "usuario", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center",
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Cargo del usuario", field: "posicion", headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center",
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Fecha de asignación", field: "fecha_entrega", headerHozAlign: "center", sorter: "date", headerFilter: "input", headerSort: false, hozAlign: "center",
                    headerFilterParams: {
                        elementAttributes: {
                            autocomplete: "off",
                            type: "text",
                            name: "tbtor-filter"
                        }
                    }
                },
                {
                    title: "Estatus", field: "estatus", width: 120, frozen: true, headerHozAlign: "center", headerFilter: "list", headerFilterParams: {
                        values: { "Asignado": "Asignado", "Bodega": "Bodega" }, clearable: true,
                        elementAttributes: {
                            type: "text",
                            autocomplete: "off"
                        }
                    }, headerSort: false
                },
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
    /* table.on("tableBuilt", () => {
        document.querySelectorAll(".tabulator-header input").forEach(input => {
            input.setAttribute("autocomplete", "off");
            input.setAttribute("type", "text"); // por si Tabulator vuelve a poner "search"
        });
    }); */
    table.on("tableBuilt", () => {
        Array.from(document.getElementsByName("tbtor-filter")).forEach(input => {
            input.setAttribute("autocomplete", "off");
            input.setAttribute("type", "text");
        });
    });
}

let selecreg = ""; // Variable global para almacenar el registro seleccionado

// Función principal para mostrar el modal de edición de activos
async function mdl_editar(params) {
    // Obtiene todos los inputs del formulario de edición con nombre 'mdl-reg'
    let inputs = document.getElementsByName('mdl-reg');
    // Itera sobre cada input para limpiar su estado de error
    for (let i = 0; i < inputs.length; i++) {

        inputs[i].classList.remove('is-invalid'); // Elimina la clase de validación
    }

    // Busca en el arreglo 'datos' el registro con el mismo id_equipo
    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];
        if (element.id_equipo === params.id_equipo) {
            // Guarda el registro completo en una variable global
            selecreg = element;
            // console.log(selecreg)
            break;
        }
    }
    //*Mostrar la fecha
    $('#lbl-fecha-reg').show()
    $('#inp-fecha-reg').show()

    //* Deshabilitando los campos que no deben editarse directamente
    $('#inp-usuario').prop('disabled', true)
    $('#inp-fecha-entrega').prop('disabled', true)
    $('#inp-cargo').prop('disabled', true)


    // Llama a varias funciones para cargar los selects con datos dinámicos
    await Promise.all([
        general_select2({
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
            sincronizarCampo: 'cargo',
            sincronizarCon: 'inp-usuario'
        }),
    ])

    // Rellenar campos del formulario con los valores actuales del activo
    rellenar_select(selecreg.zona, "inp-zona")
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
    // Actualiza el título del modal
    document.getElementById('title-mdl-inventario').textContent = "Edición de Activo"
    // Asigna la función que se ejecutará al presionar el botón de guardar
    document.getElementById('btn-mdl-inventario').onclick = function () { editar_registro() }
    // Muestra el modal en pantalla
    $("#mdl-inventario").modal("show");
    //console.log(selecreg)
}
// Función para guardar los cambios de un activo editado
async function editar_registro() {
    // Define un arreglo con los IDs de los campos que deben ser validados
    let validacion = [
        "inp-zona",
        "inp-rubro",
        "inp-tipo",
        "inp-ubicacion",
        "inp-marca",
        "inp-modelo",
        "inp-num-serie",
    ];

    // Validar los campos indicados; si falla, mostrar error y salir
    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return; // Termina función si no es válido
    }
    // Construye un objeto 'model' que contiene todos los datos actualizados del formulario
    let model = {
        accion: 1,
        id: selecreg.id_equipo,
        zona: $("#inp-zona").select2('data')[0].text,   // Obtiene texto visible del select2 (no el value) para zona
        rubro: $("#inp-rubro").val().trim(),
        af: $("#inp-af").val().trim(),
        tipo: $("#inp-tipo").val().trim(),
        marca: $("#inp-marca").val().trim(),
        modelo: $("#inp-modelo").val().trim(),
        num_serie: $("#inp-num-serie").val().trim().toUpperCase(),  // Convierte serie a mayúsculas
        ubicacion: $("#inp-ubicacion").select2('data')[0].text,
        tag: $("#inp-tag").val().trim(),
        imei: $("#inp-imei").val().trim(),
        linea: $("#inp-linea").val().trim(),
        usuario: $("#inp-usuario").val(),   // Valor del select
        cargo: $("#inp-cargo").val(),
        //posicion: $("#edi-posicion").select2('data')[0].text,
        fecha_entrega: $("#inp-fecha-entrega").val()
    }
    // Llama a la función asincrónica que envía los datos al servidor
    let server = await server_inventario(model);

    // Evalúa la respuesta del servidor
    if (server.resultado.exito === true) {
        // Si fue exitosa, registra el estado anterior del registro en el histórico
        await registrar_historico('Anterior edición de registro', server.resultado.anterior);
        // Registra el nuevo estado del registro editado
        await registrar_historico('Edición de registro', server.resultado.nuevo);
        // Muestra un mensaje toast de éxito al usuario
        mostrar_toast('success', '¡Edición exitosa!', 'El registro se ha actualizado correctamente.');
    } else {
        // Si hubo un error en la operación, muestra un mensaje toast de error
        mostrar_toast('error', 'Error', 'No se pudo editar el registro. Inténtalo nuevamente.');
        return  // Sale de la función
    }
    // Si todo fue exitoso, actualiza la información general mostrada en pantalla
    consultar_informacion();
    // Cierra el modal de edición
    $("#mdl-inventario").modal("hide");

}

async function mdl_nvo_registro() {
    // Selecciona todos los inputs con el nombre 'mdl-reg'
    let inputs = document.getElementsByName('mdl-reg');
    // Limpia los valores de todos los inputs y quita clases de error
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = ""; // Limpia el valor del input
        inputs[i].classList.remove('is-invalid'); // Elimina la clase de validación
    }
    // Restablece los selects con Select2
    $('.select').each(function () {
        $(this).val(null).trigger('change'); // Restablece el valor y actualiza visualmente
        $(this).removeClass('is-invalid'); // Elimina la clase de validación
    });

    //* Habilita los campos de usuario y fecha de entrega
    $('#inp-usuario').prop('disabled', false)
    $('#inp-fecha-entrega').prop('disabled', false)

    //* Oculta los elementos de fecha de registro
    $('#lbl-fecha-reg').hide()
    $('#inp-fecha-reg').hide()
    // Carga asincrónicamente los datos para los select2 desde distintas tablas
    await Promise.all([
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
            sincronizarCon: 'inp-usuario',
            sincronizarCampo: 'cargo',
        })
    ])
    // Establece el título del moda
    $('#title-mdl-inventario').text('Registro de Activo');
    //  Asigna la función crear_registro al botón del modal
    $('#btn-mdl-inventario').off('click').on('click', function () { crear_registro(); })
    // Muestra el modal al usuario
    $("#mdl-inventario").modal('show');

}

async function crear_registro() {
    const check_num = $('#check-num').is(':checked');
    // Campos requeridos para validación
    let validacion = [
        "inp-zona",
        "inp-rubro",
        "inp-tipo",
        "inp-ubicacion",
        "inp-marca",
        "inp-modelo",
    ];

    if (check_num) {
        validacion = validacion.filter(item => item !== 'inp-num-serie');
    }
    // Obtener el tipo seleccionado para agregar validaciones específicas
    const tipo_seleccionado = $('#inp-tipo').val();
    // Obtener el tipo seleccionado para agregar validaciones específicas
    switch (tipo_seleccionado) {
        case '58':
        case '40':
            validacion.push("inp-tag"); // Añadir validación de tag para estos tipos
            break;
        case '132':
            validacion.push('inp-linea'); // Añadir IMEI y línea para tipo 132
        default:
            validacion // No hace nada, mantiene validacion igual
            break;
    }
    // console.log(validacion)

    // Validar los campos indicados; si falla, mostrar error y salir
    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return; // Termina función si no es válido
    }

    let num_serie = $("#inp-num-serie").val().trim().toUpperCase();
    if (check_num || num_serie === '') {
        num_serie = 'NA';
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
        num_serie: num_serie,
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
    // Manejar respuesta del servidor
    if (server.resultado.exitoso === true) {
        consultar_informacion();
        $("#mdl-inventario").modal('hide');
        await registrar_historico('Nuevo registro', server.resultado.insercion);
        mostrar_toast('success', '¡Registro exitoso!', 'El registro se ha creado correctamente.');
    } else if (server.resultado.resultado === false) {
        // Error en servidor: verificar si es por número de serie duplicado
        if (server.resultado.mensaje === "Número de serie duplicado") {
            serie.classList.add('is-invalid'); // Marcar el campo como inválido si hay un número de serie duplicado
            mostrar_toast('warning', 'Número de serie duplicado', 'Este número de serie ya está registrado.');
        } else {
            // Otro error general
            mostrar_toast('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
        }
    } else {
        // Error genérico si no cumple ninguna condición anterior
        mostrar_toast('error', 'Error', 'No se pudo crear el registro. Inténtalo nuevamente.');
    }

}

async function traspasos() {

    let validacion = ['mdl-estado']

    const tipo_seleccionado = $('#mdl-estado').val();

    if (tipo_seleccionado === 'Asignado') {
        validacion.push("mdl-zona", "mdl-ubicacion");
    }

    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellene los campos. Inténtalo nuevamente');
        return false
    }

    let model = {
        accion: 6,
        id: equipo_seleccionado,
        estatus: $('#mdl-estado').val(),
        usuario: $('#mdl-usuario').val(),
        zona: $('#mdl-zona').val(),
        ubicacion: $('#mdl-ubicacion').val(),
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

        await general_select2({
            selectId: 'mdl-zona',
            tabla: 'inventario_ti_sur',
            campo: 'zona',
            placeholder: 'Seleccione una zona',
            dropdownParent: '#mdl-traspaso',
            tags: false,
        })

        await general_select2({
            selectId: 'mdl-ubicacion',
            tabla: 'inventario_ti_sur',
            campo: 'ubicacion',
            placeholder: 'Seleccione una ubicación',
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
        mostrar_toast('success', '¡Baja de activo exitosa!', 'La baja se ha realizado correctamente.');
        consultar_informacion();
    } else {
        mostrar_toast('error', 'Error', 'No se pudo realizar la baja del activo. Inténtalo nuevamente.');
    }
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
    // Filtra los activos cuyos IDs están en equipo_seleccionado
    let data = datos.filter(el => equipo_seleccionado.includes(el.id_equipo));
    // Verifica que al menos un activo esté seleccionado
    if (equipo_seleccionado.length === 0) {
        mostrar_toast('info', 'Información', 'Selecciona al menos un activo. Inténtalo nuevamente.');
        return;
    }
    // Comprueba si alguno de los activos seleccionados está en estado "Asignafo"
    let estado = data.some(item => item.estatus === 'Asignado')
    // console.log(estado)
    // Si alguno está asignado, muestra advertencia y no continúa
    if (estado) {
        mostrar_toast('warning', 'Alerta', 'Uno o más activos se encuentran asignados. Inténtalo nuevamente.');
        return; // Termina ejecuación

    } else {
        // Si están en estado "Bodega", muestra una alerta con opciones:
        // Confirmar baja directa o genera formato excel antes de continuar
        mostrar_alert('warning', `¿Está seguro de eliminar ${equipo_seleccionado.length} activos(s)?`, false,
            desactivar_registro,    // Función para baja directa
            true,   // Muestra dos botones
            'Generar formato <i class="fa-solid fa-file-excel"></i>',   // Segundo botón
            mostrar_baja    // Función para abrir formulario de baja
        );
    }
}

async function mostrar_baja() {
    // Busca todos los elementos del DOM que tengan el atributo name="lmp-baja".
    let input = $('[name="lmp-baja"]');
    // Limpia el valor de todos los elementos
    input.each(function () { $(this).val(''); });

    // Filtra los datos globales para obtener los equipo seleccionados
    let data = datos.filter(el => equipo_seleccionado.includes(el.id_equipo));

    // Lista de motivos posible para la baja
    let opcion = [
        { id: 1, text: 'Inservible' },
        { id: 2, text: 'Robo' },
        { id: 3, text: 'Extravio' },
        { id: 4, text: 'Venta' },
        { id: 6, text: 'Reubicación de instalación o pozo' },
        { id: 5, text: 'Otro' }
    ]
    // console.time('selects');
    // Carga múltiples campos select2 en paralelo
    await Promise.all([
        general_select2({
            selectId: 'slc-motivo',
            data: opcion,
            placeholder: 'Selecione un motivo',
            dropdownParent: '#step-1',
            tags: true,
        }),

        general_select2({
            selectId: 'slc-emisor',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#mdl-baja',
            tags: true,
        }),

        general_select2({
            selectId: 'cg-emisor',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#mdl-baja',
            sincronizarCon: 'slc-emisor',
            sincronizarCampo: 'cargo',
            tags: true,
        }),

        general_select2({
            selectId: 'slc-supervisor',
            tabla: 'supervisor',
            campo: 'nombre',
            placeholder: 'Selecciona al usuario que supervisa la baja',
            dropdownParent: '#mdl-baja',
            tags: true,
        }),

        general_select2({
            selectId: 'cg-supervisor',
            tabla: 'supervisor',
            campo: 'cargo',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#mdl-baja',
            sincronizarCon: 'slc-supervisor',
            sincronizarCampo: 'cargo',
            tags: true,
        }),

        general_select2({
            selectId: 'slc-vobo',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Seleccione un usuario',
            dropdownParent: '#mdl-baja',
            tags: true,
        }),

        general_select2({
            selectId: 'cg-vobo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#mdl-baja',
            sincronizarCon: 'slc-vobo',
            sincronizarCampo: 'cargo',
            tags: true,
        }),

        general_select2({
            selectId: 'slc-autorizo',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Seleccione un usuario',
            dropdownParent: '#mdl-baja',
            tags: true,
        }),

        general_select2({
            selectId: 'cg-autorizo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleciona al usuario quien emite la baja',
            dropdownParent: '#mdl-baja',
            sincronizarCon: 'slc-autorizo',
            sincronizarCampo: 'cargo',
            tags: true,
        })
    ])
    // console.timeEnd('selects');
    
    // Deshabilita inputs específicos por defecto
    $('#inp-motivo, #inp-monto, #inp-quincena, #inp-reubicacion').prop('disabled', true);
    $('#cg-emisor, #cg-supervisor, #cg-vobo, #cg-autorizo').prop('disabled', true);

    // Configura el asistente visual de pasos (SmartWizard)
    $('#smartwizard').smartWizard({ 
        selected: 0,
        theme: 'dots',
        justified: true,
        autoAdjustHeight: true,
        toolbar: {
            toolbarPosition: 'none',
            showNextButton: true,
            showPreviousButton: true,
            extraHtml: `<button class="btn btn-danger" id="btn-cancelar">Cancelar</button>
                        <button class="btn btn-success" id="btn-confirmar">Confirmar</button>`,
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

    // Resetea el paso actual del wizard
    $('#smartwizard').smartWizard("goToStep", 0);

    // Asigna evento para botón confirmació
    $('#btn-confirmar').on('click', function () {
        // Ejecuta validaciones de todos los pasos antes de confirmar
        const validaciones = {
            0: ['slc-motivo', 'inp-motivo', 'inp-monto', 'inp-quincena', 'inp-reubicacion'],
            1: ['inp-observaciones'],
            2: ['slc-emisor', 'slc-supervisor', 'slc-vobo', 'slc-autorizo'],
        };
        // Valida los campos en cada paso antes de generar la baja
        for (let i = 0; i <= 2; i++) {
            const campos = validaciones[i].filter(id => !$('#' + id).prop('disabled'));
            if (!validar_campos(campos)) {
                $('#smartwizard').smartWizard("goToStep", i);
                return;
            }
        }
        // Si todo está bien, llama la función para continuar la baja
        generar_baja();
    });

    // Evento para botón Cancelar
    $('#btn-cancelar').on('click', function () {
        // Alerta de confirmación para cancelar el proceso
        mostrar_alert('warning', `¿Está seguro de eliminar ${equipo_seleccionado.length} activos(s)?`, false, function () {
            $("#mdl-baja").modal("hide")
        });
    });

    // Validación dinámica por paso en el wizard
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

    // Muestra el modal de baja
    $('#mdl-baja').modal("show");
    // Evento para cambio de motivo de baja
    $('#slc-motivo').on('change', function () {
        let motivo_seleccionado = $(this).val();

        // Habilita campos según el motivo
        $('#inp-motivo').prop('disabled', motivo_seleccionado !== '5');
        $('#inp-monto, #inp-quincena').prop('disabled', motivo_seleccionado !== '3');
        $('#inp-reubicacion').prop('disabled', motivo_seleccionado !== '6');

        // Si no hay motivo, limpia la tabla
        if (!motivo_seleccionado) {
            if (tbl_baja) tbl_baja.clearData();
            return;
        }
        // Prepara los datos de la tabla con el motivo seleccionado
        let data_motivo = data.map(item => ({ ...item, motivo_baja_id: motivo_seleccionado }));
        // Crea o actualiza la tabla interactiva
        if (!tbl_baja) {
            tbl_baja = new Tabulator('#tbl-baja', {
                layout: "fitColumns",
                height: "300px",
                data: data_motivo,
                columns: [
                    { title: "ITEM", formatter: "rownum", hozAlign: "center", headerHozAlign: "center" },
                    { title: "TIPO", field: "motivo_baja_id", hozAlign: "center", headerHozAlign: "center" },
                    {
                        title: "DESCRIPCIÓN", hozAlign: "center", headerHozAlign: "center",
                        formatter: function (cell) {
                            let d = cell.getData();
                            return `${d.tipo || ''} Marca ${d.marca || ''} Serie ${d.num_serie || ''} Modelo ${d.modelo || ''}`;
                        }
                    },
                    { title: "LOTE", field: "lote", hozAlign: "center", headerHozAlign: "center", sorter: "number", editor: "input", validator: ["min:0", "numeric"] },
                    { title: "ÁREA", field: "ubicacion", hozAlign: "center", headerHozAlign: "center" },
                    { title: "ACTIVO FIJO", field: "af", hozAlign: "center", headerHozAlign: "center" },
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
    $('#check-num').on('change', function () {
        if ($(this).is(':checked')) {
            $('#inp-num-serie')
                .val('NA')
                .prop('readonly', true)
                .addClass('text-muted');
        } else {
            $('#inp-num-serie')
                .val('')
                .prop('readonly', false)
                .removeClass('text-muted');
        }
    });

    $('#mdl-inventario').on('hidden.bs.modal', function () {
        $('#check-num').prop('checked', false);
        $('#inp-num-serie')
            .val('')
            .prop('readonly', false)
            .removeClass('text-muted');
    });

});

$(document).ready(function () {
    $('#mdl-estado').on('change', function () {
        const seleccionado = $(this).val();

        if (seleccionado === 'Asignado') {
            $('#mdl-usuario, #mdl-zona, #mdl-ubicacion').prop('disabled', false).addClass('is-requerid');
            document.getElementById('alert-traspaso').style.display = 'block'
        } else {
            $('#mdl-usuario, #mdl-zona, #mdl-ubicacion').prop('disabled', true).removeClass('is-requerid').val('')
            document.getElementById('alert-traspaso').setAttribute('style', 'display:none !important; background-color:#e7f3fe; border-color:#b8daff; color:#004085; padding-right: 4rem;');
        }
    })
})

let selected = false
let celSelected = false
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
    celSelected = false
    $("#check-resguardo-pemex-icon").removeClass("fa-solid fa-square-check")
    $("#check-resguardo-pemex-icon").addClass("fa-regular fa-square ")

    $("#check-resguardo-cel-icon").removeClass("fa-solid fa-square-check")
    $("#check-resguardo-cel-icon").addClass("fa-regular fa-square ")
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

//let infoResguardo
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
        region: $("#select-region").select2('data')[0].text,
        comentario: $('#txt-area').val().trim(),
        fecha: $('#fecha-resguardo').val(),
        area: $('#inp-area').val(),
        ubicacion: $('#inp-ubicacion-resg').val(),
        userPemex: $('#inp-user-pemex').val(),
        userPemexCargo: $('#inp-cargo-pemex').val(),
        cel: celSelected ? 1 : 0
    }
    loading = true
    mostrar_toast_cargando()
    $("#mdl-res").modal('hide')
    let server = await server_inventario(model)

    if (server.resultado.error) {
        mostrar_toast('warning', 'Aviso', server.resultado.error)
    } else if (server.resultado) {

        abrir_resguardo(server.resultado)
        consultar_informacion();
    } else {
        mostrar_toast('error', 'Aviso', "Hubo un error")
    }


}

function abrir_resguardo(datos) {
    dominio = window.location.hostname,
        puerto = location.port
    /* let model = {
        accion: 0,
        datos: infoResguardo
    }
    let server = await server_excel(model) */

    let ruta = datos.resultado
    // Elimina comillas si vienen así: '"C:\\ruta\\archivo.xlsx"'
    ruta = ruta.replace(/^"|"$/g, '');

    // Reemplaza las \ por /
    ruta = ruta.replace(/\\/g, '/');

    // Cambia la extensión
    ruta = ruta.replace(/\.xlsx$/i, '.pdf');

    ruta = ruta.replace("C:/xampp/htdocs", "http://" + dominio + ":" + puerto)
    // console.log(ruta.resultado)
    window.open(ruta, '_blank');
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
    //console.log(button[0].id)
    if (button[0].id == "check-resguardo-pemex") {
        selected = !selected;

        let icon = button.find('i')

        if (selected) {
            icon.removeClass("fa-regular fa-square").addClass("fa-solid fa-square-check");
        } else {
            icon.removeClass("fa-solid fa-square-check").addClass("fa-regular fa-square");
        }
    } else if (button[0].id == "check-resguardo-cel") {
        celSelected = !celSelected;

        let icon = button.find('i')

        if (celSelected) {
            icon.removeClass("fa-regular fa-square").addClass("fa-solid fa-square-check");
        } else {
            icon.removeClass("fa-solid fa-square-check").addClass("fa-regular fa-square");
        }
    } else {
        selected = !selected;

        let icon = button.find('i')
        if (selected) {
            icon.removeClass("fa-regular fa-square").addClass("fa-solid fa-square-check");
        } else {
            icon.removeClass("fa-solid fa-square-check").addClass("fa-regular fa-square");
        }
    }

}

//todo Cerrando el control-sidebar con click fuera de éste
$(".content-wrapper").click(function () {
    if ($('body').hasClass('control-sidebar-slide-open')) {
        //console.log('cerrando sidebar');
        $('[data-widget="control-sidebar"]').ControlSidebar('toggle');
    }
});

let dominio = window.location.hostname
let puerto = location.port

//console.log(window.FilePond);

FilePond.registerPlugin(FilePondPluginFileValidateType);

let fileResguardo = document.getElementById('up-resguardo-file')

// Create a FilePond instance
const pond = FilePond.create(fileResguardo, {
    maxFiles: 1,
    labelIdle: 'Arrastra y suelta tu archivo .pdf o <span class="filepond--label-action"> Examina </span>',
    allowMultiple: false,
    dropOnPage: true,
    dropValidation: true,
    instantUpload: false,
    acceptedFileTypes: ['application/pdf'],
    labelFileTypeNotAllowed: 'Archivo no válido. Solo se permiten archivos .pdf',
    disabled: true,
    server: {
        process: {
            url: "database/controller_inventario/controller_inventario.php",
            method: 'POST',
            name: 'resguardo',
            withCredentials: false,
            ondata: (formData) => {
                const trama = {
                    accion: 7,
                    usuario: $('#select-usu-file').val()
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
                        mostrar_toast("success", "Subido", data.resultado.mensaje)

                        pond.removeFile();
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

let fileToOpen;

pond.on('addfile', (error, fileItem) => {
    if (error) {
        console.error('Error al cargar PDF:', error);
        return;
    }

    // Generar URL temporal para el archivo PDF
    fileToOpen = URL.createObjectURL(fileItem.file);

    const viewer = document.getElementById('pdf-viewer');
    viewer.src = fileToOpen;

});

//* Función para abrir el sidebar para la subida y visualización de resguardos
async function abrir_control_sidebar() {

    await general_select2({
        selectId: 'select-usu-file',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#control-sidebar',
        tags: false
    });

    await general_select2({
        selectId: 'select-ver-usu-file',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#control-sidebar',
        tags: false
    });

    col_subir_resguardos_firmados()
}

//* Función para subir el pdf desde el modal de visualización del archivo
function subir_pdf() {
    $('#mdl-file-up').modal('hide');
    pond.processFile()
        .then(() => {
            //* limpiar FilePond 
            pond.removeFile();
        })
        .catch(error => {
            console.error('Error al subir archivo:', error);
            mostrar_toast("error", "Error", 'Error al subir archivo. Inténtalo de nuevo.' + error);
        });
}

//*Habilitando el input para subir archivos
$('#select-usu-file').on('change', function () {
    const seleccionado = $(this).val();

    if (seleccionado !== '') {
        pond.setOptions({ disabled: false })
    } else {
        pond.setOptions({ disabled: true })
        $('#btn-ver-pdf').prop('disabled', true)
    }
})

//*Habilitando el boton de ver pdf cuando haya un archivo en el filePond
document.addEventListener('FilePond:addfile', (e) => {
    $('#btn-ver-pdf').prop('disabled', false)
})

//* Deshabilitando el boton de ver pdf cuando el archivo haya sido removido del filePond
document.addEventListener('FilePond:removefile', (e) => {
    $('#btn-ver-pdf').prop('disabled', true)
    $('#select-usu-file').val(null).trigger('change');
})

//* Abrir modal para visualizar el pdf en la aplicación
function ver_pdf(ruta) {
    if (ruta) {
        //*Si el modal se abre desde descargar archivos

        const viewer = document.getElementById('pdf-viewer');
        viewer.src = ruta;

        $('#mdl-btn-subir-pdf').css('display', 'none')
        $('#mdl-file-up').modal('show');
    } else {
        //* Si el modal se abre desde subir archivos
        $('#mdl-btn-subir-pdf').css('display', 'block')
        $('#mdl-file-up').modal('show');
    }

}

//*mostrar formulario de descarga de archivos
function col_ver_resguardos_firmados() {
    $('#col-subir').hide()
    $('#btn-col-subir').prop('disabled', false)
    $('#btn-col-descargar').prop('disabled', true)
    $('#select-ver-usu-file').val(null).trigger('change');
    let contenedor = document.getElementById('lista-documentos');
    contenedor.innerHTML = '';
    pond.removeFile();
    $('#col-descargar').show()
}

//*mostrar formulario de carga de archivos
function col_subir_resguardos_firmados() {
    $('#col-descargar').hide()
    $('#btn-col-descargar').prop('disabled', false)
    $('#btn-col-subir').prop('disabled', true)
    $('#select-usu-file').val(null).trigger('change');
    $('#col-subir').show()
}

//* consultar los documentos de ese usuario
$('#select-ver-usu-file').on('change', async function () {

    if ($(this).val() === "") {
        return
    }

    dominio = window.location.hostname
    puerto = location.port

    let model = {
        accion: 8,
        usuario: $("#select-ver-usu-file").val()
    }

    server = await server_inventario(model)

    if (server.resultado.documentos) {
        //console.log(server.resultado.documentos)
        let rutas = server.resultado.documentos.reverse()

        let documentos = rutas.map(rutaCompleta => {
            // Extraer solo el nombre del archivo
            let nombreArchivoCompleto = rutaCompleta.split('/').pop();

            // Dividir nombre del archivo en partes (fecha, hora, resto)
            let [fecha, hora] = nombreArchivoCompleto.split('_');
            let nombreArchivo = nombreArchivoCompleto.split('_').slice(2).join('_');

            return {
                fecha,
                hora,
                nombreArchivo,
                ruta: rutaCompleta
            };
        });



        let contenedor = document.getElementById('lista-documentos');
        contenedor.innerHTML = '';

        documentos.forEach(doc => {
            // doc.ruta es la ruta completa para href/download
            // doc.fecha, doc.hora, doc.nombreArchivo son las partes separadas
            let ruta = dominio + ':' + puerto + doc.ruta

            fecha = doc.fecha
            // Extraemos partes de la fecha
            const anio = fecha.substring(0, 4);
            const mes = fecha.substring(4, 6);
            const dia = fecha.substring(6, 8);

            const fechaFormateada = `${dia}-${mes}-${anio}`; // "14-07-2025"


            const item = `
            <div class="list-group-item">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-md-4">
                            <img src="images/pdf-icon.webp" alt="Imagen descriptiva" style="max-width: 100%; height: 80px;">
                        </div>
                        <div class="col-md-8">
                            <strong>${fechaFormateada}</strong>
                            <span>Resguardo_${doc.fecha}_${doc.hora}</span>
                            <br>
                            <button  type="button" class="btn btn-lock btn-outline-dark icon" onclick="ver_pdf('http://${ruta}')"><i class="fa-solid fa-eye"></i> Ver</button>
                        </div>
                    </div>
                </div>
                                
            </div>`;

            contenedor.innerHTML += item;
        });


    } else if (server.resultado.mensaje) {
        //console.log(server.resultado.mensaje)
        let mensaje = server.resultado.mensaje

        let contenedor = document.getElementById('lista-documentos');
        contenedor.innerHTML = '';

        const item = `
            <div class="list-group-item">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col">
                            <strong>El usuario no cuenta con resguardos subidos</strong>
                        </div>
                    </div>
                </div>
                                
            </div>`;

        contenedor.innerHTML += item;



    } else {
        mostrar_toast("error", "Error", 'Hubo un problema con el servidor')
    }
})