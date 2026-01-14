auditoria_loading = false;
function server_auditoria(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_auditorias/controller_auditorias.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (respose) {
                try {
                    resolve(JSON.parse(respose))
                    if (auditoria_loading) {
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

    let server = await server_auditoria({ accion: 1 })
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
let auditorias_pendientes

async function consultar_auditoria(anio) {
    const fecha = anio.value;
    // console.log(fecha);

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
                    mdl_correo_reporte_auditoria(elemento_aud)
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
                        mdl_descargar_reporte_auditoria(elemento_aud);

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
                    reporte_auditoria_firmado(elemento_aud)
                    // abrir_subir_reporte(elemento_aud.id, elemento_aud.fecha)
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

    auditorias_pendientes = Object.values(datos_auditoria.reduce((objeto, item) => {
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
    // console.log(auditorias_pendientes);
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
    $('#btn-conf-aud').prop('disabled', false);

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
    $('#btn-conf-aud').prop('disabled', true);

    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url;
        mostrar_toast('success', '¡Programa de auditoria exitosa!', 'El programa de auditoria se generó correctamente.');
        $('#mdl-prog-aud').modal("hide");
        load_auditoria()

    } else {
        mostrar_toast('error', 'Error', server.resultado.error);
        $('#mdl-prog-aud').modal("hide");
    }
}

async function consultar_pauditoria_firmado() {

    let año_pauditoria = auditorias_pendientes[0].anio;

    let model = {
        accion: 3,
        anio: año_pauditoria
    }

    let server = await server_auditoria(model);

    const PDF = document.getElementById('lista-pdfs-pauditoria');

    if (server.resultado.existe === true) {
        document.getElementById('alert-pauditoria').style.display = 'block';

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
        document.getElementById('alert-pauditoria').style.display = 'none';
        PDF.innerHTML = '';
    }

    document.getElementById('btn-open-pauditoria').click();

    auditoria_firmado();
}

let charco = null;
let charcoInicializado = false;

async function auditoria_firmado() {


    if (!charcoInicializado) {

        const input = document.getElementById("subir-pauditoria");

        charco = FilePond.create(input, {
            maxFiles: 1,
            acceptedFileTypes: ['application/pdf'],
            labelIdle: 'Arrastre y suelta un archivo .pdf o <span class="filepond--label-action"> Examina </span>',
            allowMultiple: false,
            dropOnPage: false,
            instantUpload: false,
            labelFileTypeNotAllowed: 'Archivo no válido solo .pdf',
            server: {
                process: {
                    url: "database/controller_auditorias/controller_auditorias.php",
                    method: "POST",
                    name: 'reporte_pauditoria',
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
                            charco.removeFiles();
                            // consultar_auditoria(auditorias_pendientes[0]);
                            consultar_pauditoria_firmado();
                        }
                    },
                    onerror: (err) => {
                        console.error('Error al subir: ', err);
                    }
                }
            }
        });

        charcoInicializado = true;
    } else {
        charco.removeFiles();
    }
}

//TODO: Funciones para el proceso de auditoria (notificación, descarga de reporte, carga de reporte, vista de reporte, información del activo)

//* Funciones para notificación de auditoría (mdl_correo_reporte_auditoria, corre_reporte_auditoria, validar_correo 1 y 2)
async function mdl_correo_reporte_auditoria(equipo) {

    await Promise.all([
        general_select2({
            selectId: 'sa-usuario-correo',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'NA',
            dropdownParent: '#mdl-correo-rauditoria',
        }),

        general_select2({
            selectId: 'sa-cargo-correo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'NA',
            dropdownParent: '#mdl-correo-rauditoria',
            sincronizarCampo: 'cargo',
            sincronizarCon: 'sa-usuario-correo'
        })
    ])
    rellenar_select(equipo.usuario, "sa-usuario-correo");
    rellenar_select(equipo.cargo, 'sa-cargo-correo')
    $('#inp-aud-correo').val(equipo.correo_usuario)
    $('#inp-aud-correo-validar').val('')

    $('#btn-mdl-rauditoria').off('click').on('click', () => { correo_reporte_auditoria(equipo); });

    $('#mdl-correo-rauditoria').modal('show');
}

async function correo_reporte_auditoria(datos_equipo) {
    const validar = ['inp-aud-correo', 'inp-aud-correo-validar'];

    if (!validar_campos(validar)) {
        mostrar_toast('warning', 'Aviso', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    if (!validar_correo1($('#inp-aud-correo').val().trim().toLowerCase()) || !validar_correo1($('#inp-aud-correo-validar').val().trim().toLowerCase())) {
        mostrar_toast('warning', 'Aviso', 'Uno o ambos correos no tienen el formato correcto');
        return;
    }

    if (!validar_correo2($('#inp-aud-correo').val().trim().toLowerCase(), $('#inp-aud-correo-validar').val().trim().toLowerCase())) {
        mostrar_toast('warning', 'Aviso', 'Los correos no coinciden');
        return;
    }

    let model = {
        accion: 2,
        correo: $('#inp-aud-correo').val().trim().toLowerCase(),
        datos: datos_equipo,
        /* dominio: window.location.hostname,
        puerto: location.port */
    }
    //*Variable global para saber si la página esta mostrarndo algun loader
    auditoria_loading = true
    mostrar_toast_cargando('Enviando correo...')
    $('#mdl-correo-rauditoria').modal('hide')

    let server = await server_correo(model)

    if (server.resultado === true) {
        mostrar_toast('success', '¡Realizado!', "Correo enviado al usuario")

        //* Actualizando la fila sin dibujar de nuevo la tabla
        const row = tabla_aud.getRow(datos_equipo.id);
        if (row) {
            row.update({ correo_enviado: 1 }); //*Agregar await al principio si se requiere forzar renderizado de un boton de habilitado a deshabilitado
            tabla_aud.redraw(true);
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

function validar_correo1(correo) {
    const correo_valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return correo_valido.test(correo)
}

function validar_correo2(texto1, texto2) {
    if (texto1 === texto2) {
        return true
    } else {
        return false
    }
}

//* Funciones para descarga de reporte de auditoria
async function mdl_descargar_reporte_auditoria(equipo) {
    $("#btn-reporte-aud").prop("disabled", false);
    // document.getElementById("btn-reporte-aud").disabled = false;

    await Promise.all([
        general_select2({
            selectId: 'saud-encargado',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            dropdownParent: '#mdl-reporte-aud',
            placeholder: 'Seleccione un encargado'
        }),

        general_select2({
            selectId: 'saud-cargo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            dropdownParent: '#mdl-reporte-aud',
            placeholder: 'Seleccione un cargo',
            sincronizarCampo: 'cargo',
            sincronizarCon: 'saud-encargado'
        })
    ]);

    rellenar_select("César Ignacio Torres Almeida", "saud-encargado");
    $("#btn-reporte-aud").off('click').on('click', function () { reporte_auditoria(equipo) })
    $("#mdl-reporte-aud").modal("show");
}

async function reporte_auditoria(equipo) {
    let model = {
        accion: 6,
        elementos: equipo,
        encargado: $("#saud-encargado").select2('data')[0].text,
        cargo: $("#saud-cargo").select2('data')[0].text
    }

    mostrar_toast_cargando("Generando reporte de auditoria...")
    // document.getElementById("btn-reporte-mant").disabled = true;
    $("#btn-reporte-aud").prop("disabled", true);

    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url;
        $('#mdl-reporte-aud').modal("hide");

        const filas = server.resultado.ids.map(id => ({
            id: id,
            reporte_descargado: 1,
            estado: "En proceso"
        }));
        tabla_aud.updateData(filas);

        consultar_mantenimientos_vencidos()
        mostrar_toast('success', '¡Generación de reporte exitoso!', 'La generación de reporte de auditoria se ha realizado correctamente.');
    } else {
        mostrar_toast('error', '¡Error!', 'No se pudo generar el reporte de auditoria. Inténtelo nuevamente.');
        $('#btn-reporte-aud').prop('disabled', false);
    }
}

//* Funciones para subir reporte de auditoria

let charco2;
let charcoInicializado2;

async function reporte_auditoria_firmado(elemento_aud) {
    //*Escondiendo el alert
    document.getElementById('alert-aud-reporte').setAttribute('style', 'display: none !important;  background-color:#fceaea; border-color:#f5c6cb; color:#721c24; padding-right: 4rem;');

    //*Escondiendo el visor de pdf
    $('#pdf-aud').hide()

    if (charco2) {
        charco2.destroy();   //* <- Esto destruye la instancia anterior, lo cual es necesario
    }

    //* Al destruir la instancia es necesario colocarle de nuevo el name al input, sino, no aceptará el archivo el php
    $('#subir-reporte-aud').attr('name', 'reporte_aud');

    let fileAud = document.getElementById('subir-reporte-aud')

    //datos_documento = [id,fechaMnto]
    let fecha = elemento_aud.fecha.split('-')
    let anio = {}
    anio.value = fecha[0]
    // Create a FilePond instance
    charco2 = FilePond.create(fileAud, {
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
                url: "database/controller_auditorias/controller_auditorias.php",
                method: 'POST',
                name: 'reporte_aud',
                withCredentials: false,
                ondata: (formData) => {
                    const trama = {
                        accion: 3,
                        id_equipo: elemento_aud.id,
                        fecha_aud: elemento_aud.fecha
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
                            mostrar_toast("success", "Subido", data.resultado.mensaje)
                            consultar_auditoria(anio);

                            charco2.removeFile();
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
    let abrirArchivo;

    charco2.on('addfile', (error, fileItem) => {
        if (error) {
            mostrar_toast('error', 'Error', 'Error al cargar PDF:' + error);
            return;
        }

        charcoInicializado2 = fileItem; // <-- guardar archivo

        // Generar URL temporal para el archivo PDF
        abrirArchivo = URL.createObjectURL(fileItem.file);

        const viewer = document.getElementById('pdf-ver-aud');
        viewer.src = abrirArchivo;

        $('#pdf-aud').show()

    });

    let server = await server_auditoria({ accion: 4, id_equipo: elemento_aud.id, fecha_aud: elemento_aud.fecha })

    if (server.resultado) {
        document.getElementById('alert-aud-reporte').style.display = 'block'
    }
}

function eliminar_archivo() {
    if (charco2 && charcoInicializado2) {
        charco2.removeFile(charcoInicializado2);
        fileItemCargado = null;
    }
}