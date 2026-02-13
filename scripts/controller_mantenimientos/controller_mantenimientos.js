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

//* Limpiar el input del buscador si cambia el año de la tabla
$('#select-anio-mantenimiento').on('change', () => {
    // Limpiar cualquier input de búsqueda de tablas de mantenimientos
    $("[id^='buscador-tabla-']").each(function() { $(this).val(''); });
})

let datos_mantenimiento = []
let elemento_mnt
let table
let mantenimientosPendientes

let tablas_mant_region = {};
let datos_globales = [];
let tab_actual = 'todas';

const usuDatos = JSON.parse(sessionStorage.getItem('user'));
const rolUsuario = usuDatos.resultado[3];
const regionUsu = usuDatos.resultado[2];

const colores_region = [
    'primary', 'success', 'warning', 'danger', 'info',
    'purple', 'indigo', 'teal', 'orange', 'pink'
];


async function consultar_mantenimiento(anio) {
    const fecha = anio.value;
    if (!fecha) return;

    tablas_mant_region = {}; // Reiniciar tablas por región

    if (rolUsuario === 'admin') {
        await mantDatosAdmin(fecha, regionUsu);
    } else {
        await mantDatosUser(fecha, regionUsu);
    }
}

async function mantDatosAdmin(fecha, region) {
    document.getElementById('card-mant-admin').style.display = 'block';
    document.getElementById('card-mant-user').style.display = 'none';

    let server = await server_mantenimiento({ accion: 0, anio: fecha, region: '' });

    datos_mantenimiento = server.resultado;
    datos_globales = server.resultado;

    const regiones = [...new Set(datos_mantenimiento.map(m => m.zona))].filter(Boolean).sort();

    Tabs(regiones, datos_mantenimiento);

    table = crear_tabla_mantenimiento('todas', datos_mantenimiento, fecha, true);
    tab_actual = 'todas';
}

