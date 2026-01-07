mantenimiento_loading = false
function server_mantenimiento(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_mantenimientos/controller_mantenimientos.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (respose) {
                try {
                    resolve(JSON.parse(respose))
                    if (mantenimiento_loading) {
                        Swal.close()
                        mantenimiento_loading = !mantenimiento_loading
                    }
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}
function server_excel(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_excel/controller_excel.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (respose) {
                try {
                    resolve(JSON.parse(respose))
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

function server_correo(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_email/controller_email.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (respose) {
                try {
                    resolve(JSON.parse(respose))
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

async function load() {
    await general_select2({
        selectId: 'select-anio-mantenimiento',
        tabla: 'mantenimiento',
        campo: 'anio',
        placeholder: 'Seleccione un año',
        dropdownParent: '#card-mantenimientos',
        tags: false,
        // popoverTitle: "Descripción",
        // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
    })

    let server = await server_mantenimiento({ accion: 4 })
    if (!server.resultado) {
        return
    } else {
        let fecha = {}
        fecha.value = server.resultado.anio
        $('#select-anio-mantenimiento').val(fecha.value).trigger('change')

    }
}

let datos_mantenimiento = []
let elemento_mnt
let table
let mantenimientosPendientes

async function consultar_informacion(anio) {

    const fecha = anio.value
    //load()
    let server = await server_mantenimiento({ accion: 0, anio: fecha })

    //* Mostrar mensaje
    /* if (!fecha) {
        table = new Tabulator('#tbl01', {
            locale: "es",
            layout: "fitColumns",
            data: [{ mensaje: "Seleccione un año para ver la información de mantenimiento." }],
            columns: [
                { title: "Mensaje", field: "mensaje", hozAlign: "center" }
            ]
        });
        return;
    } */

    if (!fecha) return;

    datos_mantenimiento = server.resultado
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
        }
    });

    let editIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return `<button type='button' class='btn btn-warning icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Información' onclick=''><i class='fa-solid fa-circle-info fa-lg'></i></button>`;
    }

    let uploadIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.reporte_descargado == 0 ? "disabled" : ""

        return `<button type='button' class='btn btn-info icon' ${disabled} data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Subir reporte firmado' data-widget="control-sidebar" data-slide="true" data-target="#control-sidebar"><i class='fa-solid fa-upload fa-lg'></i></button>`;
    }

    let fileIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.correo_enviado == 0 ? "disabled" : ""

        return `<button type='button' class='btn btn-success icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Reporte de mantenimiento' onclick=''><i class='fa-solid fa-file-excel fa-lg'></i></button>`;
    }

    let eyeIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.reporte_subido == 0 ? "disabled" : ""

        return `<button type='button' class='btn btn-lock btn-outline-dark icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Ver pdf'><i class='fa-solid fa-eye '></i></button>`;
    }

    let mailIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        /* const data = cell.getRow().getData()
        const disabled = data.correo_enviado == 1 ? "disabled" : "" */
        return `<button type='button' class='btn btn-lock btn-danger envelope'  data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Enviar correo'><i class='fa-solid fa-envelope '></i></button>`;
    }

    let menuEstatus = [
        {
            label: `<i class="fa-solid fa-circle" style="color: #28a745;"></i> Realizado`
        },
        { label: `<i class="fa-solid fa-circle" style="color: #0385ffff;"></i> En proceso` },
        {
            label: `<i class="fa-solid fa-circle" style="color: #ff7300;"></i> Pendiente`
        },
        {
            label: `<i class="fa-solid fa-circle fa-beat-fade" style="color: #dc3545;"></i> Vencido`
        },
    ]

    table = new Tabulator('#tbl01', {
        locale: "es",
        data: datos_mantenimiento,
        layout: "fitColumns",              //fit columns to width of table
        //height: window.innerHeight ,
        maxHeight: window.innerHeight,
        movableColumns: true,              //allow column order to be changed
        pagination: true,
        paginationSize: 15,
        paginationSizeSelector: [15, 25, 35, true],
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = table.getDataCount(); // Asegúrate que 'table' esté accesible
            const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
        //paginationButtonCount: 3,
        groupBy: function (data) {
            // Asegura que tenga formato YYYY-MM
            const [año, mes] = data.fecha.split("-");
            // Creamos una fecha con día explícito
            const fecha = new Date(`${año}-${mes}-01T00:00:00`);
            const opciones = { year: 'numeric', month: 'long' };

            //let excluir = ['Realizado']
            //const datos = table.getData().filter(d=> d.estado && !excluir.includes(d.estado)).length


            return `${fecha.toLocaleDateString('es-ES', opciones)}`
        },
        groupHeader: function (value, count, data) {
            const fila = data[0];  // Primera fila del grupo

            const [año, mes] = fila.fecha.split("-");
            const fecha = new Date(`${año}-${mes}-01T00:00:00`);
            const opciones = { year: 'numeric', month: 'long' };

            // Excluir estatus
            const excluir = ['Realizado'];

            // Contar pendiente SOLO dentro del grupo actual
            const pendientes = data.filter(d =>
                d.estado &&
                !excluir.includes(d.estado)
            ).length;

            return `${fecha.toLocaleDateString('es-ES', opciones)} (${pendientes} mantenimientos pendientes)`;

        },
        groupStartOpen: false,
        groupToggleElement: "header", //* Permite que dando click en cualquier parte del header group, éste se despliegue
        //headerVisible: false,
        /*         dataGrouped: function (groups) {
                    restaurarEstadoDeGrupos();
                },
                renderComplete: function () {
                    restaurarEstadoDeGrupos()
                }, */
        columns: [
            {
                title: "Fecha", field: "fecha", width: 115, headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input", sorter: "date",
            },
            {
                title: "Tipo",
                field: "tipo", width: 130, headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input",
                formatter: function (cell, formatterParams, onRendered) {
                    let data = cell.getData();
                    return `${data.tipo}<br><small>${data.marca}<br><small>${data.modelo}`;
                }
            },
            {
                title: "Número de serie",
                field: "num_serie", headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input"

            },
            {
                title: "Usuario",
                field: "usuario", headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input",
                formatter: function (cell, formatterParams, onRendered) {
                    let data = cell.getData(); // Obtiene toda la fila
                    return `${data.usuario}<br><small>${data.cargo}</small>`;
                }

            },
            {
                title: "Ubicación",
                field: "ubicacion", headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "list",
                headerFilterParams: {
                    valuesLookup: true, clearable: true,
                }

            },
            {
                title: "Estatus",
                field: "estado", hozAlign: "center", formatter: "lookup", headerHozAlign: "center", formatter: "lookup", width: 150,
                headerFilterParams: {
                    valuesLookup: true, clearable: true,
                },
                headerMenu: menuEstatus,
                headerMenuIcon: '<i class="fa-solid fa-circle-question"></i>',
                formatterParams: {
                    "Pendiente": `<i class="fa-solid fa-circle" style="color: #ff7300;"></i> Pendiente`,
                    "En proceso": `<i class="fa-solid fa-circle" style="color: #0385ffff;"></i> En proceso`,
                    "Realizado": `<i class="fa-solid fa-circle" style="color: #28a745;"></i> Realizado`,
                    "Vencido": `<i class="fa-solid fa-circle fa-beat-fade" style="color: #dc3545;"></i> Vencido`,
                },
                headerFilter: "list",
                headerFilterParams: {
                    valuesLookup: true, clearable: true,
                }, headerSort: false,

            },
            {
                formatter: mailIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "correo_enviado",
                cellClick: function (e, cell) {
                    elemento_mnt = cell.getRow().getData();
                    mdl_correo_reporte_mantenimiento(elemento_mnt)
                },
            },
            {
                formatter: fileIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "correo_enviado",
                cellClick: function (e, cell) {
                    const button = cell.getElement().querySelector('button');
                    if (button && !button.disabled) {
                        // Deshabilita el botón
                        button.disabled = true;

                        // Acción que quieres ejecutar al hacer clic
                        const elemento_mnt = cell.getRow().getData();
                        mdl_reporte_mantenimiento(elemento_mnt);

                        // Rehabilita el botón después de 3 segundos
                        setTimeout(() => {
                            button.disabled = false;
                        }, 3000);
                    }
                }
            },
            {
                formatter: uploadIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_descargado",
                cellClick: function (e, cell) {
                    elemento_mnt = cell.getRow().getData();
                    abrir_subir_reporte(elemento_mnt.id, elemento_mnt.fecha)
                }
            },

            {
                formatter: eyeIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_subido",
                cellClick: function (e, cell) {
                    elemento_mnt = cell.getRow().getData();
                    ver_pdf_reporte(elemento_mnt.id, elemento_mnt.fecha)
                }
            },
            {
                formatter: editIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento_mnt = cell.getRow().getData();
                    mdl_mantenimiento_info(elemento_mnt);
                }
            },
        ],
    })
    mantenimientosPendientes = Object.values(datos_mantenimiento.reduce((objeto, item) => {

        if (item.estado == "Realizado") return objeto

        let anio = item.anio
        let mes = item.fecha.split('-')[1]

        // Si aún no existe el año, inicializamos su propiedad meses
        if (!objeto[anio]) {
            objeto[anio] = { anio: anio, meses: {} };
        }

        //si ya existe este mes, incrementa su valor, sino lo inicia en 0 y suma 1
        objeto[anio].meses[mes] = (objeto[anio].meses[mes] || 0) + 1

        return objeto
    }, {}))
}

