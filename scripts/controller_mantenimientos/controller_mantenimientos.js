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
//* Función que se ejecuta al cargar la pagina
async function load() {
    // Inicializa el selector de año
    await general_select2({
        selectId: 'select-anio-mantenimiento',
        tabla: 'mantenimiento',
        campo: 'anio',
        placeholder: 'Seleccione un año',
        dropdownParent: '#card-mantenimientos',
        tags: false,
    })
    // Obtiene el año más reciente o actual desde el servidor
    let server = await server_mantenimiento({ accion: 4 })
    // Si no hay resultado del servidor, termina la función
    if (!server.resultado) {
        return
    } else {
        // Crea un objeto con el año obtenido del servidor
        let fecha = {}
        fecha.value = server.resultado.anio
        // Estable el valor en el selector y dispara el evento 'change'
        // para cargar automáticamente los datos de ese año
        $('#select-anio-mantenimiento').val(fecha.value).trigger('change')
    }
}
//* Evento listener que se ejecuta cuando cambia el año seleccionado
$('#select-anio-mantenimiento').on('change', () => {
    // Limpiar todos los inputs de búsqueda que empeicen con 'buscador-tabla-'
    // Esto incluye el buscador generarl y los de cas tab de región
    $("[id^='buscador-tabla-']").each(function () {
        $(this).val('');    // Limpia el valor del input
    });
})

//* Variables globales
let datos_mantenimiento = [];    // Array que contiene todos los datos de mantenimiento cargados
let elemento_mnt;    // Objeto que almacena el elemento seleccionado actualmente en la tabla
let table;  // Referencia a la tabla Tabulator activa
let mantenimientosPendientes;   // Objeto que contiene los mantenimientos pendientes organizados por año y mes

let tablas_mant_region = {};    // Objeto que almacena todas las tablas creadas por región (para lazy loading)
let datos_globales = [];    // Copia de seguridad de todos los datos para uso en filtros por región
let tab_actual = 'todas';   // String que indica qué tab está actualmente activo ('todas', 'sur', 'norte', etc.)

