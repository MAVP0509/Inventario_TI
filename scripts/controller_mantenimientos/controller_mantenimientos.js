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

let datos
let elemento
let table
let gruposAbiertosKey = "grupos_abiertos_mantenimientos";
let gruposRestaurados = false;

function guardarEstadoDeGrupos() {
    const abiertos = table.getGroups()
        .filter(group => group.isVisible())
        .map(group => group.getKey());
    localStorage.setItem(gruposAbiertosKey, JSON.stringify(abiertos));
}

function restaurarEstadoDeGrupos() {
    if (gruposRestaurados) return;

    const abiertos = JSON.parse(localStorage.getItem(gruposAbiertosKey) || "[]");
    let intentos = 0;
    const maxIntentos = 30;

    const intervalo = setInterval(() => {
        intentos++;
        const grupos = table.getGroups();

        if (grupos.length === 0) return; // no hay grupos todavía

        // Intentar abrir todos los grupos que están en 'abiertos'
        abiertos.forEach(key => {
            const grupo = grupos.find(g => g.getKey() === key);
            if (grupo) {
                grupo.show();
            }
        });

        // Verificar si todos los grupos ya están abiertos
        const todosAbiertos = abiertos.every(key => {
            const grupo = grupos.find(g => g.getKey() === key);
            return grupo && grupo.isVisible();
        });

        if (todosAbiertos || intentos >= maxIntentos) {
            gruposRestaurados = true;
            clearInterval(intervalo);
        }

    }, 100);
}

async function consultar_informacion() {

    let server = await server_mantenimiento({ accion: 0 })
    datos = server.resultado
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
        return `<button type='button' class='btn btn-info icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Subir reporte firmado' onclick=''><i class='fa-solid fa-upload fa-lg'></i></button>`;
    }

    let fileIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return "<button type='button' class='btn btn-success icon' data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Reporte de mantenimiento' onclick=''><i class='fa-solid fa-file-excel fa-lg'></i></button>";
    }

    let eyeIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return "<button type='button' class='btn btn-lock btn-outline-dark icon' onclick=''><i class='fa-solid fa-eye '></i></button>";
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
        data: datos,
        layout: "fitColumns",              //fit columns to width of table
        movableColumns: true,              //allow column order to be changed
        paginationButtonCount: 3,
        groupBy: function (data) {
            // Asegura que tenga formato YYYY-MM
            const [año, mes] = data.fecha.split("-");
            // Creamos una fecha con día explícito
            const fecha = new Date(`${año}-${mes}-01T00:00:00`);
            const opciones = { year: 'numeric', month: 'long' };
            return fecha.toLocaleDateString('es-ES', opciones);
        },
        groupStartOpen: false,
        groupToggleElement: "header", //* Permite que dando click en cualquier parte del header group, éste se despliegue
        //headerVisible: false,
        dataGrouped: function (groups) {
            restaurarEstadoDeGrupos();
        },
        renderComplete: function () {
            restaurarEstadoDeGrupos()
        },
        columns: [
            {
                title: "Fecha", field: "fecha", width: 115, headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input", sorter: "date",
            },
            {
                title: "Rubro",
                field: "rubro", width: 130, headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input"
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
                formatter: fileIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    //mdl_editar_supervisor(elemento);
                }
            },
            {
                formatter: uploadIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    //mdl_editar_supervisor(elemento);
                }
            },
            {
                formatter: editIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    mdl_mantenimiento_info(elemento);
                }
            },
            {
                formatter: eyeIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    //mdl_mantenimiento_info(elemento);
                }
            },
        ],



    })
    // Guarda cuando se expande o colapsa un grupo
    table.on("groupVisibilityChanged", guardarEstadoDeGrupos);

    // Verificar cada 100ms hasta que los grupos existan, máximo por 3 segundos
    const intentoMax = 30;
    let intento = 0;
    const timer = setInterval(() => {
        intento++;
        if (!gruposRestaurados) {
            restaurarEstadoDeGrupos();
        }
        if (gruposRestaurados || intento >= intentoMax) {
            clearInterval(timer);
        }
    }, 100);

}


async function mdl_programar_mantenimiento() {

    await Promise.all([
        general_select2({
            selectId: 'select-elaboro',
            tabla: 'supervisor',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'select-cg-elaboro',
            tabla: 'supervisor',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            sincronizarCon: 'select-elaboro',
            sincronizarCampo: 'cargo'
        }),

        general_select2({
            selectId: 'select-autorizo',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'select-cg-autorizo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            sincronizarCon: 'select-autorizo',
            sincronizarCampo: 'cargo'
        }),
    ])

    $('#select-cg-elaboro, #select-cg-autorizo').prop('disabled', true)

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

    mostrar_toast_cargando()

    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url;
        mostrar_toast('success', '¡Programa de mantenimiento exitosa!', 'Rellena los campos. Inténtelo nuevamente.');
        $('#mdl-prog-mant').modal("hide");
    } else {
        mostrar_toast('error', 'Error', 'No se pudo realizar el programa de mantenimiento. Inténtalo nuevamente.');
    }
}

let selecreg 
async function mdl_mantenimiento_info(elemento) {
    // Busca en el arreglo 'datos' el registro con el mismo id_equipo
    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];
        if (element.id_equipo === elemento.id_equipo && element.anio === elemento.anio ) {
            // Guarda el registro completo en una variable global
            selecreg = element;
            // console.log(selecreg)
            break;
        }
    }
    // Llama a varias funciones para cargar los selects con datos dinámicos
    await Promise.all([
        general_select2({
            selectId: 'iselect-rubro',
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
            selectId: 'inp-cargo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'NA',
            dropdownParent: '#mdl-mant-info',
            sincronizarCampo: 'cargo',
            sincronizarCon: 'select-usuario'
        }),
    ])
    $('#mdl-mant-info').modal("show")
}

//? Inicializar popover
$(function () {
    $('[data-toggle="popover"]').tooltip()
})