async function mdl_programar_mantenimiento() {

    await Promise.all([
        general_select2({
            selectId: 'select-elaboro',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'select-cg-elaboro',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            sincronizarCon: 'select-elaboro',
            sincronizarCampo: 'cargo'
        }),

        general_select2({
            selectId: 'select-autorizo',
            tabla: 'supervisor',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'select-cg-autorizo',
            tabla: 'supervisor',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            sincronizarCon: 'select-autorizo',
            sincronizarCampo: 'cargo'
        }),
    ])

    rellenar_select("Alejandro Cancino Argüello", "select-autorizo");
    rellenar_select("César Ignacio Torres Almeida", "select-elaboro");
    $('#mdl-btn-conf').prop('disabled', false);

    $('#select-cg-elaboro, #select-cg-autorizo').prop('disabled', true)
    $("#mdl-btn-conf").off("click").on("click", function () { programar_mantenimiento() })

    $('#mdl-prog-mant').modal("show")
}

async function programar_mantenimiento() {

    const validar = ['select-elaboro', 'select-autorizo']

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = {
        accion: 3,
        elaboro: $('#select-elaboro').select2('data')[0].text,
        cg_elaboro: $('#select-cg-elaboro').select2('data')[0].text,
        autorizo: $('#select-autorizo').select2('data')[0].text,
        cg_autorizo: $('#select-cg-autorizo').select2('data')[0].text,

    }

    mostrar_toast_cargando('Programando mantenimiento...')
    $('#mdl-btn-conf').prop('disabled', true);

    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url;
        mostrar_toast('success', '¡Programa de mantenimiento exitosa!', 'Rellena los campos. Inténtelo nuevamente.');
        $('#mdl-prog-mant').modal("hide");
        load()

    } else if (server.resultado.result === false) {
        mostrar_toast('error', 'Error', server.resultado.error);
        $('#mdl-prog-mant').modal("hide");
        $('#mdl-btn-conf').prop('disabled', false);
    }/*  else if (server.resultado.duplicado === false) {
        mostrar_toast('error', '¡Error!', 'Ya existe un programa de mantenimiento para el año');
        $('#mdl-prog-mant').modal("hide");
    } */
}

