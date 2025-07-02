function server_bajas(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_bajas/controller_bajas.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response) {
                //console.log(response);
                try {
                    resolve(JSON.parse(response))
                    //console.log(resolve(JSON.parse(response)))
                } catch (error) {
                    reject(error)
                }
            }
        })
    });
}

let datos = []
let table
async function consultar_informacion(){
    let server = await server_bajas({accion : 0})
    datos =server.resultado

    //* Idioma Español
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
            "ajax": {
                "loading": "Cargando...",
                "error": "Error al cargar datos"
            },
            "data": {
                "loading": "Cargando datos...",
                "error": "Error al cargar datos"
            }
        }
    });


     table = new Tabulator('#tbl', {
        locale: "es",
        data: datos,
        pagination: true,               //paginate the data
        height: "800px",
        paginationSize: 10,                //allow 10 rows per page of data
        paginationSizeSelector: [5, 10, 15, 20],
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = table.getDataCount(); // Asegúrate que 'table' esté accesible
             const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
        movableColumns: true,              //allow column order to be changed
        paginationButtonCount: 3,
        columns:[
            {title:"ID", field:"id_equipo", width: 70, hozAlign: "center", headerSort: false, headerHozAlign: "center", frozen:true},
            {title:"Zona", field:"zona",hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "list",
                    headerFilterParams: {
                        valuesLookup: true, clearable: true // se auto genera a partir de los valores únicos de la columna
                    },},
            {title:"Rubro", field:"rubro", hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"Activo Fijo", field:"af", hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"Tipo", field:"tipo",  hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"Marca", field:"marca",  hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"Modelo", field:"modelo",  hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"Num_serie", field:"num_serie",  hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"IMEI", field:"imei",  hozAlign: "center", width:120,headerSort: false, headerHozAlign: "center", headerFilter: "input"},
            {title:"Ubicación", field:"ubicacion",  hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"TAG", field:"tag",  hozAlign: "center", width : 170, headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"Usuario", field:"usuario",  hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"Cargo", field:"posicion",  hozAlign: "center", headerSort: false,headerHozAlign: "center", headerFilter: "input"},
            {title:"Fecha de baja", field:"fecha_entrega",  hozAlign: "center", headerSort: false,headerHozAlign: "center", frozen:true, sorter: "date",headerFilter: "input"},

        ],
    })
}

