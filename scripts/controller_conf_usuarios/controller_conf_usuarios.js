//*Función para realizar peticiones http al servidor
function server_usuarios(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_conf_usuarios/controller_conf_usuarios.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                try {
                    resolve(JSON.parse(response))
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
let usuarios_seleccionados = []
//*Función para consultar la información de los usuarios de la empresa y mostrar una tabla con ella.
async function consultar_informacion() {
    let server = await server_usuarios({ accion: 2 })
    datos = server.resultado
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

    table = new Tabulator('#tbl', {
        locale: "es",
        data: datos,
        layout: "fitColumns",              //fit columns to width of table
        pagination: true,               //paginate the data
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
        paginationButtonCount: 3,
        columns: [
            {
                formatter: squareIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    // Alternar estado de seleccionado
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_registro(rowData.id, usuarios_seleccionados)
                }, headerSort: false, frozen: true
            },
            {
                title: "Nombre", field: "nombre", /* headerFilter: "input", */ headerSort: false, cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_registro(rowData.id, usuarios_seleccionados)
                    }
            },
            {
                title: "Cargo", field: "cargo", /* headerFilter: "input", */ headerSort: false, cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_registro(rowData.id, usuarios_seleccionados)
                    }
            },
            {
                title: "Región", field: "region", /* headerFilter: "input", */ headerSort: false, cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_registro(rowData.id, usuarios_seleccionados)
                    }
            },
            {
                title: "Correo", field: "correo_usuario", /* headerFilter: "input", */ headerSort: false, cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_registro(rowData.id, usuarios_seleccionados)
                    }
            },
            {
                formatter: editIcon, width: 60, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    mdl_editar_usuarios(elemento);
                },
                headerSort: false, frozen: true
            },
        ],
    })

    let searchInput = document.getElementById("buscador-tabla-supervisores")

    searchInput.addEventListener("keyup", function () {
        let query = searchInput.value.toLowerCase();

        // Función de filtro personalizada
        table.setFilter(function (data) {
            // Recorre todas las propiedades de la fila
            for (var key in data) {
                if (data[key] && data[key].toString().toLowerCase().includes(query)) {
                    return true; // Coincidencia encontrada
                }
            }
            return false; // No hay coincidencia
        });
    });
}

let datoSelected = ""
selected = false

//*Función para abir el modal de edición de usuario
async function mdl_editar_usuarios(params) {

    document.querySelectorAll('[name="conf-usuario"]').forEach(function (el) {
        el.classList.remove('is-invalid', 'is-valid')
    })

    for (let i = 0; i < datos.length; i++) {
        let element = datos[i]

        if (element.id === params.id) {
            datoSelected = element
            break;
        }
    }

    let region = [
        { id: 1, text: 'Norte' },
        { id: 2, text: 'Sur' },
        { id: 3, text: 'Tampico' },
    ]

    // Limpia y carga los select
    await general_select2({
        selectId: 'select-cargo',
        tabla: 'cat_usuarios',
        campo: 'cargo_sin_sincronizar',
        placeholder: 'Seleccione un cargo',
        dropdownParent: '#mdl-usu',
        tags: true,
    })

    await general_select2({
        selectId: 'select-region',
        data: region,
        placeholder: 'Seleccione una región',
        dropdownParent: '#mdl-usu',
    })

    document.getElementById("usu").value = params.nombre;
    rellenar_select(params.cargo, "select-cargo");
    rellenar_select(params.region, "select-region");
    document.getElementById("inp-correo").value = params.correo_usuario;

    document.getElementById('alert-edit-usu').style.display = 'block'
    document.getElementById('mdl-title').textContent = "Editar Usuario"
    document.getElementById('mdl-btn-conf').onclick = function () { editar_usuario() }
    document.getElementById('mdl-btn-conf').disabled = true

    $("#mdl-usu").modal('show');
}

//*Función para gestionar el check-box del modal
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

//*Función para enviar al servior la información actualizada del usuatio editado
async function editar_usuario() {
    let model = {
        accion: 1,
        id: datoSelected.id,
        nombre: $('#usu').val().trim(),
        cargo: $("#select-cargo").select2('data')[0].text,
        region: $('#select-region').select2('data')[0].text,
        correo: $('#inp-correo').val().trim(),
    }

    let server = await server_usuarios(model)

    if (server.resultado) {
        mostrar_toast('success', 'Usuario editado', 'El usuario ha sido editado')
    } else {
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
        return;
    }
    datoSelected = ""
    table.updateData([{ id: elemento.id, nombre: model.nombre, cargo: model.cargo, region: model.region, correo_usuario: model.correo }]);
    $("#mdl-usu").modal('hide')
}

