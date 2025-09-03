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

let datos = [
    { fecha: "2025-01-02", estatus: "Pendiente", tipo: "PC", usuario: "Juan Pablo", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "123456789" },
    { fecha: "2025-02-02", estatus: "Pendiente", tipo: "PC", usuario: "Jose Manuel", ubicacion: "Base Operativa", equipo: "Monitor", num_serie: "987654321" },
    { fecha: "2025-03-02", estatus: "Cancelado", tipo: "PC", usuario: "Francisco", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-04-02", estatus: "Realizado", tipo: "PC", usuario: "Ricardo", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-04-01", estatus: "Pendiente", tipo: "PC", usuario: "Roberto", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-05-02", estatus: "Pendiente", tipo: "PC", usuario: "Rubén", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-05-01", estatus: "Pendiente", tipo: "PC", usuario: "Huichzilopotztli", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-06-01", estatus: "Pendiente", tipo: "PC", usuario: "Fulanito", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" }]
let elemento
let table
let gruposAbiertosKey = "grupos_abiertos_tbl01";
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

    // Esperar a que los grupos estén disponibles
    const esperarGrupos = setInterval(() => {
        const grupos = table.getGroups();

        if (grupos.length === 0) return;

        grupos.forEach(group => {
            if (abiertos.includes(group.getKey())) {
                group.show(); // abrir
            } else {
                group.hide(); // cerrar
            }
        });

        gruposRestaurados = true;
        clearInterval(esperarGrupos);
    }, 100); // cada 100ms
}

function consultar_informacion() {

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
        return `<button type='button' class='btn btn-warning icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Editar' onclick=''><i class='fa-solid fa-pen-to-square fa-lg'></i></button>`;
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
    };

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
        headerVisible: false,
        dataGrouped: function (groups) {
            restaurarEstadoDeGrupos();
        },
        renderComplete: function () {
            restaurarEstadoDeGrupos()
        },
        columns: [
            {
                title: "Fecha", field: "fecha", hozAlign: "center"
            },
            {
                title: "Tipo",
                field: "tipo", hozAlign: "center",
            },
            {
                title: "Usuario",
                field: "usuario", hozAlign: "center"

            },
            {
                title: "Ubicación",
                field: "ubicacion", hozAlign: "center"

            },
            {
                title: "Equipo",
                field: "equipo", hozAlign: "center"
            },
            {
                title: "Número de serie",
                field: "num_serie", hozAlign: "center"

            },
            {
                title: "Estatus",
                field: "estatus", hozAlign: "center", formatter: "lookup",
                formatterParams: {
                    "Pendiente": `<i class="fa-solid fa-circle fa-beat-fade" style="color: #ff7300;"></i> Pendiente`,
                    "Realizado": `<i class="fa-solid fa-circle fa-beat" style="color: #28a745;"></i> Realizado`,
                    "Cancelado": `<i class="fa-solid fa-circle fa-beat" style="color: #dc3545;"></i> Cancelado`
                }

            },
            {
                formatter: fileIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    //mdl_editar_supervisor(elemento);
                }
            },
            {
                formatter: uploadIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    //mdl_editar_supervisor(elemento);
                }
            },
            {
                formatter: editIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    //mdl_editar_supervisor(elemento);
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

consultar_informacion()

async function mdl_programar_mantenimiento() {


    await general_select2({
        selectId: 'select-elaboro',
        tabla: 'supervisor',
        campo: 'nombre',
        placeholder: 'Selecione un usuario',
        dropdownParent: '#mdl-prog-mant',
        tags: false,
        // popoverTitle: "Descripción",
        // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
    })

    await general_select2({
        selectId: 'select-cg-elaboro',
        tabla: 'supervisor',
        campo: 'cargo',
        placeholder: 'Seleccione un cargo',
        dropdownParent: '#mdl-prog-mant',
        tags: false,
        sincronizarCon: 'select-elaboro',
        sincronizarCampo: 'cargo'
    })

    await general_select2({
        selectId: 'select-autorizo',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Selecione un usuario',
        dropdownParent: '#mdl-prog-mant',
        tags: false,
        // popoverTitle: "Descripción",
        // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
    })

    await general_select2({
        selectId: 'select-cg-autorizo',
        tabla: 'cat_usuarios',
        campo: 'cargo',
        placeholder: 'Seleccione un cargo',
        dropdownParent: '#mdl-prog-mant',
        tags: false,
        sincronizarCon: 'select-autorizo',
        sincronizarCampo: 'cargo'
    })

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

//? Inicializar popover
$(function () {
    $('[data-toggle="popover"]').tooltip()
})