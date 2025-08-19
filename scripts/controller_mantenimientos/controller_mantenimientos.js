function server_mantenimiento(model) {
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
    { fecha: "2025-01", estatus: "Pendiente", tipo: "PC", observaciones: "Roreoafdodajhgfdgjkhdtryuiyjhfgdftryuikgyjfhgdtsrytsodyhjhhjggfgiuydsd", usuario: "Juan Pablo", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "123456789" },
    { fecha: "2025-02", estatus: "Pendiente", tipo: "PC", observaciones: "Roreoafdodasod", usuario: "Jose Manuel", ubicacion: "Base Operativa", equipo: "Monitor", num_serie: "987654321" },
    { fecha: "2025-03", estatus: "Pendiente", tipo: "PC", observaciones: "Roreoafdodasod", usuario: "Francisco", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-04", estatus: "Pendiente", tipo: "PC", observaciones: "Roreoafdodasod", usuario: "Ricardo", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-04", estatus: "Pendiente", tipo: "PC", observaciones: "Roreoafdodasod", usuario: "Roberto", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-05", estatus: "Pendiente", tipo: "PC", observaciones: "Roreoafdodasod", usuario: "Rubén", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-05", estatus: "Pendiente", tipo: "PC", observaciones: "Roreoafdodasod", usuario: "Huichzilopotztli", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-06", estatus: "Pendiente", tipo: "PC", observaciones: "Roreoafdodasod", usuario: "Fulanito", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" }]
let elemento
let table
let supervisor_seleccionado = []

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

    // Inicializar cada fila con "seleccionado: false"
    datos.forEach(d => d.seleccionado = false);

    // Formatter del ícono tipo checkbox
    let squareIcon = function (cell, formatterParams, onRendered) {
        const seleccionado = cell.getRow().getData().seleccionado;
        const iconClass = seleccionado ? "fa-solid fa-square-check" : "fa-regular fa-square";
        return `<button type='button' class='btn icon    toggle-select'>
                    <i class='${iconClass} fa-lg'></i>
                </button>`;
    };


    let fileIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return "<button type='button' class='btn btn-outline-success icon' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Reporte de mantenimiento' onclick=''><i class='fa-solid fa-file-excel fa-lg'></i></button>";
    };

    table = new Tabulator('#tbl01', {
        locale: "es",
        data: datos,
        layout: "fitColumns",              //fit columns to width of table
        pagination: true,               //paginate the data
        paginationSize: 12,                //allow 10 rows per page of data
        paginationSizeSelector: [12, 15, 20],
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = table.getDataCount(); // Asegúrate que 'table' esté accesible
            const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
        movableColumns: true,              //allow column order to be changed
        paginationButtonCount: 3,
        rowFormatter: function (row) {
            const data = row.getData();
            //const rowElement = row.getElement();
            //const editBtn = rowElement.querySelector("button.btn-warning");


            //data = row.getData()
            if (data.seleccionado === true) {
                row.getElement().classList.add("bg-primary")
            } else if (data.seleccionado === false) {
                row.getElement().classList.remove("bg-primary")
            }
        },
        groupBy: function (data) {
            // Asegura que tenga formato YYYY-MM
            const [año, mes] = data.fecha.split("-");
            // Creamos una fecha con día explícito
            const fecha = new Date(`${año}-${mes}-01T00:00:00`);
            const opciones = { year: 'numeric', month: 'long' };
            return fecha.toLocaleDateString('es-ES', opciones);
        },
        groupHeader: function (value, count, data, group) {
            return `${value} (${count} elementos)`;
        },
        groupStartOpen: false,
        height: "800px",
        headerVisible: false,
        columns: [
            {
                formatter: squareIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    // Alternar estado de seleccionado
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_registro(rowData.id, supervisor_seleccionado)
                }, headerSort: false, frozen: true
            },
            {
                title: "Fecha", field: "fecha", headerHozAlign: "center", headerFilter: "input", headerSort: false, cellClick: function (e, cell) {
                    // Alternar estado de seleccionado
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_registro(rowData.id, supervisor_seleccionado)
                }
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
                title: "Observaciones", field: "observaciones", hozAlign: "center", width: 290, formatter: "textarea"
            },
            {
                title: "Estatus",
                field: "estatus", width: 100, hozAlign: "center"

            },
            {
                formatter: fileIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    //mdl_editar_supervisor(elemento);
                },
                headerSort: false, frozen: true
            },
        ],

    })

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
        selectId: 'select-autorizo',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Selecione un usuario',
        dropdownParent: '#mdl-prog-mant',
        tags: false,
        // popoverTitle: "Descripción",
        // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
    })

    $('#mdl-prog-mant').modal("show")
}

async function programar_mantenimiento() {

    const validar = ['select-elaboro', 'select-autorizo']

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = { accion: 3 , elaboro: $('#select-elaboro').select2('data')[0].text, autorizo: $('#select-autorizo').select2('data')[0].text }

    let server = await server_global(model);

    if (server.resultado === true) {
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