const usuDatos = JSON.parse(sessionStorage.getItem('user'));    // Obtiene los datos del usuario desde sessionStorage
const rolUsuario = usuDatos.resultado[3];   // Extrae el rol del usuario (admin o user)
const regionUsu = usuDatos.resultado[2];    // Extrae la región a la que pertenece el usuario
// Array de colores para los badges de las regionesa
const colores_region = [
    'primary', 'success', 'warning', 'danger', 'info',
    'purple', 'indigo', 'teal', 'orange', 'pink'
];
//* Función principal, se ejecuta cuando cambia el año en el selector
async function consultar_mantenimiento(anio) {
    const fecha = anio.value;   // Obtiene el valor del año seleccionado
    if (!fecha) return; // Si no hay año sellecionado, termina la ejecuación

    tablas_mant_region = {}; // Reiniciar el objeto de tablas por región

    // Decide qué función ejecutar según el rol del usuario
    if (rolUsuario === 'admin') {
        await mantDatosAdmin(fecha, regionUsu); // Admin ve todas las regiones con tabs
    } else {
        await mantDatosUser(fecha, regionUsu);  // Usuario normal solo ve su región
    }
}
//* Función para cargar dato de administrador
async function mantDatosAdmin(fecha, region) {
    // muestra el card de admin y oculta el card de usuario
    document.getElementById('card-mant-admin').style.display = 'block';
    document.getElementById('card-mant-user').style.display = 'none';
    // Consulta al servidor
    let server = await server_mantenimiento({ accion: 0, anio: fecha, region: '' });

    datos_mantenimiento = server.resultado; // Guarda los resultados en la variable global
    datos_globales = server.resultado;  // Guarda una copia de seguridad de todos los datos

    // Extrae las regiones únicas de los datos, filtra valores vacíos y ordena alfabéticamente
    const regiones = [...new Set(datos_mantenimiento.map(m => m.zona))].filter(Boolean).sort();
    // Contruye los tabs dinámicamente para cada región
    Tabs(regiones, datos_mantenimiento);
    // Crea la tabla principal "Todas" y la guarda como tabla activa
    table = crear_tabla_mantenimiento('todas', datos_mantenimiento, fecha, true);
    tab_actual = 'todas';   // Estable 'todas' como el tab activo
}
//* Función para cargar datos de usuario normal
async function mantDatosUser(fecha, region) {
    // Mostrar card de user, ocultar card de admin
    document.getElementById('card-mant-admin').style.display = 'none';
    document.getElementById('card-mant-user').style.display = 'block';
    // Muestra un badge con la región del usuario en el header
    document.getElementById('badge-region-mant').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${regionUsu}`;
    // Consulta al servidor filtrando por región
    let server = await server_mantenimiento({
        accion: 0,
        anio: fecha,
        region: region
    });

    datos_mantenimiento = server.resultado; // Guarda los resultados filtrados

    // Crear una única tabla con los datos filtrados por región
    // 'user-mant' es el ID del contenedor en el HTML para usuarios
    table = crear_tabla_mantenimiento('user-mant', datos_mantenimiento, fecha, false);
    tab_actual = 'user-mant';   // Establece 'user-mant' como el tab activo
}
//* Función para construir los tabs dinámicamente (solo admin)
function Tabs(regiones, datos) {
    // Obtiene las referencias a los elementos del DOM donde se construirán los tabs
    const navTabs = document.getElementById('custom-tabs-mant');
    const tabContent = document.getElementById('custom-tabs-content-mant');

    // Limpiar tabs existentes
    navTabs.innerHTML = '';
    tabContent.innerHTML = '';

    // Calcular cuantos mantenimientos están pendientes
    const totalPendientes = datos.filter(d => d.estado !== 'Realizado').length;

    // HTML del botón del tab con badges de conteo
    const tabTodas = `
        <li class="nav-item">
            <a class="nav-link active" id="tab-todas" data-toggle="pill" href="#todas" role="tab">
                <i class="fas fa-globe"></i> Todas
                <span class="badge badge-primary ml-1">${datos.length}</span>
                ${totalPendientes > 0 ? `<span class="badge badge-danger ml-1">${totalPendientes}</span>` : ''}
            </a>
        </li>
    `;
    // HTML del contenido del tab con buscador y contenedor de la tabla
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
    //  Inserta el tab "Todas" en el DOM
    navTabs.insertAdjacentHTML('beforeend', tabTodas);
    tabContent.insertAdjacentHTML('beforeend', contentTodas);

    // Crea tabs para cada región
    regiones.forEach((region, index) => {
        const datosFiltrados = datos.filter(d => (d.zona) === region);  // Filtra los datos para obtener solo los de esta región
        const count = datosFiltrados.length;    // Cuenta total de registros en esta región
        const pendientes = datosFiltrados.filter(d => d.estado !== 'Realizado').length; // Cuenta los pendientes de esta región
        const color = colores_region[index % colores_region.length];    // Asigna un color del array de colores (cicla si hay más regiones que colores)
        // Crea un ID único para el tab basado en el nombre de la región
        // Convierte a minúsculas, reemplaza espacios por guines y elimina caracteres especiales
        const regionId = region.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        // HTML del botón del tab de la región
        const tab = `
            <li class="nav-item">
                <a class="nav-link" id="tab-${regionId}" data-toggle="pill" href="#${regionId}" role="tab" data-region="${region}">
                    <i class="fas fa-map-marker-alt"></i> ${region}
                    <span class="badge badge-${color} ml-1">${count}</span>
                    ${pendientes > 0 ? `<span class="badge badge-danger ml-1">${pendientes}</span>` : ''}
                </a>
            </li>
        `;
        // HTML del contenido del tab de la región
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
        // Inserta el tab de la región en el DOM
        navTabs.insertAdjacentHTML('beforeend', tab);
        tabContent.insertAdjacentHTML('beforeend', content);
    });

    // Event listeners para tabs (lazy loading)
    // Primero elimina event listeners anteriores para evitar duplicados
    $('a[data-toggle="pill"]').off('shown.bs.tab').on('shown.bs.tab', function (e) {
        // Obtiene el ID del tab que se acaba de mostrar
        const tabId = $(e.target).attr('href').substring(1);
        // Obtiene el nombre de la región desde el atributo data-region
        const region = $(e.target).data('region');

        // Actualizar la varible global del tab actual
        tab_actual = tabId;

        // si la tabla de este tab ya existe, actualiza las variables globales
        if (tablas_mant_region[tabId]) {
            table = tablas_mant_region[tabId];  // Actualiza referencia a la tabla activa
            datos_mantenimiento = table.getData();  // Actualiza datos con los del tab actual
        }

        // Si la tabla no ha sido creada, se crea
        if (!tablas_mant_region[tabId]) {
            let datosFiltrados;
            let mostrarRegion = false;
            // DEcide qué datos mostrar y si incluir columna de región
            if (tabId === 'todas') {
                datosFiltrados = datos_globales;    // Muestra todos los datos
                mostrarRegion = true;   // Incluye columna de región
            } else {
                // Filtra solo los datos de la región seleccionada
                datosFiltrados = datos_globales.filter(d => (d.zona) === region);
            }
            // Crea la nueva tabla
            const nuevaTabla = crear_tabla_mantenimiento(tabId, datosFiltrados, null, mostrarRegion);
            // Actualizar las varibles globales con la nueva tabla y datos
            table = nuevaTabla;
            datos_mantenimiento = datosFiltrados;
        }
    });
}
//* Función principal para crear las tablas tabulator
function crear_tabla_mantenimiento(tabId, datos, fecha, mostrarRegion = false) {
    // Configuración de idioma español para la tabulator
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
    // Ícono de información/editar
    let editIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {    // Inicializa popover de Bootstrap cuando se renderiza la celda 
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return `<button type='button' class='btn btn-warning icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Información'><i class='fa-solid fa-circle-info fa-lg'></i></button>`;
    }
    // ícono de subir reporte
    let uploadIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()    // Se obtienen los datos de la fila
        const disabled = data.reporte_descargado == 0 ? "disabled" : "" // Deshabilida el botón si no se ha descargado el reporte
        return `<button type='button' class='btn btn-info icon' ${disabled} data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Subir reporte firmado' data-widget="control-sidebar" data-slide="true" data-target="#control-sidebar"><i class='fa-solid fa-upload fa-lg'></i></button>`;
    }
    // Ícono de descargar archivo Excel
    let fileIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.correo_enviado == 0 ? "disabled" : "" // Deshabilita el botón si no se ha enviado un correo
        return `<button type='button' class='btn btn-success icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Reporte de mantenimiento'><i class='fa-solid fa-file-excel fa-lg'></i></button>`;
    }
    // ícono de ver PDF
    let eyeIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        const data = cell.getRow().getData()
        const disabled = data.reporte_subido == 0 ? "disabled" : "" // Deshabilita si no se ha subido el reporte
        return `<button type='button' class='btn btn-lock btn-outline-dark icon' ${disabled} data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Ver pdf'><i class='fa-solid fa-eye'></i></button>`;
    }
    // Ícono de enviar correo
    let mailIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return `<button type='button' class='btn btn-lock btn-danger envelope' data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Enviar correo'><i class='fa-solid fa-envelope'></i></button>`;
    }
    // Menú de leyenda de estatus
    let menuEstatus = [
        { label: `<i class="fa-solid fa-circle" style="color: #28a745;"></i> Realizado` },
        { label: `<i class="fa-solid fa-circle" style="color: #0385ffff;"></i> En proceso` },
        { label: `<i class="fa-solid fa-circle" style="color: #ff7300;"></i> Pendiente` },
        { label: `<i class="fa-solid fa-circle fa-beat-fade" style="color: #dc3545;"></i> Vencido` },
    ]

    // Definición de las columnas base
    let columnas = [
        {
            title: "Fecha", field: "fecha", width: 115, headerHozAlign: "center", headerFilter: "input", headerSort: false, hozAlign: "center", sorter: "date",
        },
        {
            title: "Tipo",
            field: "tipo", width: 130, headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input",
            formatter: function (cell, formatterParams, onRendered) {
                let data = cell.getData();
                return `${data.tipo}<br><small>${data.marca}</small><br><small>${data.modelo}</small>`;
            }
        },
        {
            title: "Número de serie",
            field: "num_serie", headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input",
        },
        {
            title: "Usuario",
            field: "usuario", headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input",
            formatter: function (cell, formatterParams, onRendered) {
                let data = cell.getData();
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
        {   // Columna de botón "Enviar correo"
            formatter: mailIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "correo_enviado",
            cellClick: function (e, cell) {
                elemento_mnt = cell.getRow().getData(); // Guarda los datos de la fila en la variable
                mdl_correo_reporte_mantenimiento(elemento_mnt); // Abre el modal para enviar correo
            },
        },
        {   // Columna de botón "Descargar reporte Excel"
            formatter: fileIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "correo_enviado",
            cellClick: function (e, cell) {
                const button = cell.getElement().querySelector('button');
                // Solo ejecuta si el botón está habilitado
                if (button && !button.disabled) {
                    button.disabled = true; // Se dechabilita temporalmente el botón para evitar mútilples clics
                    const elemento_mnt = cell.getRow().getData();
                    mdl_reporte_mantenimiento(elemento_mnt);
                    setTimeout(() => {  // Re-habilita el botón después de 3 segundos
                        button.disabled = false;
                    }, 3000);
                }
            }
        },
        {   // Columna de botón "Subir reporte firmado"
            formatter: uploadIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_descargado",
            cellClick: function (e, cell) {
                elemento_mnt = cell.getRow().getData();
                abrir_subir_reporte(elemento_mnt)   // Abre el sidebar para subir el reporte
            }
        },
        {   // Columna de botón "Ver PDF"
            formatter: eyeIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false, field: "reporte_subido",
            cellClick: function (e, cell) {
                elemento_mnt = cell.getRow().getData();
                ver_pdf_reporte(elemento_mnt);  // Abre el modal para ver el PDF
            }
        },
        {   // Columna de botón "Información"
            formatter: editIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
            cellClick: function (e, cell) {
                elemento_mnt = cell.getRow().getData();
                mdl_mantenimiento_info(elemento_mnt);   // Abre modal con información del activo
            }
        },
    ];

    // Agregar columna de región si mostrarRegion es true (solo para tab "Todas")
    if (mostrarRegion && datos_globales) {
        // Obtiene todas las regiones únicas de los datos globales
        const regiones = [...new Set(datos_globales.map(item => item.region || item.zona))].filter(Boolean).sort();
        // Inserta la columna de región en la posición 4 (después de Usuario, antes de ubicación)
        columnas.splice(4, 0, {
            title: "Región",
            field: "zona",
            width: 120,
            headerHozAlign: "center",
            hozAlign: "center",
            headerFilter: "list",
            headerSort: false,
            formatter: function (cell) {    // Formatter muestra ub badge de color según la región
                const zona = cell.getValue();   // Obtiene el valor de zona
                // Normaliza el nombre (quira "Región" del inicio)
                let regionNormalizada = zona;
                if (zona && zona.toLowerCase().startsWith('región')) {
                    regionNormalizada = zona.replace(/^región\s*/i, '').trim();
                }

                const index = regiones.indexOf(zona);   // Encuentra el índice de esta región en el array de regiones
                const color = colores_region[index % colores_region.length];    // Asigna un color (cicla si hay más regiones que colores)
                // Retorna un badge HTML con el color y el nombre de la región
                return `<span class="badge badge-${color}">
                        <i class="fas fa-map-marker-alt mr-1"></i>${regionNormalizada}
                    </span>`;
            }
        });
    }

    // Crea la tabla Tabulator
    const tabla = new Tabulator(`#tbl-${tabId}`, {
        locale: "es",   // Idioma español
        data: datos,    // Datos a mostrar
        layout: "fitColumns",   // Ajusta las columna al ancho de la tabla
        maxHeight: window.innerHeight,  // Altura máxima igual a la ventana
        movableColumns: true,   // Permite mover columna arrastrando
        pagination: true,   // Activa la paginación
        paginationSize: 15, // registros por página
        paginationSizeSelector: [15, 25, 35, true], // Opciones de resgitros por página (true = todos)
        // Contador personalizado de paginación
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = tabla.getDataCount(); // total de registros
            const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
        // Agrupación por mes
        groupBy: function (data) {
            const [año, mes] = data.fecha.split("-");   // Divide la fecha en año y mes
            const fecha = new Date(`${año}-${mes}-01T00:00:00`); // Crea un objeto Date con día 1 para evitar problemas de zona hoaria
            const opciones = { year: 'numeric', month: 'long' };
            return `${fecha.toLocaleDateString('es-ES', opciones)}` // Retorna el mes en formato "enero 2024"
        },
        // Header personalizado de los grupos
        groupHeader: function (value, count, data) {
            const fila = data[0];   // Primera fila del grupo
            const [año, mes] = fila.fecha.split("-");
            const fecha = new Date(`${año}-${mes}-01T00:00:00`);
            const opciones = { year: 'numeric', month: 'long' };
            // Cuenta solo los pendientes dentro de este grupo (mes)
            const excluir = ['Realizado'];
            const pendientes = data.filter(d => d.estado && !excluir.includes(d.estado)).length;
            // Retorna el header con el mes y cantidade de pendientes
            return `${fecha.toLocaleDateString('es-ES', opciones)} (${pendientes} mantenimientos pendientes)`;
        },
        groupStartOpen: false, // Los grupos empiezan colapsados
        groupToggleElement: "header", // Permite expandir/colapsar haciendo clic en el header
        columns: columnas, // Array de columnas definidas anteriormente
    });

    // Almacena la tabla en el ibjeto global para poder accederla después (lazy loading)
    tablas_mant_region[tabId] = tabla;

    // Configuración de buscador
    let searchInput = document.getElementById(`buscador-tabla-${tabId}`);
    if (searchInput) {
        // Evento que se ejecuta cada vez que se escribe en el buscador
        searchInput.addEventListener("keyup", function () {
            let query = searchInput.value.toLowerCase();
            // Función de filtro personalizada que busca en todas las propiedades
            tabla.setFilter(function (data) {
                // Recorre todas las propiedades del objeto
                for (var key in data) {
                    // Si alguna propiedad contiene el texto buscado, muestra la fila
                    if (data[key] && data[key].toString().toLowerCase().includes(query)) {
                        return true; // Coincidencia encontrada
                    }
                }
                return false; // No hay coincidencia
            });
        });
    }
    // Calcular mantenimientos pendientes
    // Crea un objeto organizado por año y mes con la cantidad de mantenimientos pendientes
    mantenimientosPendientes = Object.values(datos.reduce((objeto, item) => {
        // Si está realizado, no lo cuenta como pendiente
        if (item.estado == "Realizado") return objeto
        let anio = item.anio
        let mes = item.fecha.split('-')[1]
        // Si el año no existe en el objeto, lo inicializa
        if (!objeto[anio]) {
            objeto[anio] = { anio: anio, meses: {} };
        }
        // Incrementa el contador de ese mes (o lo inicializa en 1)
        objeto[anio].meses[mes] = (objeto[anio].meses[mes] || 0) + 1
        return objeto
    }, {}));

    return tabla;   // Retorna la tabla
}

async function mdl_programar_mantenimiento() {
    // Inicializar todos los selectores de forma paralela para optimizar tiempo de carga
    await Promise.all([
        // Si es admin, cargamos la lista de regiones
        (async function () {
            if (rolUsuario === 'admin') {
                // Cargar selector de regiones solo para administradores
                await general_select2({
                    selectId: 'select-region-prog',
                    tabla: 'supervisor',
                    campo: 'region',
                    placeholder: 'Seleccione una región',
                    dropdownParent: '#mdl-prog-mant',
                    tags: false,
                });
                $('#region-container').show();  // Mostrar contenedor de región
            } else {
                // oculta el contenedor para usuarios normales
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
    // Establecer valores por defecto para los selectores de usuarios
    rellenar_select("Alejandro Cancino Argüello", "select-autorizo");
    rellenar_select("César Ignacio Torres Almeida", "select-elaboro");

    $('#mdl-btn-conf').prop('disabled', false); // Habilitar el botón de confirmación
    $('#select-cg-elaboro, #select-cg-autorizo').prop('disabled', true); // Deshabilitar selectores de cargo (se llenan automáticamente al seleccionar usuario)
    // Vincular el evento click del botón de confirmación con la función de programar
    $("#mdl-btn-conf").off("click").on("click", function () { programar_mantenimiento() });

    // Inicializar el "checkbox" visual para descargar también el programa de mantenimiento
    const audIcon = $('#mdl-prog-mant #check-editar-icon');
    const audBtn = $('#mdl-prog-mant #check-editar');

    if (audIcon.length) {
        // Inicializar el icono como desmarcado (cuadro vacío)
        audIcon.removeClass('fa-solid fa-square-check').addClass('fa-regular fa-square');
    }
    // Configurar el comportamiento de toggle para el "checkbox" de mantenimiento
    // Solo afecta al botón dentro de este modal específico
    audBtn.off('click').on('click', function () {
        if (!audIcon.length) return;
        // Buscar el mensaje también dentro del modal
        const msg = $('#mdl-prog-mant');
        if (audIcon.hasClass('fa-solid')) {
            // Si está marcado, desmarcar
            audIcon.removeClass('fa-solid fa-square-check').addClass('fa-regular fa-square');
            // ocultar texto explicativo
            if (msg.length) msg.hide();
            // mantener el botón confirmar habilitado
            $('#mdl-btn-conf').prop('disabled', false);
        } else {
            // Si está desmarcado, marcar
            audIcon.removeClass('fa-regular fa-square').addClass('fa-solid fa-square-check');
            // mostrar texto explicativo
            if (msg.length) msg.show();
        }
    });
    // Si es admin, mostrar el contenedor de región; si es user, ocultarlo (por si quedó visible)
    if (rolUsuario === 'admin') {
        $('#region-container-aud').show();
    } else {
        $('#region-container-aud').hide();
    }
    // Mostrar el modal
    $('#mdl-prog-mant').modal("show")
}
//* función para genera el programa de mantenimiento preventivo (y opcional el de auditoría)
async function programar_mantenimiento() {
    // Definir campos requeridos según el rol del usuario
    // Admin debe seleccionar región, usuarios normales no
    const validar = (rolUsuario === 'admin')
        ? ['select-elaboro', 'select-autorizo', 'select-año', 'select-region-prog']
        : ['select-elaboro', 'select-autorizo', 'select-año']
    // Validar que todos los campos requeridos estén llenos
    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }
    // Construir el modelo de datos con la información del formulario
    let model = {
        accion: 3,
        anio: $('#select-año').select2('data')[0].text,
        elaboro: $('#select-elaboro').select2('data')[0].text,
        cg_elaboro: $('#select-cg-elaboro').select2('data')[0].text,
        autorizo: $('#select-autorizo').select2('data')[0].text,
        cg_autorizo: $('#select-cg-autorizo').select2('data')[0].text,

    }
    // Verificar si el usuario quiere descargar también el programa de auditoría
    let downloadBoth = false;
    const audIconEl = document.getElementById('check-editar-icon') || document.getElementById('btn-download-aud-icon');

    if (audIconEl) {
        // si tiene la clase de 'checked' (fa-solid fa-square-check) consideramos marcado
        downloadBoth = audIconEl.classList.contains('fa-solid') && audIconEl.classList.contains('fa-square-check');
    }
    // Definir mensaje de carga según si descarga uno o ambos programas
    const mensajeInicial = downloadBoth
        ? 'Programando mantenimiento y auditoría...'
        : 'Programando mantenimiento...';
    // Mostrar notificación de carga
    mostrar_toast_cargando(mensajeInicial);
    // Deshabilitar el botón de confirmación para evitar múltiples clics
    $('#mdl-btn-conf').prop('disabled', true);

    // Enviar al servidor si se desean ambos archivos; el PHP será responsable
    // de generar uno o ambos y devolver las URLs correspondientes.
    model.descargar_ambos = downloadBoth ? 1 : 0;

    // Añadir rol y región para que el backend aplique restricciones
    model.rol = rolUsuario;
    if (rolUsuario === 'admin') {
        // Admin debe especificar la región
        const sel = $('#select-region-prog').select2('data')[0];
        model.region = sel ? sel.text : ($('#select-region-prog').val() || '');
    } else {
        // Usuario normal usa su región por defecto
        model.region = regionUsu;
    }

    let server = await server_excel(model); // Enviar la solicitud al servidor
    // Procesar la respuesta del servidor
    if (server && server.resultado && server.resultado.result === true) {
        // El servidor puede devolver:
        // - resultado.urls (array de strings): múltiples archivos
        // - resultado.url (string): un solo archivo
        if (Array.isArray(server.resultado.urls)) {
            // Descargar múltiples archivos usando iframes ocultos
            server.resultado.urls.forEach(url => {
                const link = document.createElement('iframe');
                link.style.display = 'none';
                link.src = url;
                document.body.appendChild(link);
            });
        } else if (server.resultado.url) {
            // Descargar un solo archivo redirigiendo a la URL
            window.location = server.resultado.url;
        }
        // Mostrar mensaje de éxito
        mostrar_toast('success', '¡Programa generado!', 'Los archivos se han generado correctamente.');
        $('#mdl-prog-mant').modal("hide");  // Cerrar el modal
        load(); // Recargar la tabla o vista principal

    } else if (server && server.resultado && server.resultado.result === false) {
        // Error del servidor con mensaje específico
        mostrar_toast('error', 'Error', server.resultado.error);
        $('#mdl-prog-mant').modal("hide");
        $('#mdl-btn-conf').prop('disabled', false);
    } else {
        // Error genérico
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

    const validacion = ["slc-encargado"];

    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return; // Termina función si no es válido
    }

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
    let fecha = equipo.fecha.split('-');
    let mes = fecha[1];

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
// TODO: Funciones para unir reportes por mes
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

    let meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    let mesesConMantenimientos = Object.keys(mantenimientosPendientes[0].meses)

    let mesesCompletados = meses.filter(elemento => !mesesConMantenimientos.includes(elemento)).map(Number)

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
    // console.log("Descargando mes:", mes);
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
// TODO: Funciones para consultar y cargar programa de mant.
async function consultar_programa_firmado() {
    // Obtener el año del primer mantenimiento pendiente
    let año_programa = mantenimientosPendientes[0].anio;
    // Construir el modelo de datos para la petición
    let model = {
        accion: 7,
        anio: año_programa
    }
    // Enviar petición al servidor
    let server = await server_mantenimiento(model);
    // Obtener referencia al contenedor donde se mostrará el PDF
    const PDF = document.getElementById('lista-pdfs');
    // Si existe un programa firmado para este año
    if (server.resultado.existe === true) {
        // Mostrar alerta informativa
        document.getElementById('alert-programa').style.display = 'block';
        // Obtener información del archivo
        const ruta = server.resultado.url;  // URL para acceder al PDF
        const nombreArchivo = server.resultado.archivo; // Nombre del archivo
        // Construir la tarjeta HTML que muestra el PDF
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
        // Insertar la tarjeta en el contenedor
        PDF.innerHTML = item;
    } else {
        // Si no existe programa firmado, ocultar alerta y limpiar contenedor
        document.getElementById('alert-programa').style.display = 'none';
        PDF.innerHTML = '';
    }
    // Simular clic en el botón que abre el modal
    // Esto permite abrir el modal programáticamente
    document.getElementById('btn-open-programa').click();
    // Inicializar el sistema de carga de archivos
    programa_firmado();
}
// Variables globales para controlar la instancia de FilePond
let estanque = null;    // Instancia de FilePond
let estanqueInicializado = false;   // Flag para saber si ya se inicializó
//  * Función que permite subir un nuevo programa de mantenimiento firmado (solo PDF)
async function programa_firmado() {
    // Si es la primera vez que se ejecuta, inicializar FilePond
    if (!estanqueInicializado) {
        // Obtener referencia al input file
        const input = document.getElementById("subir-programa");
        // Crear instancia de FilePond con configuración personalizada
        estanque = FilePond.create(input, {
            maxFiles: 1,  // Solo permitir un archivo a la vez
            acceptedFileTypes: ['application/pdf'], // Solo aceptar PDFs
            labelIdle: 'Arrastre y suelta un archivo .pdf o <span class="filepond--label-action"> Examina </span>',
            allowMultiple: false,     // No permitir múltiples archivos
            dropOnPage: false,        // No permitir drop en toda la página
            instantUpload: false,     // No subir automáticamente
            labelFileTypeNotAllowed: 'Archivo no válido solo .pdf',
            // Configuración del servidor para la carga
            server: {
                process: {
                    url: "database/controller_mantenimientos/controller_mantenimientos.php",
                    method: "POST",
                    name: 'reporte_programa',   // Nombre del campo en $_FILES
                    withCredentials: false,
                    // Modificar el FormData antes de enviar
                    ondata: (formData) => {
                        // Agregar el año del programa como parte de la petición
                        formData.append('trama', JSON.stringify({ accion: 6, anio: mantenimientosPendientes[0].anio }));
                        return formData;
                    },
                    // Manejar respuesta exitosa del servidor
                    onload: (response) => {
                        let data = JSON.parse(response);
                        if (data.resultado.error) { // Mostrar error si algo salió mal
                            mostrar_toast('error', '¡Error!', data.resultado.error);
                        } else {    // Mostrar éxito y limpiar el widget
                            mostrar_toast('success', '¡Carga exitosa!', data.resultado.mensaje);
                            estanque.removeFiles(); // Limpiar archivos del widget
                        }
                    },
                    // Manejar errores de red o servidor
                    onerror: (err) => {
                        console.error('Error al subir: ', err);
                    }
                }
            }
        });
        // Marcar como inicializado para no volver a crear la instancia
        estanqueInicializado = true;
    } else {
        // Si ya estaba inicializado, solo limpiar archivos anteriores
        estanque.removeFiles();
    }
}