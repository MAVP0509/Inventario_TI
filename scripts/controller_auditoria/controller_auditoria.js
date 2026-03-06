//*Variable para cerrar toast cargando cuando se realiza una petición que puede tardar más de lo normal
auditoria_loading = false;

//*Función para peticiones http al servidor
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

//*Función para peticiones http de generación de documentos al servidor
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

//*Función para realizar peticiones hhtp al servidor para envío de correos lectrónicos
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

//* Función que se ejecuta al cargar la página, genera el select de año y carga el último año de auditoría
async function load_auditoria() {
    // Inicializa el selector de año (select2) con configuraciones específicas
    await general_select2({
        selectId: 'select-anio-auditoria',
        tabla: 'auditoria',
        campo: 'anio',
        placeholder: 'Seleccione un año',
        dropdownParent: '#card-auditoria',
        tags: false,
    })
    // Obtienen el año más recientes o actual desde el servidor
    let server = await server_auditoria({ accion: 1 });
    // Si no hay resultado del servidor, termina la función
    if (!server.resultado) {
        return
    } else {
        // Crea un objeto con el año obtenido del servidor
        let fecha = {}
        fecha.value = server.resultado.anio
        // Establece el valor en el selector y dispara el evento 'change'
        // para cargar automáticamente los datos de ese año
        $('#select-anio-auditoria').val(fecha.value).trigger('change')

    }
}

//* Limpiar el input del buscador si cambia el año de la tabla
$('#select-anio-auditoria').on('change', () => {
    $('#buscador-tabla-auditoria').val('')
})


let datos_auditoria = [];
let tabla_aud;
let elemento_aud;
let auditorias_pendientes;


let tablas_por_region = {};
let datosGlobales = null;
let tabActual = 'todas'; // Para saber qué tab está activo

//* Obtener datos del usuario
const userData = JSON.parse(sessionStorage.getItem('user'));
const rol = userData.resultado[3];
const regionUsuario = userData.resultado[2];

//* Colores para las regiones
const coloresRegion = [
    'primary', 'success', 'info', 'warning', 'danger',
    'purple', 'indigo', 'pink', 'teal', 'orange'
];

//* Función para cargar la tabla en base a los permisos y la región
async function consultar_auditoria(anio) {
    const fecha = anio.value;
    if (!fecha) return;

    const usuRegion = JSON.parse(sessionStorage.getItem('user'));
    const region = usuRegion.resultado[2];

    //* Limpiar tablas anteriores
    tablas_por_region = {};

    if (rol === 'admin') {
        await cargarDatosAdmin(fecha, region);
    } else {
        await cargarDatosUser(fecha, region);
    }
}

//* Cargar datos para administrador
async function cargarDatosAdmin(fecha, region) {
    //* Mostrar card de admin, ocultar card de user
    document.getElementById('card-admin').style.display = 'block';
    document.getElementById('card-user').style.display = 'none';

    let server = await server_auditoria({
        accion: 0,
        anio: fecha,
        region: '' //* Admin ve todas las regiones
    });

    datos_auditoria = server.resultado;
    datosGlobales = server.resultado; // Copia para tabs

    //* Obtener regiones únicas
    const regionesUnicas = [...new Set(datos_auditoria.map(item => item.zona))].filter(Boolean).sort();

    //* Construir tabs dinámicamente
    construirTabs(regionesUnicas, datos_auditoria);

    //* Crear tabla "Todas" y guardar como tabla_aud principal
    tabla_aud = crear_tabla_auditoria('todas', datos_auditoria, fecha, true);
    tabActual = 'todas';
}

