auditoria_loading = false;
function server_auditoria(model) {
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
                        auditoria_loading = !auditoria_loading
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

async function load_auditoria() {
    await general_select2({
        selectId: 'select-anio-auditoria',
        tabla: 'auditoria',
        campo: 'anio',
        placeholder: 'Seleccione un año',
        dropdownParent: '#card-auditoria',
        tags: false,
        // popoverTitle: "Descripción",
        // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
    })

    let server = await server_auditoria({ accion: 4 })
    if (!server.resultado) {
        return
    } else {
        let fecha = {}
        fecha.value = server.resultado.anio
        $('#select-anio-auditoria').val(fecha.value).trigger('change')

    }
}

let datos_auditoria = [];
let tabla_aud;
let elemento_aud;

async function consultar_auditoria(anio) {
    const fecha = anio.value;

    let server = await server_auditoria({ accion: 0, anio: fecha });

    if (!fecha) return;

    datos_auditoria = server.resultado
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

    let editarIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return `<button type='button' class='btn btn-warning icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Información' onclick=''><i class='fa-solid fa-circle-info fa-lg'></i></button>`;
    }

    let subirIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.reporte_descargado == 0 ? "disabled" : ""

        return `<button type='button' class='btn btn-info icon' ${disabled} data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Subir reporte firmado' data-widget="control-sidebar" data-slide="true" data-target="#control-sidebar"><i class='fa-solid fa-upload fa-lg'></i></button>`;
    }

    let archivoIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.correo_enviado == 0 ? "disabled" : ""

        return `<button type='button' class='btn btn-success icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Reporte de mantenimiento' onclick=''><i class='fa-solid fa-file-excel fa-lg'></i></button>`;
    }

    let verIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.reporte_subido == 0 ? "disabled" : ""

        return `<button type='button' class='btn btn-lock btn-outline-dark icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Ver pdf'><i class='fa-solid fa-eye '></i></button>`;
    }

    let correoIcon = function (cell, formatterParams, onRendered) { //plain text value
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

    tabla_aud = new Tabulator("#tbl-aud", {
        locale: "es",
        data: datos_auditoria,
        layout: "fitColumns",
        maxHeight: window.innerHeight,
        movableColumns: true,
        pagination: true,
        paginationSize: 15,
        paginationSizeSelector: [15, 25, 35, true],
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = tabla_aud.getDataCount(); // Asegúrate que 'table' esté accesible
            const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
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
        groupToggleElement: "header",
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
                formatter: correoIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "correo_enviado",
                cellClick: function (e, cell) {
                    elemento_aud = cell.getRow().getData();
                    mdl_correo_reporte_mantenimiento(elemento_aud)
                },
            },
            {
                formatter: archivoIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "correo_enviado",
                cellClick: function (e, cell) {
                    const button = cell.getElement().querySelector('button');
                    if (button && !button.disabled) {
                        // Deshabilita el botón
                        button.disabled = true;

                        // Acción que quieres ejecutar al hacer clic
                        const elemento_aud = cell.getRow().getData();
                        mdl_reporte_mantenimiento(elemento_aud);

                        // Rehabilita el botón después de 3 segundos
                        setTimeout(() => {
                            button.disabled = false;
                        }, 3000);
                    }
                }
            },
            {
                formatter: subirIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_descargado",
                cellClick: function (e, cell) {
                    elemento_aud = cell.getRow().getData();
                    abrir_subir_reporte(elemento_aud.id, elemento_aud.fecha)
                }
            },

            {
                formatter: verIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_subido",
                cellClick: function (e, cell) {
                    elemento_aud = cell.getRow().getData();
                    ver_pdf_reporte(elemento_aud.id, elemento_aud.fecha)
                }
            },
            {
                formatter: editarIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento_aud = cell.getRow().getData();
                    mdl_mantenimiento_info(elemento_aud);
                }
            },
        ],
    });
}

async function mdl_programar_auditoria() {

    await Promise.all([
        general_select2({
            selectId: 'elaboro-aud',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'cg-elaboro-aud',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
            sincronizarCon: 'elaboro-aud',
            sincronizarCampo: 'cargo'
        }),

        general_select2({
            selectId: 'autorizo-aud',
            tabla: 'supervisor',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'cg-autorizo-aud',
            tabla: 'supervisor',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
            sincronizarCon: 'autorizo-aud',
            sincronizarCampo: 'cargo'
        }),
    ])

    rellenar_select("Alejandro Cancino Argüello", "autorizo-aud");
    rellenar_select("César Ignacio Torres Almeida", "elaboro-aud");

    $('#cg-elaboro-aud, #cg-autorizo-aud').prop('disabled', true)
    $("#btn-conf-aud").off("click").on("click", function () { programar_auditoria() })

    $('#mdl-prog-aud').modal("show")
}

async function programar_auditoria() {

    const validar = ['elaboro-aud', 'autorizo-aud']

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = {
        accion: 5,
        elaboro: $('#elaboro-aud').select2('data')[0].text,
        cg_elaboro: $('#cg-elaboro-aud').select2('data')[0].text,
        autorizo: $('#autorizo-aud').select2('data')[0].text,
        cg_autorizo: $('#cg-autorizo-aud').select2('data')[0].text,

    }

    mostrar_toast_cargando('Programando auditoria...')
    $('#mdl-btn-conf').prop('disabled', true);

    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url;
        mostrar_toast('success', '¡Programa de auditoria exitosa!', 'El programa de auditoria se generó correctamente.');
        $('#mdl-prog-aud').modal("hide");
        load()

    } else {
        mostrar_toast('error', 'Error', server.resultado.error);
        $('#mdl-prog-aud').modal("hide");
    }/*  else if (server.resultado.duplicado === false) {
        mostrar_toast('error', '¡Error!', 'Ya existe un programa de auditoria para el año');
        $('#mdl-prog-mant').modal("hide");
    } */
    // console.log(auditoriasPendientes);


}