//*Cada que se cierre el modal se reseteará el checkbox
$('#mdl-usu').on('hidden.bs.modal', function () {
    // Limpiar y restaurar el ícono
    $("#check-editar-icon").removeClass();
    $("#check-editar-icon").addClass("fa-regular fa-square fa-lg");
    selected = false
});

//*Función para abrir el modal para ingresar un nuevo usuario
async function mdl_nuevo_usuario() {
    document.querySelectorAll('[name="conf-usuario"]').forEach(function (el) {
        el.classList.remove('is-invalid', 'is-valid')
        el.value = '';
    })

    let region = [
        { id: 1, text: 'Norte' },
        { id: 2, text: 'Sur' },
        { id: 3, text: 'Tampico' },
    ]

    // Limpia y carga los select
    await general_select2({
        selectId: 'select-region',
        data: region,
        placeholder: 'Seleccione una región',
        dropdownParent: '#mdl-usu',
        // tags: true,
    })

    // Limpia y carga los select
    await general_select2({
        selectId: 'select-cargo',
        tabla: 'cat_usuarios',
        campo: 'cargo_sin_sincronizar',
        placeholder: 'Seleccione un cargo',
        dropdownParent: '#mdl-usu',
        tags: true,
    })

    document.getElementById("inp-correo").value = '@diavaz.com'
    document.getElementById('mdl-title').textContent = "Nuevo Usuario"
    document.getElementById('mdl-btn-conf').onclick = function () { nuevo_usuario() }
    document.getElementById('mdl-btn-conf').disabled = false
    document.getElementById('alert-edit-usu').setAttribute('style', 'display: none !important;  background-color:#fceaea; border-color:#f5c6cb; color:#721c24; padding-right: 4rem;');
    $("#mdl-usu").modal('show');
}

//*Función para enviar al 
async function nuevo_usuario() {
    let validados = ["usu", "select-cargo"]

    // Validar campos
    if (!validar_campos(validados)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = {
        accion: 0,
        nombre: $('#usu').val().trim(),
        cargo: $('#select-cargo').select2('data')[0].text,
        region: $('#select-region').select2('data')[0].text,
        correo: $('#inp-correo').val().trim(),
    }

    let server = await server_usuarios(model)
    if (typeof server.resultado === "string") {
        mostrar_toast('warning', 'Advertencia', server.resultado)
        return
    } else {
        mostrar_toast('success', 'Nuevo usuario', 'El usuario ha sido agregado')

    }

    consultar_informacion()
    $('#mdl-usu').modal('hide')
}

//*Función para que aparezca un aviso de confirmación al querer eliminar uno o mas usuarios
async function mensaje_eliminar() {

    if (usuarios_seleccionados.length === 0) {
        mostrar_toast('warning', 'Inventario TI', 'Por favor, selecciona al menos un usuario para continuar')

    } else {
        mostrar_alert('warning', `¿Está seguro de eliminar ${usuarios_seleccionados.length} usuario(s)?`, false, eliminar_usuario);
    }
}

//*Función para enviar los usuarios a eliminar al servidor
async function eliminar_usuario() {
    let model = {
        accion: 3,
        id: usuarios_seleccionados
    }

    let server = await server_usuarios(model);

    if (typeof server.resultado === "string") {
        mostrar_toast('error', 'Error', server.resultado, 4000)
    } else if (server.resultado) {
        mostrar_toast('success', '¡Éxito!', 'Usuario(s) eliminado(s) correctamente')
        consultar_informacion();
    } else {
        mostrar_toast('error', 'Error', 'Fallo al conectar');
    }
    deseleccionar_todos()
}

//*Función para deseleccionar los usuarios seleccionados y vaciar la variable usuarios_seleccionados
function deseleccionar_todos() {
    //  Resetear propiedad "seleccionado"
    datos.forEach(d => d.seleccionado = false);

    //  Limpiar el array de usuarios_seleccionados
    usuarios_seleccionados = [];

    //  Forzar re-renderizado de todas las filas para reflejar los íconos
    table.getRows().forEach(row => row.reformat());
}