let selecreg
async function mdl_mantenimiento_info(elemento_mnt) {
    // Busca en el arreglo 'datos_mantenimiento' el registro con el mismo id_equipo

    for (let i = 0; i < datos_mantenimiento.length; i++) {
        const element = datos_mantenimiento[i];
        if (element.id === elemento_mnt.id && element.anio === elemento_mnt.anio) {
            // Guarda el registro completo en una variable global
            selecreg = element;
            break;
        }
    }
    // Llama a varias funciones para cargar los selects con datos dinámicos
    await Promise.all([
        general_select2({
            selectId: 'select-rubro',
            tabla: 'cat_rubro',
            campo: 'rubro',
            placeholder: 'Selecione un rubro',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Categoría general del activo. Agrupa dispositivos por su tipo funcional, como computadoras, dispositivos móviles, etc."
        }),

        general_select2({
            selectId: 'select-tipo',
            tabla: 'cat_tipo',
            campo: 'tipo',
            placeholder: 'Selecione un tipo',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'select-marca',
            tabla: 'cat_marca',
            campo: 'marca',
            placeholder: 'Seleccione una marca',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Es la marca del activo."
        }),

        general_select2({
            selectId: 'select-ubicacion',
            tabla: 'inventario_ti_sur',
            campo: 'ubicacion',
            placeholder: 'Selecciona una ubicacion',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Indica el lugar específico dentro de la zona donde se encuentra físicamente el dispositivo."
        }),

        general_select2({
            selectId: 'select-usuario',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'NA',
            dropdownParent: '#mdl-mant-info',
        }),

        general_select2({
            selectId: 'select-cargo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'NA',
            dropdownParent: '#mdl-mant-info',
            sincronizarCampo: 'cargo',
            sincronizarCon: 'select-usuario'
        }),
    ])

    rellenar_select(selecreg.usuario, "select-usuario");
    rellenar_select(selecreg.cargo, 'select-cargo')
    rellenar_select(selecreg.tipo, "select-tipo");
    rellenar_select(selecreg.marca, "select-marca");
    rellenar_select(selecreg.ubicacion, "select-ubicacion");
    rellenar_select(selecreg.rubro, "select-rubro")
    $('#inp-modelo').val(selecreg.modelo)
    $('#inp-num-serie').val(selecreg.num_serie)
    $('#inp-fecha').val(selecreg.fecha)
    $('#inp-estatus').val(selecreg.estado)

    switch (selecreg.estado) {
        case "Pendiente":
            $('#estatus-icon').css('color', '#ff7300')
            break;
        case "En proceso":
            $('#estatus-icon').css('color', '#0385ffff')
            break;
        case "Realizado":
            $('#estatus-icon').css('color', '#28a745')
            break;
        case "Vencido":
            $('#estatus-icon').css('color', '#dc3545')
            break;
        default:
            $('#estatus-icon').css('color', '')
            break;
    }

    $('#mdl-mant-info').modal("show")

}

