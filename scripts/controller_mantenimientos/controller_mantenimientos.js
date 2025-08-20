let datos = [
    { fecha: "2025-01", estatus: "Pendiente", tipo: "PC",  usuario: "Juan Pablo", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "123456789" },
    { fecha: "2025-02", estatus: "Pendiente", tipo: "PC",  usuario: "Jose Manuel", ubicacion: "Base Operativa", equipo: "Monitor", num_serie: "987654321" },
    { fecha: "2025-03", estatus: "Pendiente", tipo: "PC",  usuario: "Francisco", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-04", estatus: "Pendiente", tipo: "PC",  usuario: "Ricardo", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-04", estatus: "Pendiente", tipo: "PC",  usuario: "Roberto", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-05", estatus: "Pendiente", tipo: "PC",  usuario: "Rubén", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-05", estatus: "Pendiente", tipo: "PC",  usuario: "Huichzilopotztli", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-06", estatus: "Pendiente", tipo: "PC",  usuario: "Fulanito", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" }]
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

    let editIcon = function (cell, formatterParams, onRendered) {
        onRendered(function(){
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return `<button type='button' class='btn btn-warning icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Editar' onclick=''><i class='fa-solid fa-pen-to-square fa-lg'></i></button>`;
    }

    let uploadIcon = function (cell, formatterParams, onRendered) {
        onRendered(function(){
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
                field: "estatus", hozAlign: "center"

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

}

consultar_informacion()

async function mdl_programar_mantenimiento() {
    
        $('#mdl-prog-mant').modal("show")
}

//? Inicializar popover
$(function () {
    $('[data-toggle="popover"]').tooltip()
})