//* Cargar datos para usuario normal
async function cargarDatosUser(fecha, region) {
    //* Mostrar card de user, ocultar card de admin
    document.getElementById('card-admin').style.display = 'none';
    document.getElementById('card-user').style.display = 'block';
    document.getElementById('badge-region').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${regionUsuario}`;

    let server = await server_auditoria({
        accion: 0,
        anio: fecha,
        region: region
    });

    datos_auditoria = server.resultado;

    //* Crear tabla y guardar como tabla_aud principal
    tabla_aud = crear_tabla_auditoria('user', datos_auditoria, fecha, false);
}

//* Construir tabs dinámicamente
function construirTabs(regiones, datos) {
    const navTabs = document.getElementById('custom-tabs');
    const tabContent = document.getElementById('custom-tabs-content');

    //* Limpiar tabs existentes
    navTabs.innerHTML = '';
    tabContent.innerHTML = '';

    //* Calcular pendientes totales
    const totalPendientes = datos.filter(d => d.estado !== 'Realizado').length;

    //* Tab "Todas las Regiones"
    const tabTodas = `
        <li class="nav-item">
            <a class="nav-link active" id="tab-todas" data-toggle="pill" href="#todas" role="tab">
                <i class="fas fa-globe"></i> Todas
                <span class="badge badge-primary ml-1">${datos.length}</span>
                ${totalPendientes > 0 ? `<span class="badge badge-danger ml-1">${totalPendientes}</span>` : ''}
            </a>
        </li>
    `;

    const contentTodas = `
        <div class="tab-pane fade show active" id="todas" role="tabpanel">
            <div class="input-group mb-3">
                <input type="text" class="form-control" id="buscador-tabla-todas" placeholder="Buscar por equipo, año, fecha, estado...">
                <div class="input-group-append">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                </div>
            </div>
            <div id="tbl-todas" style="overflow-x: auto; width: 100%;"></div>
        </div>
    `;

    navTabs.insertAdjacentHTML('beforeend', tabTodas);
    tabContent.insertAdjacentHTML('beforeend', contentTodas);

    //* Crear tabs para cada región
    regiones.forEach((region, index) => {
        const datosFiltrados = datos.filter(d => (d.zona) === region);
        const count = datosFiltrados.length;
        const pendientes = datosFiltrados.filter(d => d.estado !== 'Realizado').length;
        const color = coloresRegion[index % coloresRegion.length];
        const regionId = region.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const tab = `
            <li class="nav-item">
                <a class="nav-link" id="tab-${regionId}" data-toggle="pill" href="#${regionId}" role="tab" data-region="${region}">
                    <i class="fas fa-map-marker-alt"></i> ${region}
                    <span class="badge badge-${color} ml-1">${count}</span>
                    ${pendientes > 0 ? `<span class="badge badge-danger ml-1">${pendientes}</span>` : ''}
                </a>
            </li>
        `;

        const content = `
            <div class="tab-pane fade" id="${regionId}" role="tabpanel">
                <div class="input-group mb-3">
                    <input type="text" class="form-control" id="buscador-tabla-${regionId}" placeholder="Buscar por equipo, año, fecha, estado...">
                    <div class="input-group-append">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                    </div>
                </div>
                <div id="tbl-${regionId}" style="overflow-x: auto; width: 100%;"></div>
            </div>
        `;

        navTabs.insertAdjacentHTML('beforeend', tab);
        tabContent.insertAdjacentHTML('beforeend', content);
    });

    //* Event listeners para tabs (lazy loading)
    $('a[data-toggle="pill"]').off('shown.bs.tab').on('shown.bs.tab', function (e) {
        const tabId = $(e.target).attr('href').substring(1);
        const region = $(e.target).data('region');

        //* Actualizar tabActual
        tabActual = tabId;

        //* Actualizar tabla_aud con la tabla del tab activo
        if (tablas_por_region[tabId]) {
            tabla_aud = tablas_por_region[tabId];
            //* Actualizar datos_auditoria con los datos filtrados del tab actual
            datos_auditoria = tabla_aud.getData();
            auditorias_pendientes = Object.values(datos_auditoria.reduce((objeto, item) => {
                if (item.estado == "Realizado") return objeto
                let anio = item.anio
                let mes = item.fecha.split('-')[1]
                if (!objeto[anio]) {
                    objeto[anio] = { anio: anio, meses: {} };
                }
                objeto[anio].meses[mes] = (objeto[anio].meses[mes] || 0) + 1
                return objeto
            }, {}));
        }

        //* Si la tabla no ha sido creada, crearla
        if (!tablas_por_region[tabId]) {
            let datosFiltrados;
            let mostrarRegion = false;

            if (tabId === 'todas') {
                datosFiltrados = datosGlobales;
                mostrarRegion = true;
            } else {
                datosFiltrados = datosGlobales.filter(d => (d.zona) === region);
            }

            const nuevaTabla = crear_tabla_auditoria(tabId, datosFiltrados, null, mostrarRegion);
            //* Actualizar tabla_aud y datos_auditoria
            tabla_aud = nuevaTabla;
            datos_auditoria = datosFiltrados;
        }
    });
}

//* Función para crear tabla
function crear_tabla_auditoria(tabId, datos, fecha, mostrarRegion = false) {
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
        return `<button type='button' class='btn btn-warning icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Información'><i class='fa-solid fa-circle-info fa-lg'></i></button>`;
    }

    let subirIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.reporte_descargado == 0 ? "disabled" : ""
        return `<button type='button' class='btn btn-info icon' ${disabled} data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Subir reporte firmado' data-widget="control-sidebar" data-slide="true" data-target="#sidebar-rauditoria"><i class='fa-solid fa-upload fa-lg'></i></button>`;
    }

    let archivoIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.correo_enviado == 0 ? "disabled" : ""
        return `<button type='button' class='btn btn-success icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Reporte de auditoría'><i class='fa-solid fa-file-excel fa-lg'></i></button>`;
    }

    let verIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.reporte_subido == 0 ? "disabled" : ""
        return `<button type='button' class='btn btn-lock btn-outline-dark icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Ver pdf'><i class='fa-solid fa-eye'></i></button>`;
    }

    let correoIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return `<button type='button' class='btn btn-lock btn-danger envelope' data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Enviar correo'><i class='fa-solid fa-envelope'></i></button>`;
    }

    let menuEstatus = [
        { label: `<i class="fa-solid fa-circle" style="color: #28a745;"></i> Realizado` },
        { label: `<i class="fa-solid fa-circle" style="color: #0385ffff;"></i> En proceso` },
        { label: `<i class="fa-solid fa-circle" style="color: #ff7300;"></i> Pendiente` },
        { label: `<i class="fa-solid fa-circle fa-beat-fade" style="color: #dc3545;"></i> Vencido` },
    ]

    //* Definir columnas base
    let columnas = [
        {
            title: "Fecha", field: "fecha", width: 115, headerHozAlign: "center", headerSort: false, hozAlign: "center", sorter: "date",
        },
        {
            title: "Tipo",
            field: "tipo", width: 130, headerHozAlign: "center", headerSort: false, hozAlign: "center",
            formatter: function (cell, formatterParams, onRendered) {
                let data = cell.getData();
                return `${data.tipo}<br><small>${data.marca}</small><br><small>${data.modelo}</small>`;
            }
        },
        {
            title: "Número de serie",
            field: "num_serie", headerHozAlign: "center", headerSort: false, hozAlign: "center",
        },
        {
            title: "Usuario",
            field: "usuario", headerHozAlign: "center", headerSort: false, hozAlign: "center",
            formatter: function (cell, formatterParams, onRendered) {
                let data = cell.getData();
                return `${data.usuario}<br><small>${data.cargo}</small>`;
            }
        },
        {
            title: "Ubicación",
            field: "ubicacion", headerHozAlign: "center", headerSort: false, hozAlign: "center",
            headerFilterParams: {
                valuesLookup: true, clearable: true,
            }
        },
        {
            title: "Estatus",
            field: "estado", hozAlign: "center", formatter: "lookup", headerHozAlign: "center", width: 150,
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
            headerSort: false,
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
                    button.disabled = true;
                    const elemento_aud = cell.getRow().getData();
                    mdl_descargar_reporte_auditoria(elemento_aud);
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
            }
        },
        {
            formatter: verIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_subido",
            cellClick: function (e, cell) {
                elemento_aud = cell.getRow().getData();
                consultar_reporte_firmado(elemento_aud);
            }
        },
        {
            formatter: editarIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
            cellClick: function (e, cell) {
                elemento_aud = cell.getRow().getData();
                mdl_auditoria_info(elemento_aud);
            }
        },
    ];

    //* Agregar columna de región si mostrarRegion es true
    if (mostrarRegion && datosGlobales) {
        const regiones = [...new Set(datosGlobales.map(item => item.zona))].filter(Boolean).sort();
        columnas.splice(4, 0, {
            title: "Región",
            field: "zona",
            width: 120,
            headerHozAlign: "center",
            hozAlign: "center",
            headerFilter: "list",
            headerSort: false,
            formatter: function (cell) {
                const zona = cell.getValue();

                let regionNormalizada = zona;
                if (zona && zona.toLowerCase().startsWith('región')) {
                    regionNormalizada = zona.replace(/^región\s*/i, '').trim();
                }

                const index = regiones.indexOf(zona);
                const color = coloresRegion[index % coloresRegion.length];

                return `<span class="badge badge-${color}">
                        <i class="fas fa-map-marker-alt mr-1"></i>${regionNormalizada}
                    </span>`;
            }
        });
    }

    //* Crear tabla
    const tabla = new Tabulator(`#tbl-${tabId}`, {
        locale: "es",
        data: datos,
        layout: "fitColumns",
        maxHeight: window.innerHeight,
        movableColumns: true,
        pagination: true,
        paginationSize: 15,
        paginationSizeSelector: [15, 25, 35, true],
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = tabla.getDataCount();
            const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
        groupBy: function (data) {
            const [año, mes] = data.fecha.split("-");
            const fecha = new Date(`${año}-${mes}-01T00:00:00`);
            const opciones = { year: 'numeric', month: 'long' };
            return `${fecha.toLocaleDateString('es-ES', opciones)}`
        },
        groupHeader: function (value, count, data) {
            const fila = data[0];
            const [año, mes] = fila.fecha.split("-");
            const fecha = new Date(`${año}-${mes}-01T00:00:00`);
            const opciones = { year: 'numeric', month: 'long' };
            const excluir = ['Realizado'];
            const pendientes = data.filter(d => d.estado && !excluir.includes(d.estado)).length;
            return `${fecha.toLocaleDateString('es-ES', opciones)} (${pendientes} auditorías pendientes)`;
        },
        groupStartOpen: false,
        groupToggleElement: "header",
        columns: columnas,
    });

    //* Guardar referencia a la tabla
    tablas_por_region[tabId] = tabla;

    //* Configurar buscador
    let searchInput = document.getElementById(`buscador-tabla-${tabId}`);
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            let query = searchInput.value.toLowerCase();
            tabla.setFilter(function (data) {
                for (var key in data) {
                    if (data[key] && data[key].toString().toLowerCase().includes(query)) {
                        return true;
                    }
                }
                return false;
            });
        });
    }

    //* Calcular auditorías pendientes

    auditorias_pendientes = Object.values(datos.reduce((objeto, item) => {
        if (item.estado == "Realizado") return objeto
        let anio = item.anio
        let mes = item.fecha.split('-')[1]
        if (!objeto[anio]) {
            objeto[anio] = { anio: anio, meses: {} };
        }
        objeto[anio].meses[mes] = (objeto[anio].meses[mes] || 0) + 1
        return objeto
    }, {}));

    return tabla;
}