async function mdl_reporte_mantenimiento(elemento_mnt) {

    $("#btn-reporte-mant").prop("disabled", false);
    // document.getElementById("btn-reporte-mant").disabled = false;

    await general_select2({
        selectId: 'slc-encargado',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        dropdownParent: '#mdl-reporte-mant',
        placeholder: 'Seleccione un encargado'
    })

    rellenar_select("César Ignacio Torres Almeida", "slc-encargado");
    $("#btn-reporte-mant").off('click').on('click', function () { reporte_mantenimiento(elemento_mnt) })
    $("#mdl-reporte-mant").modal("show");
}

async function reporte_mantenimiento(elemento_mnt) {

    let model = {
        accion: 4,
        elementos: elemento_mnt,
        encargado: $("#slc-encargado").select2('data')[0].text
    }

    mostrar_toast_cargando("Generando reporte de mantenimiento...")
    // document.getElementById("btn-reporte-mant").disabled = true;
    $("#btn-reporte-mant").prop("disabled", true);

    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url;
        $('#mdl-reporte-mant').modal("hide");

        const filas = server.resultado.ids.map(id => ({
            id: id, 
            reporte_descargado: 1, 
            estado: "En proceso"
        }))
        table.updateData(filas)
        consultar_mantenimientos_vencidos()
        mostrar_toast('success', '¡Generación de reporte exitoso!', 'La generación de reporte de mantenimiento se ha realizado correctamente.');
    } else {
        mostrar_toast('error', '¡Error!', 'No se pudo generar el reporte de mantenimiento. Inténtelo nuevamente.');
        $('#btn-reporte-mant').prop('disabled', false);
    }
}

//? Inicializar popover
$(function () {
    $('[data-toggle="popover"]').tooltip()
})

function rellenar_select(texto, select) {
    let textoBuscado = texto;
    let $select = $('#' + select);

    $select.find('option').filter(function () {
        return $(this).text().trim() === textoBuscado;
    }).prop('selected', true);

    $select.trigger('change');
}


//todo Subida de reportes de mantenimiento
FilePond.registerPlugin(FilePondPluginFileValidateType);


