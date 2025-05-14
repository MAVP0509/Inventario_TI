let respuesta

function server_tipo(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_conf_tipo/controller_conf_tipo.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response) {
                //console.log(response);
                try {
                    resolve(JSON.parse(response))
                    //console.log(resolve(JSON.parse(response)))
                    respuesta = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    });
}

let datos = []
let elemento
let table
let seleccionados = []

async function consultar_informacion(){
    let server = await server_tipo({accion : 2})

    datos = JSON.parse(respuesta).resultado

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

    // Función para alternar selección y actualizar array
    function seleccionar_tipos(params) {
        let index = seleccionados.indexOf(params);

        if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
            seleccionados.push(params); // Añade uno o más elementos al final de un array
        } else {
            seleccionados.splice(index, 1);
        }
        //console.log(seleccionados); // para depuración
    }

     table = new Tabulator('#tbl', {
         locale: "es",
        data: datos,
        layout: "fitColumns",              //fit columns to width of table
        pagination: "local",               //paginate the data
        paginationSize: 10,                //allow 10 rows per page of data
        paginationSizeSelector: [5, 10, 15, 20],
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = table.getDataCount(); // Asegúrate que 'table' esté accesible
             const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },         
        movableColumns: true,              //allow column order to be changed
        rowFormatter: function (row) {
            data = row.getData()
            if (data.seleccionado === true) {
                row.getElement().classList.add("bg-primary")
            } else if (data.seleccionado === false) {
                row.getElement().classList.remove("bg-primary")
            }
        },
        paginationButtonCount:3,
        columns:[
            {
                formatter: squareIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    // Alternar estado de seleccionado
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_tipos(rowData.id)
                }, headerSort: false, frozen: true
            },
            {title:"ID", field:"id", width: 45, hozAlign: "center", headerSort: false},
            {title:"Tipo", field:"tipo", cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_tipos(rowData.id)
                    }},
            {
                formatter: editIcon, width: 60, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    mdl_editar_tipo(elemento);
                },
                headerSort: false, frozen: true
            },
        ],
    })
}

let datoSelected = ""
function mdl_editar_tipo(params) {
    for (let i = 0; i < datos.length; i++) {
        let element = datos[i]

        if (element.id === params.id) {
            datoSelected = element
            break;
        }
    }

    document.getElementById('mdl-title').textContent = "Editar Tipo"
    document.getElementById('tipo').value = datoSelected.tipo
    document.getElementById('mdl-btn-conf').onclick = function () { editar_tipo() }

    $("#mdl-tipo").modal('show');
}

async function editar_tipo() {
    let model = {
        accion: 1,
        id: datoSelected.id,
        tipo: $('#tipo').val().trim(),
    }

    let server = await server_tipo(model)

    if (JSON.parse(respuesta).resultado) {
        mostrar_toast('success', 'Tipo editado', 'El tipo ha sido editado exitosamente')
    } else {
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
        return;
    }
    datoSelected = ""
    table.updateData([{ id: elemento.id, tipo: model.tipo }]);
    $("#mdl-tipo").modal('hide')
}