//*Función para mostrar el modal para descargar programa de auditoría
async function mdl_programar_auditoria() {

    await Promise.all([

        general_select2({
            selectId: 'select-año',
            tabla: 'auditoria',
            campo: 'anio_auditoria',
            placeholder: 'Selecione un año',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
        }),
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
    // Mostrar selector de región sólo para administradores
    if (rol === "admin") {
        // Mostrar contenedor y input-group
        $('#region-container-aud').show();
        $('#region-container-aud .input-group').show();

        // Inicializar select2 para región
        await general_select2({
            selectId: 'select-region-prog-aud',
            tabla: 'supervisor',
            campo: 'region',
            placeholder: 'Seleccione una región',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
        });

        // Habilitar el select
        $('#select-region-prog-aud').prop('disabled', false);
    } else {
        // Ocultar para usuarios normales
        $('#region-container-aud').hide();
        $('#select-region-prog-aud').prop('disabled', true);
    }

    $("#btn-conf-aud").off("click").on("click", function () { programar_auditoria() })

    $('#mdl-prog-aud').modal("show")
}

//*Función para enviar al servidor la información para la generación del programa de auditoría
async function programar_auditoria() {

    const validar = (rol === 'admin')
        ? ['elaboro-aud', 'autorizo-aud', 'select-año', 'select-region-prog-aud']
        : ['elaboro-aud', 'autorizo-aud', 'select-año'];

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = {
        accion: 5,
        anio: $('#select-año').select2('data')[0].text,
        elaboro: $('#elaboro-aud').select2('data')[0].text,
        cg_elaboro: $('#cg-elaboro-aud').select2('data')[0].text,
        autorizo: $('#autorizo-aud').select2('data')[0].text,
        cg_autorizo: $('#cg-autorizo-aud').select2('data')[0].text,

    }

    //* Agregar rol y región según el usuario
    model.rol = rol;
    if (rol === 'admin') {
        const sel = $('#select-region-prog-aud').select2('data');
        model.region = (sel && sel.length) ? sel[0].text : '';
        if (!model.region) {
            mostrar_toast('error', 'Error', 'Selecciona una región.');
            $('#btn-conf-aud').prop('disabled', false);
            return;
        }
    } else {
        model.region = regionUsuario;
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

//*Función para mostrar el sidebar para subir programa de auditoríafirmado
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

//*Función para la generación de la instancia filepond para subir el programa de auditoría
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
                    consulta_reportes_mesuales: 'reporte_pauditoria',
                    withCredentials: false,
                    ondata: (formData) => {
                        formData.append('trama', JSON.stringify({ accion: 2, anio: auditorias_pendientes[0].anio }));
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

//? Funciones para notificación de auditoría (mdl_correo_reporte_auditoria, corre_reporte_auditoria, validar_correo 1 y 2)

//*Función para abrir el modal de envío de correo
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

//*Función para enviar datos al servidor para el envío de correos electrónicos
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

//*Función para validar estructura de un correo
function validar_correo1(correo) {
    const correo_valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return correo_valido.test(correo)
}

//*Función para validar coincidencia de ambos correos
function validar_correo2(texto1, texto2) {
    if (texto1 === texto2) {
        return true
    } else {
        return false
    }
}

//? Funciones para descarga de reporte de auditoria

//*Función para mostrar modal de descarga de reporte de auditoría
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

//*Función para enviar al servidor la petición de descarga del reporte
async function reporte_auditoria(equipo) {
    const validar = ["ubicacion-aud", "aud-area", "saud-encargado", "saud-cargo"];

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = {
        accion: 6,
        elementos: equipo,
        ubicacion: $("#ubicacion-aud").val().trim(),
        area: $("#aud-area").val().trim(),
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

        tabla_aud.updateData([{ id: equipo.id, reporte_descargado: 1, estado: "En proceso" }]);

        // consultar_auditoria();
        mostrar_toast('success', '¡Generación de reporte exitoso!', 'La generación de reporte de auditoria se ha realizado correctamente.');
    } else {
        mostrar_toast('error', '¡Error!', 'No se pudo generar el reporte de auditoria. Inténtelo nuevamente.');
        $('#btn-reporte-aud').prop('disabled', false);
    }
}

//? Funciones para subir reporte de auditoria

FilePond.registerPlugin(FilePondPluginFileValidateType);

let charco2;
let charcoInicializado2;

//*Función para abrir el sidebar para subida de reporte de mantenimiento firmado
async function reporte_auditoria_firmado(elemento_aud) {
    //?Escondiendo el alert
    document.getElementById('alert-aud-reporte').setAttribute('style', 'display: none !important;  background-color:#fceaea; border-color:#f5c6cb; color:#721c24; padding-right: 4rem;');

    //?Escondiendo el visor de pdf
    $('#pdf-aud').hide()

    if (charco2) {
        charco2.destroy();   //? <- Esto destruye la instancia anterior, lo cual es necesario
    }

    let rolUsuario = JSON.parse(sessionStorage.getItem('user')).resultado[3]
    let regionUsuario = JSON.parse(sessionStorage.getItem('user')).resultado[2]
    let region = ''
    switch (tabActual) {
        case 'regin-norte':
            region = 'norte'
            break;
        case 'regin-sur':
            region = 'sur'
            break;
        case 'regin-tampico':
            region = 'tampico'
            break;

        default:
            break;
    }

    if (rolUsuario === 'user') {
        region = regionUsuario
    }

    //? Al destruir la instancia es necesario colocarle de nuevo el name al input, sino, no aceptará el archivo el php
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
                        accion: 4,
                        id_equipo: elemento_aud.id,
                        fecha_aud: elemento_aud.fecha,
                        region: region
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
                            tabla_aud.updateData([{ id: elemento_aud.id, reporte_subido: 1, estado: "Realizado" }]);
                            mostrar_toast("success", "Subido", data.resultado.mensaje);
                            // consultar_auditoria(anio);

                            charco2.removeFiles();
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


    let server = await server_auditoria({ accion: 5, id_equipo: elemento_aud.id, fecha_aud: elemento_aud.fecha, region: region })

    if (server.resultado) {
        document.getElementById('alert-aud-reporte').style.display = 'block'
    }
}

//*Función para eliminar el archivo de la isntancia del filepond
function eliminar_archivo() {
    if (charco2 && charcoInicializado2) {
        charco2.removeFile(charcoInicializado2);
        fileItemCargado = null;
    }
}

//* Cerrando filepond al finalizar la carga del reporte
document.addEventListener('FilePond:removefile', (e) => {
    // $('#pdf-aud').hide()
    $('[data-widget="sidebar-rauditoria"]').ControlSidebar('toggle')
})

//? Funciones para visualizar el reporte firmado

//*Función para mostrar el reporte subido al sistema
async function consultar_reporte_firmado(elemento_aud) {
    let rolUsuario = JSON.parse(sessionStorage.getItem('user')).resultado[3]
    let regionUsuario = JSON.parse(sessionStorage.getItem('user')).resultado[2]
    let region = ''
    switch (tabActual) {
        case 'regin-norte':
            region = 'norte'
            break;
        case 'regin-sur':
            region = 'sur'
            break;
        case 'regin-tampico':
            region = 'tampico'
            break;

        default:
            break;
    }

    if (rolUsuario === 'user') {
        region = regionUsuario
    }
    let model = {
        accion: 6,
        id_equipo: elemento_aud.id,
        fecha_aud: elemento_aud.fecha,
        region: region
    }

    let server = await server_auditoria(model);

    if (server.resultado.documento) {
        let ruta = `${location.origin}${server.resultado.documento}`;

        document.getElementById('pdf-reporte-aud').src = ruta;
        $("#mdl-pdf-aud").modal('show');
    } else if (server.resultado.aviso) {
        mostrar_toast('warning', '¡Aviso!', server.resultado.aviso)
    } else {
        mostrar_toast('error', '¡Error!', "Hubo un error, consulte al equipo de TI")
    }
}

//* Función para consulta de información del activo a auditar
let seleccionado_aud
async function mdl_auditoria_info(elemento_aud) {
    // Busca en el arreglo 'datos_mantenimiento' el registro con el mismo id_equipo

    for (let i = 0; i < datos_auditoria.length; i++) {
        const element = datos_auditoria[i];
        if (element.id === elemento_aud.id && element.anio === elemento_aud.anio) {
            // Guarda el registro completo en una variable global
            seleccionado_aud = element;
            break;
        }
    }
    // Llama a varias funciones para cargar los selects con datos dinámicos
    await Promise.all([
        general_select2({
            selectId: 'aud-rubro',
            tabla: 'cat_rubro',
            campo: 'rubro',
            placeholder: 'Selecione un rubro',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Categoría general del activo. Agrupa dispositivos por su tipo funcional, como computadoras, dispositivos móviles, etc."
        }),

        general_select2({
            selectId: 'aud-tipo',
            tabla: 'cat_tipo',
            campo: 'tipo',
            placeholder: 'Selecione un tipo',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'aud-marca',
            tabla: 'cat_marca',
            campo: 'marca',
            placeholder: 'Seleccione una marca',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Es la marca del activo."
        }),

        general_select2({
            selectId: 'aud-ubicacion',
            tabla: 'inventario_ti_sur',
            campo: 'ubicacion',
            placeholder: 'Selecciona una ubicacion',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Indica el lugar específico dentro de la zona donde se encuentra físicamente el dispositivo."
        }),

        general_select2({
            selectId: 'aud-usuario',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'NA',
            dropdownParent: '#mdl-mant-info',
        }),

        general_select2({
            selectId: 'aud-cargo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'NA',
            dropdownParent: '#mdl-mant-info',
            sincronizarCampo: 'cargo',
            sincronizarCon: 'select-usuario'
        }),
    ])

    rellenar_select(seleccionado_aud.usuario, "aud-usuario");
    rellenar_select(seleccionado_aud.cargo, 'aud-cargo')
    rellenar_select(seleccionado_aud.tipo, "aud-tipo");
    rellenar_select(seleccionado_aud.marca, "aud-marca");
    rellenar_select(seleccionado_aud.ubicacion, "aud-ubicacion");
    rellenar_select(seleccionado_aud.rubro, "aud-rubro")
    $('#aud-modelo').val(seleccionado_aud.modelo)
    $('#aud-num-serie').val(seleccionado_aud.num_serie)
    $('#aud-fecha').val(seleccionado_aud.fecha)
    $('#aud-estatus').val(seleccionado_aud.estado)

    switch (seleccionado_aud.estado) {
        case "Pendiente":
            $('#estatus-icon-aud').css('color', '#ff7300')
            break;
        case "En proceso":
            $('#estatus-icon-aud').css('color', '#0385ffff')
            break;
        case "Realizado":
            $('#estatus-icon-aud').css('color', '#28a745')
            break;
        case "Vencido":
            $('#estatus-icon-aud').css('color', '#dc3545')
            break;
        default:
            $('#estatus-icon-aud').css('color', '')
            break;
    }

    $('#mdl-aud-info').modal("show")

}

//* Funciones para la descargar mensual de reportes
async function mdl_reportes_mensuales() {
    let rolUsuario = JSON.parse(sessionStorage.getItem('user')).resultado[3]
    if (rolUsuario === 'admin') {
        if (tabActual === 'todas') {
            console.log(tabActual)
            mostrar_toast('warning', 'Advertencia', 'Porfavor escoja la vista de una región')
            return
        }
    }

    let region = ''
    switch (tabActual) {
        case 'regin-norte':
            region = 'región norte'
            break;
        case 'regin-sur':
            region = 'región sur'
            break;
        case 'regin-tampico':
            region = 'región tampico'
            break;

        default:
            break;
    }
    const cont = document.getElementById("contenedor-mes");
    cont.innerHTML = "";

    if (datos_auditoria.length == 0 ) {
        mostrar_toast('warning', 'Advertencia', `Porfavor escoja un año con auditorías programadas`)
        return
    }
    let año = auditorias_pendientes[0].anio
    $('#descargar-text-aud').text(`Descargar reportes mensuales ${region} del año ${año}`)


    consulta_reportes_mensuales()
    $('#mdl-raud-mens').modal('show');
}

//*Habilitando el popover
$(document).ready(function () {
    $('[data-toggle="popover"]').popover();
})

//? Funciones para descargar reportes de auditoría por mes

//*Función para validar los meses completados y mostrar el modal 
function consulta_reportes_mensuales() {
    let meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let meses_auditados = Object.keys(auditorias_pendientes[0].meses);

    let meses_completados = meses.filter(e => !meses_auditados.includes(e)).map(Number);

    carga_meses(meses_completados);
}

const nombre_meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

//*Generando los botones de descarga de cada mes en el modal
function carga_meses(meses = []) {
    const contenedor = document.getElementById("contenedor-mes");
    contenedor.innerHTML = "";

    nombre_meses.forEach((mes, i) => {
        const num_mes = i + 1;
        let disp = meses.includes(num_mes);

        const card = document.createElement("div");
        card.className = "card-mes " + (disp ? "disponible" : "no-disponible");

        card.innerHTML = `
            <div class="nombre-mes">${mes}</div>
            <div class="estatus-mes">${disp ? "Disponible" : "No disponible"}</div>
        `;

        if (disp) {
            let numero_mes = num_mes.toString().padStart(2, '0');
            card.onclick = () => unir_reportes_mes(numero_mes);
        }

        contenedor.appendChild(card);
    });
}

//*Función para pedir al servidor los reportes unidos de un mes
async function unir_reportes_mes(mes) {
    let rolUsuario = JSON.parse(sessionStorage.getItem('user')).resultado[3]
    let regionUsuario = JSON.parse(sessionStorage.getItem('user')).resultado[2]

    let region = ''
    switch (tabActual) {
        case 'regin-norte':
            region = 'norte'
            break;
        case 'regin-sur':
            region = 'sur'
            break;
        case 'regin-tampico':
            region = 'tampico'
            break;

        default:
            break;
    }

    if (rolUsuario === 'user') {
        region = regionUsuario
    }
    auditoria_loading = true;

    alert_cargando('Uniendo reportes, esto tomará un tiempo, por favor espere...');

    let server = await server_auditoria({ accion: 7, anio: auditorias_pendientes[0].anio, mes: mes, region: region });

    if (server.resultado.mensaje) {
        mostrar_toast('success', '¡Éxito!', server.resultado.mensaje);

        let ruta = `${location.origin}${server.resultado.ruta}`;
        window.open(ruta, '_blank');

    } else if (server.resultado.error) {
        mostrar_toast('error', '¡Error!', server.resultado.error);
    } else {
        mostrar_toast('error', '¡Error!', 'Hubo un problema');
    }
}