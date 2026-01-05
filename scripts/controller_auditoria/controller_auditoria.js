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

let datos_auditoria = [];
let tabla_aud;

async function consultar_auditoria(anio) {
    const fecha = anio.value;

    let server = await server_mantenimiento({ accion: 0, anio: fecha });

    if (!fecha) return;

    datos_auditoria = server.resultado
    Tabulator.extenModule("localize", "langs", {
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

    tabla_aud = new Tabulator("#tbl-aud"), {
        local: "es",
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
    }
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