let pond
//* Variable utilizada para guardar temporalmente el archivo y asi poder ser eliminado desde otra función
let fileItemCargado
async function abrir_subir_reporte(id, fechaMnto) {
    //*Escondiendo el alert
    document.getElementById('alert-reporte').setAttribute('style', 'display: none !important;  background-color:#fceaea; border-color:#f5c6cb; color:#721c24; padding-right: 4rem;');

    //*Escondiendo el visor de pdf
    $('#ver-pdf-reporte').hide()

    if (pond) {
        pond.destroy();   //* <- Esto destruye la instancia anterior, lo cual es necesario
    }

    //* Al destruir la instancia es necesario colocarle de nuevo el name al input, sino, no aceptará el archivo el php
    $('#subir-reporte').attr('name', 'reporte_mantenimiento');

    let fileReporte = document.getElementById('subir-reporte')

    //datos_documento = [id,fechaMnto]
    let fecha = fechaMnto.split('-')
    let anio = {}
    anio.value = fecha[0]
    // Create a FilePond instance
    pond = FilePond.create(fileReporte, {
        maxFiles: 1,
        labelIdle: 'Arrastra y suelta tu archivo .pdf o <span class="filepond--label-action"> Examina </span>',
        allowMultiple: false,
        dropOnPage: true,
        dropValidation: true,
        instantUpload: false,
        acceptedFileTypes: ['application/pdf'],
        labelFileTypeNotAllowed: 'Archivo no válido solo .pdf',
        server: {
            process: {
                url: "database/controller_mantenimientos/controller_mantenimientos.php",
                method: 'POST',
                name: 'reporte_mantenimiento',
                withCredentials: false,
                ondata: (formData) => {
                    const trama = {
                        accion: 1,
                        id_equipo: id,
                        fecha_mnto: fechaMnto
                    };
                    formData.append('trama', JSON.stringify(trama));
                    return formData;
                },
                onload: (response) => {
                    try {
                        const data = JSON.parse(response); // <- convierte string en objeto
                        if (data.resultado.error) {
                            //console.error("Error del servidor:", data.resultado.error);
                            mostrar_toast("error", "Error", data.resultado.error);
                        } else {
                            table.updateData([{ id: id, reporte_subido: 1, estado: "Realizado" }])
                            mostrar_toast("success", "Subido", data.resultado.mensaje)
                            consultar_informacion(anio)
                            /* table.replaceData(table.getData())
                            table.redraw(true) */
                            //window.location.reload()



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


    //* Mostrando pdf cuando se suba
    let fileToOpen;

    pond.on('addfile', (error, fileItem) => {
        if (error) {
            mostrar_toast('error', 'Error', 'Error al cargar PDF:' + error);
            return;
        }

        fileItemCargado = fileItem; // <-- guardar archivo

        // Generar URL temporal para el archivo PDF
        fileToOpen = URL.createObjectURL(fileItem.file);

        const viewer = document.getElementById('pdf-reporte-viewer');
        viewer.src = fileToOpen;

        $('#ver-pdf-reporte').show()

    });

    let server = await server_mantenimiento({ accion: 2, id_equipo: id, fecha_mnto: fechaMnto })

    if (server.resultado) {
        document.getElementById('alert-reporte').style.display = 'block'
    }
}

//*Funcion para remover el archivo del filepond cuando se cierre el control-sidebar
function remover_archivo() {
    if (pond && fileItemCargado) {
        pond.removeFile(fileItemCargado);
        fileItemCargado = null;
    }
}

//* Escondiendo el boton de ver pdf cuando el archivo haya sido removido del filePond
document.addEventListener('FilePond:removefile', (e) => {
    $('#ver-pdf-reporte').hide()
    $('[data-widget="control-sidebar"]').ControlSidebar('toggle')
})

//todo Cerrando el control-sidebar con click fuera de éste
/* $(".content-wrapper").click(function () {
    if ($('body').hasClass('control-sidebar-slide-open')) {
        //console.log('cerrando sidebar');
        $('[data-widget="control-sidebar"]').ControlSidebar('toggle');
    }
}); */

//*todo Vista del pdf del reporte en caso de existir
async function ver_pdf_reporte(id, fecha) {
    dominio = window.location.hostname
    puerto = location.port

    let model = {
        accion: 3,
        id_equipo: id,
        fecha_mnto: fecha
    }

    let server = await server_mantenimiento(model)

    if (server.resultado.documento) {

        let ruta = `${location.origin}${server.resultado.documento}`;


        const viewer = document.getElementById('mdl-ver-pdf-reporte');
        viewer.src = ruta;

        $('#mdl-ver-pdf').modal('show')
    } else if (server.resultado.aviso) {
        mostrar_toast('warning', 'Aviso', server.resultado.aviso)
    } else {
        mostrar_toast('error', 'Error', "Hubo un error, consulte al equipo de TI")
    }
}


//todo Funciones para el envío de correo de reporte
async function mdl_correo_reporte_mantenimiento(equipo) {
    let fecha = equipo.fecha.split('-')
    let mes = fecha[1]

    //let valido = mesesPendientes.find
    //console.log(mesesPendientes)

    await Promise.all([
        general_select2({
            selectId: 'select-usuario-correo',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'NA',
            dropdownParent: '#mdl-mant-info',
        }),

        general_select2({
            selectId: 'select-cargo-correo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'NA',
            dropdownParent: '#mdl-mant-info',
            sincronizarCampo: 'cargo',
            sincronizarCon: 'select-usuario'
        })
    ])
    rellenar_select(equipo.usuario, "select-usuario-correo");
    rellenar_select(equipo.cargo, 'select-cargo-correo')
    $('#inp-correo').val(equipo.correo_usuario)
    $('#inp-correo-validar').val('')

    $('#btn-mdl-reporte').off('click').on('click', () => { enviar_correo_reporte(equipo); })

    let scrollAnterior = window.scrollY; // guarda scroll actual

    /* $('#mdl-correo-reporte').off('shown.bs.modal').on('shown.bs.modal', function () {
        window.scrollTo(0, scrollAnterior); // restaura scroll al terminar de abrir
    }); */

    $('#mdl-correo-reporte').modal('show')


}

async function enviar_correo_reporte(datos_equipo) {
    const validar = ['inp-correo', 'inp-correo-validar']

    if (!validar_campos(validar)) {
        mostrar_toast('warning', 'Aviso', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    if (!validar_correo($('#inp-correo').val().trim().toLowerCase()) || !validar_correo($('#inp-correo-validar').val().trim().toLowerCase())) {
        mostrar_toast('warning', 'Aviso', 'Uno o ambos correos no tienen el formato correcto');
        return;
    }

    if (!validar_dos_input_text($('#inp-correo').val().trim().toLowerCase(), $('#inp-correo-validar').val().trim().toLowerCase())) {
        mostrar_toast('warning', 'Aviso', 'Los correos no coinciden');
        return;
    }

    let model = {
        accion: 1,
        correo: $('#inp-correo').val().trim().toLowerCase(),
        datos: datos_equipo,
        dominio: window.location.hostname,
        puerto: location.port
    }
    //*Variable global para saber si la página esta mostrarndo algun loader
    mantenimiento_loading = true
    mostrar_toast_cargando('Enviando correo...')
    $('#mdl-correo-reporte').modal('hide')

    let server = await server_correo(model)

    if (server.resultado) {
        //table.updateData([{ id: datos_equipo.id, correo_enviado: 1 }])

        //consultar_informacion()
        mostrar_toast('success', '¡Realizado!', "Correo enviado al usuario")

        //* Actualizando la fila sin dibujar de nuevo la tabla
        const row = table.getRow(datos_equipo.id);
        if (row) {
            row.update({ correo_enviado: 1 }); //*Agregar await al principio si se requiere forzar renderizado de un boton de habilitado a deshabilitado
            table.redraw(true);
        }

        return
    } else if (server.resultado == false) {
        mostrar_toast('error', '¡Error!', "Hubo un problema con el servidor")
        return
    } else {
        mostrar_toast('error', '¡Error!', 'Hubo un problema con el servidor')
        return
    }
}

function validar_correo(correo) {
    const correo_valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return correo_valido.test(correo)
}

function validar_dos_input_text(texto1, texto2) {
    if (texto1 === texto2) {
        return true
    } else {
        return false
    }
}

async function mdl_descargar_reportes_mensuales() {
    const cont = document.getElementById("mesesContainer");
    cont.innerHTML = "";

    let año = mantenimientosPendientes[0].anio
    $('#mdl-descargar-text').text(`Descargar reportes mensuales del año ${año}`)


    consultar_reportes_mensuales()
    $('#mdl-descargar-reportes-mes').modal('show')
}



$(document).ready(function () {
    $('[data-toggle="popover"]').popover();
})


function consultar_reportes_mensuales() {
    //console.log(mantenimientosPendientes[0])

    let meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    let mesesConMantenimientos = Object.keys(mantenimientosPendientes[0].meses)
    //console.log(meses)
    //console.log(mesesConMantenimientos)

    let mesesCompletados = meses.filter(elemento => !mesesConMantenimientos.includes(elemento)).map(Number)
    //console.log(mesesCompletados)

    cargarMeses(mesesCompletados)
}


const mesesNombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function cargarMeses(mesesDisponibles = []) {
    const cont = document.getElementById("mesesContainer");
    cont.innerHTML = "";

    mesesNombres.forEach((mes, i) => {
        const numMes = i + 1;
        let disponible = mesesDisponibles.includes(numMes);

        const card = document.createElement("div");
        card.className = "mes-card " + (disponible ? "disponible" : "no-disponible");

        card.innerHTML = `
            <div class="mes-nombre">${mes}</div>
            <div class="mes-status">${disponible ? "Disponible" : "No disponible"}</div>
        `;

        if (disponible) {
            let numeroMes = numMes.toString().padStart(2, '0') //Si es un digito, se añade un cero a la izquierda
            card.onclick = () => descargarMes(numeroMes);
        }

        cont.appendChild(card);
    });
}

async function descargarMes(mes) {
    dominio = window.location.hostname
    puerto = location.port
    console.log("Descargando mes:", mes);
    mantenimiento_loading = true
    alert_cargando('Uniendo los reportes, esto tardará, por favor espere...')
    let server = await server_mantenimiento({ accion: 5, anio: mantenimientosPendientes[0].anio, mes: mes })

    if (server.resultado.mensaje) {
        mostrar_toast('success', '¡Éxito!', server.resultado.mensaje)

        let ruta = `${location.origin}${server.resultado.ruta}`;

        window.open(ruta, '_blank');

    } else if (server.resultado.error) {
        mostrar_toast('error', '¡Error!', server.resultado.mensaje)
    } else {
        mostrar_toast('error', '¡Error!', 'Hubo un problema')
    }
}

async function consultar_programa_firmado() {

    let año_programa = mantenimientosPendientes[0].anio;

    let model = {
        accion: 7,
        anio: año_programa
    }

    let server = await server_mantenimiento(model);

    const PDF = document.getElementById('lista-pdfs');

    if (server.resultado.existe === true) {
        document.getElementById('alert-programa').style.display = 'block';

        const ruta = server.resultado.url;
        const nombreArchivo = server.resultado.archivo;
        const item = `
            <div class="card mb-2 shadow-sm" style="width: 100%;">
                <div class="card-body d-flex align-items-center p-2">
                    <div class="text-danger mr-3" style="font-size: 2rem;">
                        <i class="fa-solid fa-file-pdf"></i>
                    </div>
                    <div class="flex-grow-1">
                        <strong>${nombreArchivo}</strong><br>
                        
                        <button type="button" class="btn btn-outline-dark btn-sm mt-1" onclick="window.open('${ruta}', '_blank')">
                            <i class="fa-solid fa-eye"></i> Ver
                        </button>
                    </div>
                </div>
            </div>
        `;

        PDF.innerHTML = item;
    } else {
        document.getElementById('alert-programa').style.display = 'none';
        PDF.innerHTML = '';
    }

    document.getElementById('btn-open-programa').click();

    programa_firmado();
}

let estanque = null;
let estanqueInicializado = false;
async function programa_firmado() {

    if (!estanqueInicializado) {

        const input = document.getElementById("subir-programa");

        estanque = FilePond.create(input, {
            maxFiles: 1,
            acceptedFileTypes: ['application/pdf'],
            labelIdle: 'Arrastre y suelta un archivo .pdf o <span class="filepond--label-action"> Examina </span>',
            allowMultiple: false,
            dropOnPage: false,
            instantUpload: false,
            labelFileTypeNotAllowed: 'Archivo no válido solo .pdf',
            server: {
                process: {
                    url: "database/controller_mantenimientos/controller_mantenimientos.php",
                    method: "POST",
                    name: 'reporte_programa',
                    withCredentials: false,
                    ondata: (formData) => {
                        formData.append('trama', JSON.stringify({ accion: 6, anio: auditorias_pendientes[0].anio }));
                        return formData;
                    },
                    onload: (response) => {
                        let data = JSON.parse(response);
                        if (data.resultado.error) {
                            mostrar_toast('error', '¡Error!', data.resultado.error);
                        } else {
                            mostrar_toast('success', '¡Carga exitosa!', data.resultado.mensaje);
                            estanque.removeFiles();
                        }
                    },
                    onerror: (err) => {
                        console.error('Error al subir: ', err);
                    }
                }
            }
        });

        estanqueInicializado = true;
    } else {
        estanque.removeFiles();
    }
}