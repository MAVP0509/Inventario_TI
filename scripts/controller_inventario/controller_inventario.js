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
                    respuesta = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    });
}

let datos = []; // Arreglo que almacenará los datos del inventario
let elemento;    // Variable que almacenará temporalmente el registro seleccionado para edición
let table;   // Instancia de la tabla Tabulator
let equipo_seleccionado = [];   // Arreglo que almacena los IDs de los equipos seleccionados por el usuario
//* Función principal para consultar y mostrar la información del inventario
async function consultar_informacion() {
    // Se construye el modelo que se enviará al servidor
    let model = {
        accion: 2
    };
    // Envía la petición al servidor y se espera la respuesta
    let response = await server_inventario(model);
    // Guarda los datos devueltos por el servidor en el arreglo datos
    datos = response.resultado
    // Se configura el idioma español para los textos de Tabulator
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
    // Antes de construir la tabla, cada registro recibido del servidor se inicializa con la propiedad seleccionado (controla el estado visual d cada fila)
    datos.forEach(d => d.seleccionado = false); 
    // Función que define el ícono de selección (checkbox visual)
    let squareIcon = function (cell, formatterParams, onRendered) {
        const seleccionado = cell.getRow().getData().seleccionado;  // Obtiene el estado de selección
        const iconClass = seleccionado ? "fa-solid fa-square-check" : "fa-regular fa-square";   // Define el icono
        return `<button type='button' class='btn icon toggle-select'>
                    <i class='${iconClass} fa-lg'></i>
                </button>`;
    }
    // Función que define el ícono de edición
    let editIcon = function (cell, formatterParams, onRendered) {
        return `<button type='button' class='btn btn-warning icon' onclick=''><i class='fa-solid fa-pen-to-square fa-lg'></i></button>`;
    }

    try {
        // Se inicializa la tabla Tabulator
        table = new Tabulator("#tbl01", {
            locale: "es",   // Idioma
            data: datos,    // Datos a mostrar
            pagination: true,   // Activa paginación
            maxHeight: "750px", // Altura máxima
            paginationSize: 10, // Registros por página
            paginationSizeSelector: [10, 25, 35, true],
            movableColumns: true,   // Permite mover columnas
            // Personaliza el contador de registros
            paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
                const totalRows = table.getDataCount(); // Asegúrate que 'table' esté accesible
                const end = Math.min(currentRowStart + pageSize - 1, totalRows);
                return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
            },
            // Aplica estilos visuales según el estado de selección
            rowFormatter: function (row) {  
                data = row.getData()
                if (data.seleccionado === true) {
                    row.getElement().classList.add("bg-primary")
                } else if (data.seleccionado === false) {
                    row.getElement().classList.remove("bg-primary")
                }
            },
            // Definición de columnas
            columns: [
                {
                    formatter: squareIcon, width: 70, hozAlign: "center", // Se muestra un ícono dinámico según el estado de selección (fa-square -> no seleccionado, fa-square-check -> seleccionado)
                    cellClick: function (e, cell) {
                        let rowData = cell.getRow().getData();  //Obtiene los datos de la fila
                        rowData.seleccionado = !rowData.seleccionado;   // Alterna el estado lógico de selección
                        cell.getRow().reformat();   //Re-renderiza la fila para reflejar el cambio visual (Actualiza la vista)
                        seleccionar_registro(rowData.id_equipo, equipo_seleccionado)    // Actualiza el arreglo de rubros seleccionados
                    }, headerSort: false, frozen: true, width: 70, hozAlign: "center",
                },
                {
                    title: "Zona", field: "zona", width: 130, headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "list",
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
                {   // Botón de edición
                    formatter: editIcon, width: 60, hozAlign: "center",
                    cellClick: function (e, cell) {
                        elemento = cell.getRow().getData(); // Guarda el regsitro seleccionado
                        mdl_editar(elemento);   // Abre el modal de edición
                    },
                    headerSort: false, frozen: true
                },

            ],


        });

    } catch (error) {
        console.log(error)  // Muestra errores en consola
    }
    // Se desactiva el autocompletado en los filtros
    table.on("tableBuilt", () => {
        Array.from(document.getElementsByName("tbtor-filter")).forEach(input => {
            input.setAttribute("autocomplete", "off");
            input.setAttribute("type", "text");
        });
    });
    // Obtiene el input de búsqueda general
    let searchInput = document.getElementById("buscador-tabla-inventario")
    // Evento para filtrar la tabla al escribir
    searchInput.addEventListener("keyup", function () {
        // Texto ingresado por el usuario
        let query = searchInput.value.toLowerCase();
        // Filtro personalizado: busca coincidencias en cualquier campo
        table.setFilter(function (data) {
            // Recorre todas las propiedades de la fila
            for (var key in data) {
                if (data[key] && data[key].toString().toLowerCase().includes(query)) {
                    return true; // Coincidencia encontrada
                }
            }
            return false; // No hay coincidencia
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
            break;
        }
    }
    //*Mostrar la fecha
    $('#lbl-fecha-reg').show()
    $('#inp-fecha-reg').show()
    $("#btn-mdl-inventario").prop('disabled', false);
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

    $("#btn-mdl-inventario").prop("disabled", true);
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
        fecha_entrega: $("#inp-fecha-entrega").val(),
        region: JSON.parse(sessionStorage.getItem('user')).resultado[2]
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
    // Campos requeridos para la validación
    const validacion = ['mdl-estado']

    // Se obtiene el valor actual del campo (estado seleccionado por el usuario)
    const tipo_seleccionado = $('#mdl-estado').val();

    // Si el estado seleccionado es "Asignado",
    // se agregan campos de zona y ubicación como obligatorios
    if (tipo_seleccionado === 'Asignado') {
        validacion.push("mdl-zona", "mdl-ubicacion");
    }

    // Valida los campos definidos en el arrglo validacion; si algún campo es vació o inválido
    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellene los campos. Inténtalo nuevamente');    // Muetsra mensaje de error
        return false    // Detiene la ejecución de la función
    }

    // Construcción del model con datos del formulario
    let model = {
        accion: 6,
        id: equipo_seleccionado,
        estatus: $('#mdl-estado').val(),
        usuario: $('#mdl-usuario').val(),
        zona: $('#mdl-zona').val(),
        ubicacion: $('#mdl-ubicacion').val(),
    }

    // Envia los datos al servidor
    let server = await server_inventario(model);
    // Maneja las repsuestas del servidor
    if (server.resultado) {
        equipo_seleccionado = []    // Limpia el arreglo de equipos
        consultar_informacion();    // Actualiza la tabla principal
        $('#mdl-traspaso').modal('hide')
        // REgistar en el historial el estado anterior y porsterior de los activos
        await registrar_historico('Anterior asignación', server.resultado.anterior);
        await registrar_historico('Generarción de traspaso', server.resultado.nuevo);
        mostrar_toast('success', '¡Traspaso exitoso!', 'El traspaso se ha realizado correctamente');
        // Si está habilitada la opción de generar resguardo
        if (selected) {
            let userSelected = $('#mdl-usuario').val()  // Se obtiene el usuario seleccionado
            resguardo(userSelected)     // Llama a la función para generar el resguardo del usuario
        }

    } else {
        // Si el servidor no repsonde correctamente, muestra mensaje de error
        mostrar_toast('error', 'Error', 'No se pudo realizar el traspaso. Inténtalo nuevamente.');
    }
}

async function mostrar_traspaso() {
    // Verifica si no hay equipos seleccionados
    if (equipo_seleccionado.length == 0) {
        mostrar_toast('warning', 'Alerta', 'Selecione al menos un activo. Inténtalo nuevamente.')
    } else {
        // Inicialización de selects
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

        selected = false    // Desactiva la opción de generación de resguardo
        // Cambia el icono del checkbox visual a estado "no seleccionado"
        $("#check-resguardo-icon").removeClass("fa-solid fa-square-check")
        $("#check-resguardo-icon").addClass("fa-regular fa-square ")
        // Muentra el modal de trapaso
        $("#mdl-traspaso").modal("show");
    }
}

async function desactivar_registro() {
    // Se contruye el objeto model de datos necesarios
    let model = {
        accion: 3,
        id: equipo_seleccionado, // IDs seleccionados
    };
    // Se envía el modelo al servidor para ejecutar la baja
    let response = await server_inventario(model);
    // Verifica que la respuesta contenga un arreglo
    if (Array.isArray(response.resultado)) {
        // Registra en el hsitorial el evento de baja de activo
        await registrar_historico('Baja de activo', response.resultado);
        // Muestra mensaje de éxito
        mostrar_toast('success', '¡Baja de activo exitosa!', 'La baja se ha realizado correctamente.');
        equipo_seleccionado = []    // Limpia el arreglo de equipos seleccionados  
        consultar_informacion();    // Actualiza la tabla principal del inventario
    } else {
        // Si ocurre un errorm se muestra un mensaje al usuario.
        mostrar_toast('error', 'Error', 'No se pudo realizar la baja del activo. Inténtalo nuevamente.');
    }
}

async function mdl_imprimir() {
    // Se obtiene el contenedor dentro del modal donde se mostrarán las columnas seleccionables
    const check_columnas = document.querySelector("#mdl-imprimir .modal-body");
    // Se obtienen las columnas de la tabla que tienen campo y título definido
    const columnas_exp = table.getColumns().filter(col => col.getField() && col.getDefinition().title);
    // Se establece el texto inicial del modal indicando la instrucción al usuario
    check_columnas.innerHTML = "<p>Selecciona las columnas que deseas incluir en el PDF:</p>";
    // Se recorre cada columna obtenida para generar dinámicamente los botones de selección
    columnas_exp.forEach(col => {
        const field = col.getField();   // Se obtiene el nombre del campo de la columna
        const title = col.getDefinition().title;    // Se obtiene el título visible de la columna
        const div = document.createElement("div");  // Se crea un contenedor div para cada opción de columna
        div.className = "form-check";    // Se asigna la clase de Bootstrap para formato de checkbox
        // Se construye el contenido HTML del botón con su icono y título
        div.innerHTML = `
            <div class="form-check">
                <button type="button" class="btn btn-lg toggle-select icon" data-field="${field}" data-checked="true">
                    <i class="fa-solid fa-square-check"></i>
                </button>
                <span>${title}</span>
            </div>`;
        // Se agrega el elemento creado al contenedor principal del modal
        check_columnas.appendChild(div);


    });
    // Se valida si el evento click ya fue asignado previamente al contenedor
    if (!check_columnas.dataset.listenerAttached) {
        // Se agrega un evento click al contenedor de columnas
        check_columnas.addEventListener("click", function (e) {
            // Se identifica si el clic fue sobre un botón con la clase toggle-select
            const button = e.target.closest(".toggle-select");
            if (!button) return;    // se detiene la ejecución
            // Se obtiene el estado actual del botón (true = seleccionado)
            const checked = button.dataset.checked === "true";
            // Se actualiza el estado del botón al valor contrario
            button.dataset.checked = (!checked).toString();
            // Se cambia el icono según el nuevo estado del botón
            button.innerHTML = checked
                ? '<i class="fa-regular fa-square"></i>'    // Icono desmarcado
                : '<i class="fa-solid fa-square-check"></i>';   // Icono marcado
        });
        // Se marca que el listener ya fue agregado para evitar duplicarlo
        check_columnas.dataset.listenerAttached = "true";
    }
    // Se elimina cualquier evento previo del botón imprimir y se asigna uno nuevo
    $("#btn-imprimir").off('click').on('click', function () { imprimir_pdf() })
    $("#mdl-imprimir").modal("show");   // Se muestra el modal de impresión

}

async function imprimir_pdf() {
    // Se obtienen todos los botones de selección que estén marcados (data-checked="true")
    let seleccionados = document.querySelectorAll("#mdl-imprimir .toggle-select[data-checked='true']");
    // Se convierten los elementos seleccionados en un arreglo con los nombres de los campos seleccionados
    let campos_selecionados = Array.from(seleccionados).map(el => el.dataset.field);
    // Se obtienen los datos actualmente visibles (filtrados) de la tabla
    const filtrados = table.getData("active");

    let campos  // Variable que almacena el ancho de cada columna
    // Si se seleccionan 14 o más columna, se asigna ancho fijo de 40 a cada una
    if (campos_selecionados.length >= 14) {
        campos = Array(campos_selecionados.length).fill(40)
        // Si se seleccionan menos de 14 columnas, se asigna ancho automático a cada una    
    } else {
        campos = Array(campos_selecionados.length).fill('auto')
    }
    // Se construye el encabezado del PDF a partir de los títulos reales de la tabla
    let headers = campos_selecionados.map(field => {
        // Se obtiene la definición de la columna correspondiente al campo
        const col = table.getColumn(field);
        // Si existe la columna, se toma su título; si no, se usa el nombre del campo
        return col ? col.getDefinition().title : field;
    });
    // Se construye el cuerpo de la tabla del PDF
    let body = [
        headers,    // Primera fila: encabezados
        ...filtrados.map(row =>
            campos_selecionados.map(field => row[field] || "")
        )
    ];
    // Se define la estructura del documento PDF
    const docDefinition = {
        pageOrientation: 'landscape',   // Orientación horizontal de la hoja
        pageMargins: [10, 10, 10, 10],  // Márgenes del documento
        // contenido princiapl del PDF
        content: [
            { text: 'Inventario de Activos', style: 'header' },
            {
                table: {
                    headerRows: 1,  // Se indica que la primera fial es encabezado
                    widths: campos, // Ancho de las columnas
                    body: body,     // Datos de la tabla
                    dontBreakRows: true // Evita que la filas se dividan entre páginas
                },
                layout: 'lightHorizontalLines'  // Estilo visual de líneas
            }
        ],
        // Estilos personalizados
        styles: {
            header: {
                fontSize: 16,
                bold: true,
                margin: [0, 0, 0, 10]
            }
        },
        // Estilo por defecto para el texto
        defaultStyle: {
            fontSize: 7,
            alignment: 'center',
            wordBreak: 'break-word',
        }
    };
    // Se genera la fecha y hora actua para usarla en el nombre del archivo
    const fecha = moment().format('YYYYMMDD_HHmmss');
    // Se crea el PDF y se descraga automáticamente con nombre dinámico
    pdfMake.createPdf(docDefinition).download(`Inventario_TI_${fecha}.pdf`);

    $('#mdl-imprimir').modal('hide'); // Cierra modal
}

function imprimir_excel() {
    const fecha = moment().format('YYYYMMDD_HHmmss');   // Se obtiene la fecha y hora actual
    // Se utiliza la función download() de la tabla para exportar los datos a Excel
    table.download("xlsx", `Inventario_TI_${fecha}.xlsx`, {
        sheetName: "Inventario",    // Se define el nombre de la hoja dentro del archivo de Excel
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
    // Si alguno está asignado, muestra advertencia y no continúa
    if (estado) {
        mostrar_toast('warning', 'Alerta', 'Uno o más activos se encuentran asignados. Inténtalo nuevamente.');
        return; // Termina ejecuación

    } else {
        // Si están en estado "Bodega", muestra una alerta con opciones:
        // Confirmar baja directa o genera formato excel antes de continuar
        mostrar_alert('warning', `¿Está seguro de eliminar ${equipo_seleccionado.length} activo(s)?`, false,
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
    input.each(function () { $(this).val(''); $(this).removeClass('is-invalid') });

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

    rellenar_select("César Ignacio Torres Almeida", "slc-emisor")
    rellenar_select("Alejandro Cancino Arguello", "slc-supervisor");
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

    // Asigna evento para botón confirmación
    $('#btn-confirmar').off('click').on('click', function () {
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

// Función de genración de documento de baja
async function generar_baja() {
    // Verifica si la tabla no ha sido inicializada.
    if (!tbl_baja) {
        mostrar_toast('error', 'Error', 'No hay datos en la tabla para generar la baja.');
        return;
    }
    // Creación de objeto que agrupa toda la información necesaria para procesar la baja.
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
        tabla_baja: tbl_baja.getData().map((item, index) => ({ //Extrae los datos de la tabla y los transforma para agregar campos adicionales por cada fila
            ...item,
            rownum: index + 1,
            // Se crea una descripción compuesta para cada activo.
            descripcion: `${item.tipo || ''} Marca ${item.marca || ''} Serie ${item.num_serie || ''} Modelo ${item.modelo || ''}`
        })),

    }

    // Muestra una notificación tipo "loading" inc
    mostrar_toast_cargando('Generando documento...');
    let server = await server_excel(model);

    // Verifica la respuesta del servidor con dos resultados
    // server.resultado.url : url para descargar el archivo de baja.
    // server.resultado.result : es una respuesta booleana con solo dos resultado (true, false)
    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url; // Redirecciona el navegador a esa URL (descarga automática del archivo).
        desactivar_registro(); //Llama a la función encargada de realizar la baja
        $('#mdl-baja').modal("hide");
    } else { // Mensaje de error al recibir una respuesta del servidor "false"
        mostrar_toast('error', 'Error', 'No se pudo dar de baja el activo. Inténtalo nuevamente.')
    }
}

//TODO Funciones de los Select2

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

let selected = false    // Variable que indica si el resguardo general esta seleccionado
let celSelected = false // Variable que indica si el resguardo de celular está seleccionado
// Evento que se ejecuta al hacer clic en un botón con la clase .check-button
$('.check-button').on('click', function () {
    // Llama a la función button_checked enviando el botón presionado
    button_checked($(this))
});

//TODO: Funciones para el resguardo
async function resguardo(userSelect) {
    // Obtiene todos los elementos con el nombre 'inp-resg'
    let inputs = document.getElementsByName('inp-resg')
    // Recorre cada input del formulario de resguardo
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].classList.remove('is-invalid')    // Elimina la clase de error visual (is-invalid)
        inputs[i].value = "";   // Limpia el valor de cada campo
    }

    $('#select-usu').val(null).trigger('change');   // Limpia la selección del usuario en el select2
    $('#select-usu').prop('disabled', false)    // Habilita el select de usuario
    $('#select-region').val(null).trigger('change');    // Limpia la selección del campo región

    $collapse = $('#collapse-resguardo');   // Obtiene el contenedor colapsable del formulario de resguardo
    $collapse.slideUp();    // Oculta el formulario con animación
    $collapse.closest('.card').addClass('collapsed-card');  // Marca la tarjeta como colapsada visualmente
    // Cambia el icono de menos a más en el botón de colapsar
    $collapse.closest('.card')
        .find('[data-card-widget="collapse"] i')
        .removeClass('fa-minus')
        .addClass('fa-plus');
    // Al cargar el documento, asigna la fecha actual al campo fecha-resguardo
    $(document).ready(function () {
        let hoy = new Date().toISOString().split('T')[0];
        $('#fecha-resguardo').val(hoy);
    });
    // Define las opciones fijas para el select de región
    let region = [
        { id: 1, text: 'Norte' },
        { id: 2, text: 'Sur' },
        { id: 3, text: 'Tampico' }
    ]
    // Inicializa el select2 de usuarios consultando la tabla cat_usuarios
    await general_select2({
        selectId: 'select-usu',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Seleccione un usuario',
        dropdownParent: '#mdl-res',
        tags: false
    });
    // Inicializa el select2 de regiones usando el arreglo definido
    await general_select2({
        selectId: 'select-region',
        data: region,
        placeholder: 'Seleccione una región',
        dropdownParent: '#mdl-res',
        tags: false
    });
    // Si se recibió un usuario como parámetro
    if (userSelect) {
        $('#select-usu').val(userSelect).trigger('change')  // Selecciona automáticamente ese usuario
        $('#select-usu').prop('disabled', true) // Deshabilita el select para evitar que se cambie
    }
    // Oculta la columna específica de PEMEX
    document.getElementById('col-pemex').style.display = 'none'

    selected = false    // Reinicia el estado del check de resguardo general
    celSelected = false // Reinicia el estado del check de resguardo de celular

    // Cambia el icono del check de resguardo PEMEX a no seleccionado
    $("#check-resguardo-pemex-icon").removeClass("fa-solid fa-square-check")
    $("#check-resguardo-pemex-icon").addClass("fa-regular fa-square ")
    // Cambia el icono del check de resguardo celular a no seleccionado
    $("#check-resguardo-cel-icon").removeClass("fa-solid fa-square-check")
    $("#check-resguardo-cel-icon").addClass("fa-regular fa-square ")
    $("#mdl-res").modal('show') // Muestra el modal de resguardo
}

//*Validando si será un resguardo de PEMEX
$(document).ready(function () {
    // Escucha cambios en el campo "inp-tipo"
    $('#check-resguardo-pemex').on('click', function () {

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

async function crear_resguardo() {
    // Campos obligatorios a validar
    const validacion = [
        "select-usu",
        "select-region",
        "inp-ubicacion-resg",
        "inp-area",
    ];
    // Si el resguardo PEMEX está seleccionado; se agrega a validación
    if (selected) {
        validacion.push("inp-user-pemex", "inp-cargo-pemex")
    }
    // Ejecuta la validación de campos obligatorios
    if (!validar_campos(validacion)) {
        mostrar_toast('warning', 'Aviso', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }
    // Construcción del objeto model con los datos del formulario
    let model = {
        accion: 4,
        usuario: $('#select-usu').val().trim(),
        region: $("#select-region").select2('data')[0].text,
        comentario: $('#txt-area').val().trim(),
        fecha: $('#fecha-resguardo').val(),
        area: $('#inp-area').val(),
        ubicacion: $('#inp-ubicacion-resg').val(),
        userPemex: $('#inp-user-pemex').val(),  // Obtiene el nombre del usuario PEMEX (si aplica)
        userPemexCargo: $('#inp-cargo-pemex').val(),    // Obtiene el cargo del usuario PEMEX (si aplica)
        cel: celSelected ? 1 : 0     // Indica si incluye celular (1) o no (0)
    }

    loading = true  // Activa bandera de carga
    mostrar_toast_cargando('Generando documento...')    // Muestra mensaje de proceso en curso
    $("#mdl-res").modal('hide')     // Cierra el modal de resguardo
    // Envía el modelo al servidor para su procesamiento
    let server = await server_inventario(model)
    // Si el servidor devuelve un error lógico
    if (server.resultado.error) {
        // Muestra mensaje de advertencia con el error devuelto
        mostrar_toast('warning', 'Aviso', server.resultado.error)

    } else if (server.resultado) {  // Si la respuesta del servido es válida
        // Abre el documento de resguardo generado
        abrir_resguardo(server.resultado.result)
        // Registra en el historial la generación del resguardo
        await registrar_historico('Generación de resguardo', server.resultado.resguardo);
        // Actualiza la tabla principal de inventario
        consultar_informacion();
    } else {    // Si ocurre un error inesperado
        mostrar_toast('error', 'Aviso', "Hubo un error")    // Muestra mensaje de error genérico
    }
}

function abrir_resguardo(datos) {
    dominio = window.location.hostname, // Obtiene el nombre del dominio actual
        puerto = location.port  // Obtiene el puerto actual del servidor

    let ruta = datos.resultado  // Extrae la ruta del archivo devuelta por el servidor
    // Elimina comillas dobles al inicio y al final de la cadena, si existen
    // Ejemplo: '"C:\\ruta\\archivo.xlsx"' → 'C:\\ruta\\archivo.xlsx'
    ruta = ruta.replace(/^"|"$/g, '');
    // Reemplaza las \ por /
    ruta = ruta.replace(/\\/g, '/');
    // Cambia la extensión del archivo Excel a PDF
    ruta = ruta.replace(/\.xlsx$/i, '.pdf');
    // Reemplaza la ruta física del servidor por una URL accesible vía navegador
    // Ejemplo: C:/xampp/htdocs/archivos/resguardo.pdf
    // Se convierte en: http://localhost:puerto/archivos/resguardo.pdf
    ruta = ruta.replace("C:/xampp/htdocs", "http://" + dominio + ":" + puerto)
    // Abre el archivo PDF generado en una nueva pestaña del navegador
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

    //consultar_mantenimientos_vencidos()
})//.val(start + " - " + end);

function myCallback(start, end) {
    $("#rango-fecha span").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"))
}

function button_checked(button) {
    // Verifica si el botón presionado corresponde al check de resguardo Pemex
    if (button[0].id == "check-resguardo-pemex") {
        selected = !selected;   // Invierte el valor de la variable selected (true <>> false)
        let icon = button.find('i') // Obtiene el ícono (<i>) que está dentro del botón
        // Si selected es verdadero, muestra el icono como seleccionado
        if (selected) {
            icon.removeClass("fa-regular fa-square").addClass("fa-solid fa-square-check");
            // Si selected es falso, muestra el icono como no seleccionado
        } else {
            icon.removeClass("fa-solid fa-square-check").addClass("fa-regular fa-square");
        }
        // Verifica si el botón presionado corresponde al check de resguardo de celular
    } else if (button[0].id == "check-resguardo-cel") {
        celSelected = !celSelected; // Invierte el valor de la variable celSelected (true <-> false)
        let icon = button.find('i') // Obtiene el ícono (<i>) que está dentro del botón
        // Si celSelected es verdadero, muestra el icono como seleccionado
        if (celSelected) {
            icon.removeClass("fa-regular fa-square").addClass("fa-solid fa-square-check");
            // Si celSelected es falso, muestra el icono como no seleccionado
        } else {
            icon.removeClass("fa-solid fa-square-check").addClass("fa-regular fa-square");
        }
        // Caso general: cualquier otro botón tipo check
    } else {
        selected = !selected;   // Invierte el valor de la variable selected
        let icon = button.find('i') // Obtiene el ícono (<i>) que está dentro del botón
        // Si selected es verdadero, muestra el icono como seleccionado
        if (selected) {
            icon.removeClass("fa-regular fa-square").addClass("fa-solid fa-square-check");
            // Si selected es falso, muestra el icono como no seleccionado
        } else {
            icon.removeClass("fa-solid fa-square-check").addClass("fa-regular fa-square");
        }
    }

}

//todo Cerrando el control-sidebar con click fuera de éste
$(".content-wrapper").click(function () {
    if ($('body').hasClass('control-sidebar-slide-open')) {
        $('[data-widget="control-sidebar"]').ControlSidebar('toggle');
    }
});

let dominio = window.location.hostname  // Obtinene el nombre del dominio
let puerto = location.port  // Obtiene el puerto en el que se ejecuta la app

// Registra el plugin de validación de tipo de archivo para FilePond
FilePond.registerPlugin(FilePondPluginFileValidateType);
// Obtiene el input file donde se cargará el PDF del resguardo
let fileResguardo = document.getElementById('up-resguardo-file')

// Create una instanacia de Filepond sobre el input file
const pond = FilePond.create(fileResguardo, {
    maxFiles: 1,    // Limita la carga a un solo archivo
    labelIdle: 'Arrastra y suelta tu archivo .pdf o <span class="filepond--label-action"> Examina </span>', // Texto que se muestra cuando no hay seleccionado
    allowMultiple: false,   //Desactiva la selección de múltiples archivos
    dropOnPage: true,   // Permite soltar el archivo en cualquier parte de la página
    dropValidation: true,   // Activa la validación al arrastrar archivos
    instantUpload: false,   // Desactiva la subida automática
    acceptedFileTypes: ['application/pdf'], // Define los tipos de archivo permitido (solo PDF)
    labelFileTypeNotAllowed: 'Archivo no válido. Solo se permiten archivos .pdf',   // Mensaje mostrado si el archivo no es válido
    disabled: true, // Inicialmente deshabilita el componente
    // Configuración del servidor para subir el archivo
    server: {
        process: {
            url: "database/controller_inventario/controller_inventario.php",    // URL del controlador que recibirá el archivo
            method: 'POST', // Método HTTP utilizado para el envío
            name: 'resguardo',  // Nombre del campo del archivo en el servidor
            withCredentials: false, // No se envían credenciales
            ondata: (formData) => {     // Función que permite agregar datos adicionales al FormData
                const trama = { // Contrucción del objeto
                    accion: 7,
                    usuario: $('#select-usu-file').val()
                };
                formData.append('trama', JSON.stringify(trama));    // Se agrega la trama como JSON al FormData
                return formData;    // Se retorna el FormData modificado
            },
            onload: (response) => {  // Función que se ejecuta cuando el servidor responde correctamente
                try {
                    const data = JSON.parse(response); // Convierte la respuesta (string) a objeto JSON
                    if (data.resultado.error) {
                        alert("Error: " + data.resultado.error);    // Si el servidor devuelve un error
                    } else {    // Si la subida fue exitosa
                        mostrar_toast("success", "Subido", data.resultado.mensaje)
                        pond.removeFile();  // Elimina el archivo cargado del componente
                    }
                } catch (e) {
                    // Captura errores al convertir la respuesta en JSON
                    console.error("Error al parsear respuesta:", e);
                }
            },
            onerror: (error) => {   // Función que se ejecuta si ocurre un error durante la subida
                console.error('Error al subir:', error);
                alert("Error al subir archivo.");
            }
        },
    }
});

let fileToOpen; // Variable para almacenar la URL temporal del PDF
// Evento que se ejecuta cuando se agrega un archivo a FilePond
pond.on('addfile', (error, fileItem) => {
    // Si ocurre un error al cargar el archivo
    if (error) {
        console.error('Error al cargar PDF:', error);
        return;
    }
    // Generar URL temporal para visualizar el PDF cargado
    fileToOpen = URL.createObjectURL(fileItem.file);
    // Obtiene el iframe o visor donde se mostrará el PDF
    const viewer = document.getElementById('pdf-viewer');
    viewer.src = fileToOpen;    // Asigna la URL del PDF al visor
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

//* Evento que se ejecuta cuando cambia el valor del select de usuarios
$('#select-ver-usu-file').on('change', async function () {
    // Si el valor seleccionado está vacío, no se ejecuta nada
    if ($(this).val() === "") {
        return
    }

    dominio = window.location.hostname  // Obtiene el dominio actual
    puerto = location.port  // Obtiene el puerto del servidor

    // Construye el modelo que se enviará al servidor
    let model = {
        accion: 8,
        usuario: $("#select-ver-usu-file").val()
    }
    // Envía el modelo al servidor y espera la respuesta
    server = await server_inventario(model)
    // Verifica si el servidor devolvió una lista de documentos
    if (server.resultado.documentos) {
        // Invierte el orden para mostrar primero los documentos más recientes
        let rutas = server.resultado.documentos.reverse()
        // Procesa cada ruta para separar fecha, hora y nombre del archivo
        let documentos = rutas.map(rutaCompleta => {
            // Obtiene solo el nombre del archivo (sin ruta)
            let nombreArchivoCompleto = rutaCompleta.split('/').pop();
            // Dividir nombre del archivo en partes (fecha, hora, resto)
            let [fecha, hora] = nombreArchivoCompleto.split('_');
            // Obtiene el nombre real del archivo eliminando fecha y hora
            let nombreArchivo = nombreArchivoCompleto.split('_').slice(2).join('_');
            // Retorna un objeto con los datos procesados
            return {
                fecha,
                hora,
                nombreArchivo,
                ruta: rutaCompleta
            };
        });
        // Obtiene el contenedor donde se listarán los documentos
        let contenedor = document.getElementById('lista-documentos');
        contenedor.innerHTML = '';  // Limpia el contenido previo
        // Recorre cada documento procesado
        documentos.forEach(doc => {
            // Construye la ruta completa del archivo con dominio y puerto
            let ruta = dominio + ':' + puerto + doc.ruta
            // Obtiene la fecha en formato AAAAMMDD
            fecha = doc.fecha
            // Extraemos partes de la fecha
            const anio = fecha.substring(0, 4);
            const mes = fecha.substring(4, 6);
            const dia = fecha.substring(6, 8);

            const fechaFormateada = `${dia}-${mes}-${anio}`; // Formatea la fecha a DD-MM-AAAA "14-07-2025"

            // Construye el elemento HTML para mostrar cada documento
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
            // Inserta el elemento en el contenedor
            contenedor.innerHTML += item;
        });
        // Si el servidor indica que no hay documentos para el usuario
    } else if (server.resultado.mensaje) {
        // Obtiene el contenedor de documentos
        let contenedor = document.getElementById('lista-documentos');
        // Limpia el contenido previo
        contenedor.innerHTML = '';
        // Construye el mensaje visual de que no hay documentos
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
        // Inserta el mensaje en el contenedor
        contenedor.innerHTML += item;
        // Si ocurre un error inesperado del servidor
    } else {
        mostrar_toast("error", "Error", 'Hubo un problema con el servidor')
    }
})