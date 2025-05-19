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
            {title:"Tipo", field:"tipo", headerFilter: "input", headerSort: false, cellClick:
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
selected = false
function mdl_editar_tipo(params) {
    for (let i = 0; i < datos.length; i++) {
        let element = datos[i]

        if (element.id === params.id) {
            datoSelected = element
            break;
        }
    }
    const serie = document.getElementById('tipo');
    serie.classList.remove('is-invalid'); // Remover clase de error si existía

    document.getElementById('alert-edit-tipo').style.display = 'block'
    document.getElementById('mdl-title').textContent = "Editar Tipo"
    document.getElementById('tipo').value = datoSelected.tipo
    document.getElementById('mdl-btn-conf').onclick = function () { editar_tipo() }
    document.getElementById('mdl-btn-conf').disabled = true

    $("#mdl-tipo").modal('show');
}

$("#check-editar").on('click', function () {
    selected = !selected;

    // Cambiar el ícono del checkbox
    let check = $("#check-editar-icon");
    if (selected) {
        check.removeClass("fa-regular fa-square");
        check.addClass("fa-solid fa-square-check");
    } else {
        check.removeClass("fa-solid fa-square-check");
        check.addClass("fa-regular fa-square ");
    }

    // Habilitar o deshabilitar el botón dependiendo de "selected"
    document.getElementById('mdl-btn-conf').disabled = !selected;
});

//*Cada que se cierre el modal se reseteará el checkbox
$('#mdl-tipo').on('hidden.bs.modal', function () {
    // Limpiar y restaurar el ícono
    $("#check-editar-icon").removeClass();
    $("#check-editar-icon").addClass("fa-regular fa-square fa-lg");
    selected = false
});

async function editar_tipo() {
    let model = {
        accion: 1,
        id: datoSelected.id,
        tipo: $('#tipo').val().trim(),
    }

    let server = await server_tipo(model)

    if (server.resultado) {
        mostrar_toast('success', 'Tipo editado', 'El tipo ha sido editado')
    } else {
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
        return;
    }
    datoSelected = ""
    table.updateData([{ id: elemento.id, tipo: model.tipo }]);
    $("#mdl-tipo").modal('hide')
}

function mdl_nuevo_tipo() {
    const serie = document.getElementById('tipo');
    serie.classList.remove('is-invalid'); // Remover clase de error si existía

    document.getElementById('mdl-title').textContent = "Nuevo Tipo"
    document.getElementById('tipo').value = ""
    document.getElementById('tipo').placeholder = "Nuevo tipo"
    document.getElementById('mdl-btn-conf').onclick = function () { nuevo_tipo() }
    document.getElementById('mdl-btn-conf').disabled = false
    document.getElementById('alert-edit-tipo').setAttribute('style', 'display: none !important;  background-color:#fceaea; border-color:#f5c6cb; color:#721c24; padding-right: 4rem;');
    $("#mdl-tipo").modal('show');
}

async function nuevo_tipo() {
    let validados = ["tipo"]

    // Validar campos
    if (!validar_campos(validados)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = {
        accion: 0,
        tipo: $('#tipo').val().trim()
    }

    let server = await server_tipo(model)
    if (typeof server.resultado === "string") {
        mostrar_toast('warning', 'Advertencia', server.resultado)
        return
    } else {
        mostrar_toast('success', 'Nuevo tipo', 'El tipo ha sido agregado')

    }

    consultar_informacion()
    $('#mdl-tipo').modal('hide')
}

async function mensaje_eliminar() {

    if (seleccionados.length === 0) {
        mostrar_toast('warning', 'Inventario TI', 'Por favor, selecciona al menos un tipo para continuar')

    } else {
        mostrar_alert('warning', `¿Está seguro de eliminar ${seleccionados.length} tipo(s)?`, false, eliminar_tipo);
    }
}

async function eliminar_tipo(params) {
    let model = {
        accion: 3,
        id: seleccionados
    }

    let server = await server_tipo(model);

    if (typeof server.resultado === "string") {
        mostrar_toast('error', 'Error', JSON.parse(respuesta).resultado, 4000)
    } else if (server.resultado) {
        mostrar_toast('success', '¡Éxito!', 'Tipo(s) eliminado(s) correctamente')
        consultar_informacion();
    } else {
        mostrar_toast('error', 'Error', 'Fallo al conectar');
    }
    deseleccionar_todos()
}

function validar_campos(campos) {
    let valido = true;

    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (!campo) {
            valido = false;
            return;
        }

        if ($(campo).hasClass('is-required') && !campo.value.trim()) {
            campo.classList.add('is-invalid'); // Agrega la clase de advertencia
            valido = false;
        } else if (!campo.value.trim()) {
            campo.classList.add('is-invalid'); // Agrega la clase de advertencia
            valido = false;
        } else {
            campo.classList.remove('is-invalid'); // Remueve la clase si el campo es válido
        }

        campo.addEventListener('input', function () {
            if (campo.value.trim()) {
                campo.classList.remove('is-invalid');
            }
        });
    });

    return valido;
}

function deseleccionar_todos() {
    //  Resetear propiedad "seleccionado"
    datos.forEach(d => d.seleccionado = false);

    //  Limpiar el array de seleccionados
    seleccionados = [];

    //  Forzar re-renderizado de todas las filas para reflejar los íconos
    table.getRows().forEach(row => row.reformat());
}