async function mantDatosUser(fecha, region) {
    // Mostrar card de user, ocultar card de admin
    document.getElementById('card-mant-admin').style.display = 'none';
    document.getElementById('card-mant-user').style.display = 'block';
    document.getElementById('badge-region-mant').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${regionUsu}`;

    let server = await server_mantenimiento({
        accion: 0,
        anio: fecha,
        region: region
    });

    datos_mantenimiento = server.resultado;

    // Crear tabla y guardar como tabla_aud principal
    // En el HTML el contenedor para usuarios se llama "tbl-user-mant", por eso usamos 'user-mant' como tabId
    table = crear_tabla_mantenimiento('user-mant', datos_mantenimiento, fecha, false);
    tab_actual = 'user-mant';
}

function Tabs(regiones, datos) {
    const navTabs = document.getElementById('custom-tabs-mant');
    const tabContent = document.getElementById('custom-tabs-content-mant');

    // Limpiar tabs existentes
    navTabs.innerHTML = '';
    tabContent.innerHTML = '';

    // Calcular pendientes totales
    const totalPendientes = datos.filter(d => d.estado !== 'Realizado').length;

    // Tab "Todas las Regiones"
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

    // Crear tabs para cada región
    regiones.forEach((region, index) => {
        const datosFiltrados = datos.filter(d => (d.zona) === region);
        const count = datosFiltrados.length;
        const pendientes = datosFiltrados.filter(d => d.estado !== 'Realizado').length;
        const color = colores_region[index % colores_region.length];
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

    // Event listeners para tabs (lazy loading)
    $('a[data-toggle="pill"]').off('shown.bs.tab').on('shown.bs.tab', function (e) {
        const tabId = $(e.target).attr('href').substring(1);
        const region = $(e.target).data('region');

        // Actualizar tabActual
        tab_actual = tabId;

        // Actualizar tabla_aud con la tabla del tab activo
        if (tablas_mant_region[tabId]) {
            table = tablas_mant_region[tabId];
            // Actualizar datos_auditoria con los datos filtrados del tab actual
            datos_mantenimiento = table.getData();
        }

        // Si la tabla no ha sido creada, crearla
        if (!tablas_mant_region[tabId]) {
            let datosFiltrados;
            let mostrarRegion = false;

            if (tabId === 'todas') {
                datosFiltrados = datos_globales;
                mostrarRegion = true;
            } else {
                datosFiltrados = datos_globales.filter(d => (d.zona) === region);
            }

            const nuevaTabla = crear_tabla_mantenimiento(tabId, datosFiltrados, null, mostrarRegion);
            // Actualizar table y datos_mantenimiento
            table = nuevaTabla;
            datos_mantenimiento = datosFiltrados;
        }
    });
}

function crear_tabla_mantenimiento(tabId, datos, fecha, mostrarRegion = false) {
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
        return `<button type='button' class='btn btn-warning icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Información'><i class='fa-solid fa-circle-info fa-lg'></i></button>`;
    }

    let uploadIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.reporte_descargado == 0 ? "disabled" : ""
        return `<button type='button' class='btn btn-info icon' ${disabled} data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Subir reporte firmado' data-widget="control-sidebar" data-slide="true" data-target="#control-sidebar"><i class='fa-solid fa-upload fa-lg'></i></button>`;
    }

    let fileIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.correo_enviado == 0 ? "disabled" : ""
        return `<button type='button' class='btn btn-success icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Reporte de mantenimiento'><i class='fa-solid fa-file-excel fa-lg'></i></button>`;
    }

    let eyeIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.reporte_subido == 0 ? "disabled" : ""
        return `<button type='button' class='btn btn-lock btn-outline-dark icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Ver pdf'><i class='fa-solid fa-eye'></i></button>`;
    }

    let mailIcon = function (cell, formatterParams, onRendered) {
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

    // Definir columnas base
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
                    button.disabled = true;
                    const elemento_mnt = cell.getRow().getData();
                    mdl_reporte_mantenimiento(elemento_mnt);
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
                abrir_subir_reporte(elemento_mnt)
            }
        },
        {
            formatter: eyeIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_subido",
            cellClick: function (e, cell) {
                elemento_mnt = cell.getRow().getData();
                ver_pdf_reporte(elemento_mnt);
            }
        },
        {
            formatter: editIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
            cellClick: function (e, cell) {
                elemento_mnt = cell.getRow().getData();
                mdl_mantenimiento_info(elemento_mnt);
            }
        },
    ];

    // Agregar columna de región si mostrarRegion es true
    if (mostrarRegion && datos_globales) {
        const regiones = [...new Set(datos_globales.map(item => item.region || item.zona))].filter(Boolean).sort();
        columnas.splice(4, 0, {
            title: "Región",
            field: "region",
            width: 120,
            headerHozAlign: "center",
            hozAlign: "center",
            headerSort: false,
            formatter: function (cell) {
                const region = cell.getValue() || cell.getData().zona;
                const index = regiones.indexOf(region);
                const color = colores_region[index % colores_region.length];

                return `<span class="badge badge-${color}">
                            <i class="fas fa-map-marker-alt mr-1"></i>${region}
                        </span>`;
            }
        });
    }

    // Crear tabla
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
            return `${fecha.toLocaleDateString('es-ES', opciones)} (${pendientes} mantenimientos pendientes)`;
        },
        groupStartOpen: false,
        groupToggleElement: "header",
        columns: columnas,
    });

    // Guardar referencia a la tabla
    tablas_mant_region[tabId] = tabla;

    // Configurar buscador
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

    // Calcular mantenimientos pendientes
    // if (tabId === 'todas' || tabId === 'user') {
        
    // }
    mantenimientosPendientes = Object.values(datos.reduce((objeto, item) => {
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

// async function consultar_informacion(anio) {

//     const fecha = anio.value

//     const usuDatos = JSON.parse(sessionStorage.getItem('user'));
//     const region = usuDatos.resultado[2];
//     //load()
//     let server = await server_mantenimiento({ accion: 0, anio: fecha, region: region });

//     //* Mostrar mensaje
//     /* if (!fecha) {
//         table = new Tabulator('#tbl01', {
//             locale: "es",
//             layout: "fitColumns",
//             data: [{ mensaje: "Seleccione un año para ver la información de mantenimiento." }],
//             columns: [
//                 { title: "Mensaje", field: "mensaje", hozAlign: "center" }
//             ]
//         });
//         return;
//     } */

//     if (!fecha) return;

//     datos_mantenimiento = server.resultado
//     Tabulator.extendModule("localize", "langs", {
//         "es": {
//             "pagination": {
//                 "first": '<i class="fa-solid fa-angles-right fa-flip-horizontal"></i>',
//                 "first_title": "Primera página",
//                 "last": '<i class="fa-solid fa-angles-right"></i>',
//                 "last_title": "Última página",
//                 "prev": '<i class="fa-solid fa-angle-right fa-flip-horizontal"></i>',
//                 "prev_title": "Página anterior",
//                 "next": '<i class="fa-solid fa-angle-right"></i>',
//                 "next_title": "Página siguiente",
//                 "page_size": "Tamaño",

//             },
//             "headerFilters": {
//                 "default": "Filtrar columna...",
//                 "columns": {}
//             },
//             "groups": {
//                 "item": "ítem",
//                 "items": "ítems"
//             },
//         }
//     });

//     let editIcon = function (cell, formatterParams, onRendered) {
//         onRendered(function () {
//             $(cell.getElement()).find('[data-toggle="popover"]').popover()
//         })
//         return `<button type='button' class='btn btn-warning icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Información' onclick=''><i class='fa-solid fa-circle-info fa-lg'></i></button>`;
//     }

//     let uploadIcon = function (cell, formatterParams, onRendered) {
//         onRendered(function () {
//             $(cell.getElement()).find('[data-toggle="popover"]').popover()
//         })
//         const data = cell.getRow().getData()
//         const disabled = data.reporte_descargado == 0 ? "disabled" : ""

//         return `<button type='button' class='btn btn-info icon' ${disabled} data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Subir reporte firmado' data-widget="control-sidebar" data-slide="true" data-target="#control-sidebar"><i class='fa-solid fa-upload fa-lg'></i></button>`;
//     }

//     let fileIcon = function (cell, formatterParams, onRendered) { //plain text value
//         onRendered(function () {
//             $(cell.getElement()).find('[data-toggle="popover"]').popover()
//         })
//         const data = cell.getRow().getData()
//         const disabled = data.correo_enviado == 0 ? "disabled" : ""

//         return `<button type='button' class='btn btn-success icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Reporte de mantenimiento' onclick=''><i class='fa-solid fa-file-excel fa-lg'></i></button>`;
//     }

//     let eyeIcon = function (cell, formatterParams, onRendered) { //plain text value
//         onRendered(function () {
//             $(cell.getElement()).find('[data-toggle="popover"]').popover()
//         })
//         const data = cell.getRow().getData()
//         const disabled = data.reporte_subido == 0 ? "disabled" : ""

//         return `<button type='button' class='btn btn-lock btn-outline-dark icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Ver pdf'><i class='fa-solid fa-eye '></i></button>`;
//     }

//     let mailIcon = function (cell, formatterParams, onRendered) { //plain text value
//         onRendered(function () {
//             $(cell.getElement()).find('[data-toggle="popover"]').popover()
//         })
//         /* const data = cell.getRow().getData()
//         const disabled = data.correo_enviado == 1 ? "disabled" : "" */
//         return `<button type='button' class='btn btn-lock btn-danger envelope'  data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Enviar correo'><i class='fa-solid fa-envelope '></i></button>`;
//     }

//     let menuEstatus = [
//         {
//             label: `<i class="fa-solid fa-circle" style="color: #28a745;"></i> Realizado`
//         },
//         { label: `<i class="fa-solid fa-circle" style="color: #0385ffff;"></i> En proceso` },
//         {
//             label: `<i class="fa-solid fa-circle" style="color: #ff7300;"></i> Pendiente`
//         },
//         {
//             label: `<i class="fa-solid fa-circle fa-beat-fade" style="color: #dc3545;"></i> Vencido`
//         },
//     ]

//     table = new Tabulator('#tbl01', {
//         locale: "es",
//         data: datos_mantenimiento,
//         layout: "fitColumns",              //fit columns to width of table
//         //height: window.innerHeight ,
//         maxHeight: window.innerHeight,
//         movableColumns: true,              //allow column order to be changed
//         pagination: true,
//         paginationSize: 15,
//         paginationSizeSelector: [15, 25, 35, true],
//         paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
//             const totalRows = table.getDataCount(); // Asegúrate que 'table' esté accesible
//             const end = Math.min(currentRowStart + pageSize - 1, totalRows);
//             return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
//         },
//         //paginationButtonCount: 3,
//         groupBy: function (data) {
//             // Asegura que tenga formato YYYY-MM
//             const [año, mes] = data.fecha.split("-");
//             // Creamos una fecha con día explícito
//             const fecha = new Date(`${año}-${mes}-01T00:00:00`);
//             const opciones = { year: 'numeric', month: 'long' };

//             //let excluir = ['Realizado']
//             //const datos = table.getData().filter(d=> d.estado && !excluir.includes(d.estado)).length


//             return `${fecha.toLocaleDateString('es-ES', opciones)}`
//         },
//         groupHeader: function (value, count, data) {
//             const fila = data[0];  // Primera fila del grupo

//             const [año, mes] = fila.fecha.split("-");
//             const fecha = new Date(`${año}-${mes}-01T00:00:00`);
//             const opciones = { year: 'numeric', month: 'long' };

//             // Excluir estatus
//             const excluir = ['Realizado'];

//             // Contar pendiente SOLO dentro del grupo actual
//             const pendientes = data.filter(d =>
//                 d.estado &&
//                 !excluir.includes(d.estado)
//             ).length;

//             return `${fecha.toLocaleDateString('es-ES', opciones)} (${pendientes} mantenimientos pendientes)`;

//         },
//         groupStartOpen: false,
//         groupToggleElement: "header", //* Permite que dando click en cualquier parte del header group, éste se despliegue
//         //headerVisible: false,
//         /*         dataGrouped: function (groups) {
//                     restaurarEstadoDeGrupos();
//                 },
//                 renderComplete: function () {
//                     restaurarEstadoDeGrupos()
//                 }, */
//         columns: [
//             {
//                 title: "Fecha", field: "fecha", width: 115, headerHozAlign: "center", headerSort: false, hozAlign: "center", /* headerFilter: "input", */ sorter: "date",
//             },
//             {
//                 title: "Tipo",
//                 field: "tipo", width: 130, headerHozAlign: "center", headerSort: false, hozAlign: "center", /* headerFilter: "input", */
//                 formatter: function (cell, formatterParams, onRendered) {
//                     let data = cell.getData();
//                     return `${data.tipo}<br><small>${data.marca}<br><small>${data.modelo}`;
//                 }
//             },
//             {
//                 title: "Número de serie",
//                 field: "num_serie", headerHozAlign: "center", headerSort: false, hozAlign: "center", /* headerFilter: "input" */

//             },
//             {
//                 title: "Usuario",
//                 field: "usuario", headerHozAlign: "center", headerSort: false, hozAlign: "center", /* headerFilter: "input", */
//                 formatter: function (cell, formatterParams, onRendered) {
//                     let data = cell.getData(); // Obtiene toda la fila
//                     return `${data.usuario}<br><small>${data.cargo}</small>`;
//                 }

//             },
//             {
//                 title: "Ubicación",
//                 field: "ubicacion", headerHozAlign: "center", headerSort: false, hozAlign: "center", /* headerFilter: "list", */
//                 headerFilterParams: {
//                     valuesLookup: true, clearable: true,
//                 }

//             },
//             {
//                 title: "Estatus",
//                 field: "estado", hozAlign: "center", formatter: "lookup", headerSort: false, headerHozAlign: "center", formatter: "lookup", width: 150,
//                 headerFilterParams: {
//                     valuesLookup: true, clearable: true,
//                 },
//                 headerMenu: menuEstatus,
//                 headerMenuIcon: '<i class="fa-solid fa-circle-question"></i>',
//                 formatterParams: {
//                     "Pendiente": `<i class="fa-solid fa-circle" style="color: #ff7300;"></i> Pendiente`,
//                     "En proceso": `<i class="fa-solid fa-circle" style="color: #0385ffff;"></i> En proceso`,
//                     "Realizado": `<i class="fa-solid fa-circle" style="color: #28a745;"></i> Realizado`,
//                     "Vencido": `<i class="fa-solid fa-circle fa-beat-fade" style="color: #dc3545;"></i> Vencido`,
//                 },
//                 /* headerFilter: "list",
//                 headerFilterParams: {
//                     valuesLookup: true, clearable: true,
//                 }, headerSort: false, */

//             },
//             {
//                 formatter: mailIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "correo_enviado",
//                 cellClick: function (e, cell) {
//                     elemento_mnt = cell.getRow().getData();
//                     mdl_correo_reporte_mantenimiento(elemento_mnt)
//                 },
//             },
//             {
//                 formatter: fileIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "correo_enviado",
//                 cellClick: function (e, cell) {
//                     const button = cell.getElement().querySelector('button');
//                     if (button && !button.disabled) {
//                         // Deshabilita el botón
//                         button.disabled = true;

//                         // Acción que quieres ejecutar al hacer clic
//                         const elemento_mnt = cell.getRow().getData();
//                         mdl_reporte_mantenimiento(elemento_mnt);

//                         // Rehabilita el botón después de 3 segundos
//                         setTimeout(() => {
//                             button.disabled = false;
//                         }, 3000);
//                     }
//                 }
//             },
//             {
//                 formatter: uploadIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_descargado",
//                 cellClick: function (e, cell) {
//                     elemento_mnt = cell.getRow().getData();
//                     abrir_subir_reporte(elemento_mnt);
//                 }
//             },

//             {
//                 formatter: eyeIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_subido",
//                 cellClick: function (e, cell) {
//                     elemento_mnt = cell.getRow().getData();
//                     ver_pdf_reporte(elemento_mnt);
//                 }
//             },
//             {
//                 formatter: editIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
//                 cellClick: function (e, cell) {
//                     elemento_mnt = cell.getRow().getData();
//                     mdl_mantenimiento_info(elemento_mnt);
//                 }
//             },
//         ],
//     })
//     mantenimientosPendientes = Object.values(datos_mantenimiento.reduce((objeto, item) => {

//         if (item.estado == "Realizado") return objeto

//         let anio = item.anio
//         let mes = item.fecha.split('-')[1]

//         // Si aún no existe el año, inicializamos su propiedad meses
//         if (!objeto[anio]) {
//             objeto[anio] = { anio: anio, meses: {} };
//         }

//         //si ya existe este mes, incrementa su valor, sino lo inicia en 0 y suma 1
//         objeto[anio].meses[mes] = (objeto[anio].meses[mes] || 0) + 1

//         return objeto
//     }, {}))

//     let searchInput = document.getElementById("buscador-tabla-mantenimiento")

//     searchInput.addEventListener("keyup", function () {
//         let query = searchInput.value.toLowerCase();

//         // Función de filtro personalizada
//         table.setFilter(function (data) {
//             // Recorre todas las propiedades de la fila
//             for (var key in data) {
//                 if (data[key] && data[key].toString().toLowerCase().includes(query)) {
//                     return true; // Coincidencia encontrada
//                 }
//             }
//             return false; // No hay coincidencia
//         });
//     });
// }

async function mdl_programar_mantenimiento() {

    await Promise.all([
        // Si es admin, cargamos la lista de regiones
        (async function(){
            if (rolUsuario === 'admin') {
                await general_select2({
                    selectId: 'select-region-prog',
                    tabla: 'cat_usuarios',
                    campo: 'region',
                    placeholder: 'Seleccione una región',
                    dropdownParent: '#mdl-prog-mant',
                    tags: false,
                });
                $('#region-container').show();
            } else {
                // ocultar el contenedor para usuarios normales
                $('#region-container').hide();
            }
        })(),
        general_select2({
            selectId: 'select-año',
            tabla: 'mantenimiento',
            campo: 'anio_mantenimiento',
            placeholder: 'Selecione un año',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
        }),
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

    // Inicializar botón que simula checkbox para descargar auditoría
    // Soporta tanto el nuevo `#check-editar`/`#check-editar-icon` como el antiguo `#btn-download-aud`
    const audIcon = $('#check-editar-icon').length ? $('#check-editar-icon') : $('#btn-download-aud-icon');
    const audBtn = $('#check-editar').length ? $('#check-editar') : $('#btn-download-aud');
    if (audIcon.length) {
        audIcon.removeClass('fa-solid fa-square-check').addClass('fa-regular fa-square');
    }
    audBtn.off('click').on('click', function () {
        if (!audIcon.length) return;
        const msg = $('#download-aud-message');
        if (audIcon.hasClass('fa-solid')) {
            // desmarcar
            audIcon.removeClass('fa-solid fa-square-check').addClass('fa-regular fa-square');
            // ocultar texto explicativo
            if (msg.length) msg.hide();
            // mantener el botón confirmar habilitado
            $('#mdl-btn-conf').prop('disabled', false);
        } else {
            // marcar
            audIcon.removeClass('fa-regular fa-square').addClass('fa-solid fa-square-check');
            // mostrar texto explicativo
            if (msg.length) msg.show();
            $('#mdl-btn-conf').prop('disabled', false);
        }
    });

    // Si es admin, mostrar el contenedor de región; si es user, ocultarlo (por si quedó visible)
    if (rolUsuario === 'admin') {
        $('#region-container').show();
    } else {
        $('#region-container').hide();
    }

    $('#mdl-prog-mant').modal("show")
}

async function programar_mantenimiento() {

    const validar = (rolUsuario === 'admin')
        ? ['select-elaboro', 'select-autorizo', 'select-año', 'select-region-prog']
        : ['select-elaboro', 'select-autorizo', 'select-año']

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = {
        accion: 3,
        anio: $('#select-año').select2('data')[0].text,
        elaboro: $('#select-elaboro').select2('data')[0].text,
        cg_elaboro: $('#select-cg-elaboro').select2('data')[0].text,
        autorizo: $('#select-autorizo').select2('data')[0].text,
        cg_autorizo: $('#select-cg-autorizo').select2('data')[0].text,

    }
    // Leer si el usuario desea también descargar el programa de auditoría desde el modal
    let downloadBoth = false;

    const audIconEl = document.getElementById('check-editar-icon') || document.getElementById('btn-download-aud-icon');
    if (audIconEl) {
        // si tiene la clase de 'checked' (fa-solid fa-square-check) consideramos marcado
        downloadBoth = audIconEl.classList.contains('fa-solid') && audIconEl.classList.contains('fa-square-check');
    }

    const mensajeInicial = downloadBoth
        ? 'Programando mantenimiento y auditoría...'
        : 'Programando mantenimiento...';

    mostrar_toast_cargando(mensajeInicial);
    $('#mdl-btn-conf').prop('disabled', true);

    // Enviar al servidor si se desean ambos archivos; el PHP será responsable
    // de generar uno o ambos y devolver las URLs correspondientes.
    model.descargar_ambos = downloadBoth ? 1 : 0;

    // Añadir rol y región para que el backend aplique restricciones
    model.rol = rolUsuario;
    if (rolUsuario === 'admin') {
        const sel = $('#select-region-prog').select2('data')[0];
        model.region = sel ? sel.text : ($('#select-region-prog').val() || '');
    } else {
        model.region = regionUsu;
    }

    let server = await server_excel(model);

    if (server && server.resultado && server.resultado.result === true) {
        // El servidor puede devolver:
        // - resultado.urls (array de strings)
        // - resultado.url (string)
        if (Array.isArray(server.resultado.urls)) {
            server.resultado.urls.forEach(url => {
                const link = document.createElement('iframe');
                link.style.display = 'none';
                link.src = url;
                document.body.appendChild(link);
            });
        } else if (server.resultado.url) {
            window.location = server.resultado.url;
        }

        mostrar_toast('success', '¡Programa generado!', 'Los archivos se han generado correctamente.');
        $('#mdl-prog-mant').modal("hide");
        load();

    } else if (server && server.resultado && server.resultado.result === false) {
        mostrar_toast('error', 'Error', server.resultado.error);
        $('#mdl-prog-mant').modal("hide");
        $('#mdl-btn-conf').prop('disabled', false);
    } else {
        mostrar_toast('error', 'Error', 'No se pudo generar el programa. Inténtalo nuevamente.');
        $('#mdl-btn-conf').prop('disabled', false);
    }
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

        table.updateData([{ id: elemento_mnt.id, reporte_descargado: 1, estado: "En proceso" }])

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
async function abrir_subir_reporte(elemento_mnt) {
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
    let fecha = elemento_mnt.fecha.split('-')
    let anio = {}
    anio.value = fecha[0]
    // console.log(anio);
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
                        id_equipo: elemento_mnt.id,
                        fecha_mnto: elemento_mnt.fecha
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
                            table.updateData([{ id: elemento_mnt.id, reporte_subido: 1, estado: "Realizado" }])
                            mostrar_toast("success", "Subido", data.resultado.mensaje)
                            consultar_mantenimiento(anio)
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

    let server = await server_mantenimiento({ accion: 2, id_equipo: elemento_mnt.id, fecha_mnto: elemento_mnt.fecha })

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
async function ver_pdf_reporte(elemento_mnt) {
    dominio = window.location.hostname
    puerto = location.port

    let model = {
        accion: 3,
        id_equipo: elemento_mnt.id,
        fecha_mnto: elemento_mnt.fecha
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
                        formData.append('trama', JSON.stringify({ accion: 6, anio: mantenimientosPendientes[0].anio }));
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