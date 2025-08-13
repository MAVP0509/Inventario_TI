let datos = [
    { fecha: "2025-01", estatus: "Pendiente", tipo: "PC", usuario: "Juan Pablo", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "123456789" },
    { fecha: "2025-02", estatus: "Pendiente", tipo: "PC", usuario: "Jose Manuel", ubicacion: "Base Operativa", equipo: "Monitor", num_serie: "987654321" },
    { fecha: "2025-03", estatus: "Pendiente", tipo: "PC", usuario: "Francisco", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-04", estatus: "Pendiente", tipo: "PC", usuario: "Ricardo", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-04", estatus: "Pendiente", tipo: "PC", usuario: "Roberto", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-05", estatus: "Pendiente", tipo: "PC", usuario: "Rubén", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-05", estatus: "Pendiente", tipo: "PC", usuario: "Huichzilopotztli", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" },
    { fecha: "2025-06", estatus: "Pendiente", tipo: "PC", usuario: "Fulanito", ubicacion: "Base Operativa", equipo: "Laptop", num_serie: "192837645" }] 
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


    let editIcon = function (cell, formatterParams, onRendered) { //plain text value
        return "<button type='button' class='btn btn-warning icon' onclick=''><i class='fa-solid fa-pen-to-square fa-lg'></i></button>";
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
        groupStartOpen:false,
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
                field: "tipo", headerHozAlign: "center", headerFilter: "list", headerFilterParams: { values: { "1": "Activo", "0": "Inactivo" }, clearable: true },
                 hozAlign: "center", headerSort: false,

            },
            {
                title: "Usuario",
                field: "usuario", headerHozAlign: "center", headerFilter: "list", headerFilterParams: { values: { "1": "Activo", "0": "Inactivo" }, clearable: true },
                 hozAlign: "center", headerSort: false,

            },
            {
                title: "Ubicación",
                field: "ubicacion", headerHozAlign: "center", headerFilter: "list", headerFilterParams: { values: { "1": "Activo", "0": "Inactivo" }, clearable: true },
                 hozAlign: "center", headerSort: false,

            },
            {
                title: "Equipo",
                field: "equipo", headerHozAlign: "center", headerFilter: "list", headerFilterParams: { values: { "1": "Activo", "0": "Inactivo" }, clearable: true },
                 hozAlign: "center", headerSort: false,

            },
            {
                title: "Número de serie",
                field: "num_serie", headerHozAlign: "center", headerFilter: "list", headerFilterParams: { values: { "1": "Activo", "0": "Inactivo" }, clearable: true },
                 hozAlign: "center", headerSort: false,

            },
            {
                title: "Estatus",
                field: "estatus", headerHozAlign: "center", headerFilter: "list", headerFilterParams: { values: { "1": "Activo", "0": "Inactivo" }, clearable: true },
                width: 100, hozAlign: "center", headerSort: false,

            },
            {
                formatter: editIcon, width: 60, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    mdl_editar_supervisor(elemento);
                },
                headerSort: false, frozen: true
            },
        ],

    })

}

consultar_informacion()

function mdl_programar_mantenimiento(){
    $('#mdl-prog-mant').modal("show")
}