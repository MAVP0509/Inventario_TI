function server_usuario(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_usuario/controller_usuario.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                try {
                    resolve(JSON.parse(response))
                    //console.log(response)
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}
//*Conexión para mandar correos
function server_email(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_email/controller_email.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                Swal.close()
                try {
                    resolve(JSON.parse(response))
                    console.log(JSON.parse(response))
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}


let datos = []
let elemento
let table
let usuario_seleccionado = []
//*Generar la tabla
async function consultar_usuarios() {

    let server = await server_usuario({ accion: 2 })

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
                    seleccionar_registro(rowData.id, usuario_seleccionado)
                }, headerSort: false, frozen: true
            },
            {
                title: "Nombre", field: "nombre", headerSort: false, cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_registro(rowData.id, usuario_seleccionado)
                    }
            },
            {
                title: "Correo", field: "correo", headerSort: false, cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_registro(rowData.id, usuario_seleccionado)
                    }
            },
            {
                title: "Región", field: "region", width: 100, headerSort: false, hozAlign: "center", headerHozAlign: "center",
                cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_registro(rowData.id, usuario_seleccionado)
                    }
            },
            {
                title: "Rol", field: "rol", width: 100, headerSort: false, hozAlign: "center", headerHozAlign: "center"
            },
            {
                formatter: editIcon, width: 60, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    mdl_editar_usuario(elemento);
                },
                headerSort: false, frozen: true
            },
        ],
    })

    let searchInput = document.getElementById("buscador-tabla-usuarios")

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


let usuSelect = ""
async function mdl_editar_usuario(params) {
    usuSelect = params

    //* Lista de roles
    let opcion = [
        { id: 1, text: 'admin' },
        { id: 2, text: 'user' },
    ]

    await general_select2({
        selectId: 'select-regionEdit',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Seleccione una región',
        dropdownParent: '#modalEditar',
        tags: false,
    })

    await general_select2({
        selectId: 'select-rolEdit',
        data: opcion,
        placeholder: 'Seleccione un rol',
        dropdownParent: '#modalEditar',
        tags: false,
    });


    document.getElementById('nombre').value = params.nombre
    document.getElementById('correo').value = params.correo
    rellenar_select(params.region, "select-regionEdit")
    rellenar_select(params.rol, "select-rolEdit")
    document.getElementById('contraseña').value = params.contraseña

    $("#modalEditar").modal('show')
}

async function editar_usuario() {

    const validacion = [
        "nombre",
        "correo",
        "select-regionEdit",
        "select-rolEdit"
    ];
    if (!validar_campos(validacion)) {
        mostrar_toast('warning', 'Aviso', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }

    let model = {
        accion: 1,
        id: usuSelect.id,
        nombre: $('#nombre').val().trim(),
        correo: $('#correo').val().trim(),
        region: $('#select-regionEdit').val().trim(),
        rol: $("#select-rolEdit").select2('data')[0].text,
    }

    let server = await server_usuario(model)

    if (server.resultado === true) {
        mostrar_toast('success', 'Inventario TI', 'Usuario editado')
    } else if (server.resultado === false) {
        mostrar_toast('error', 'Inventario TI', 'No pudo realizarse la acción')
    }

    consultar_usuarios()

    $("#modalEditar").modal('hide')
}


async function mensaje_eliminar() {

    if (usuario_seleccionado.length === 0) {
        mostrar_toast('warning', 'Inventario TI', 'Por favor, selecciona al menos un usuario para continuar')

    } else {
        mostrar_alert('warning', `¿Está seguro de eliminar ${usuario_seleccionado.length} usuario(s)?`, false, eliminar_usuario);
    }
}

async function eliminar_usuario() {
    let model = {
        accion: 3,
        id: usuario_seleccionado
    }

    let response = await server_usuario(model);

    if (response.resultado) {
        mostrar_toast('success', 'Inventario TI', 'Usuario(s) eliminado(s) correctamente')

        consultar_usuarios();
    } else {
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta');
    }
    deseleccionar_todos()

}

function deseleccionar_todos() {
    //  Resetear propiedad "seleccionado"
    datos.forEach(d => d.seleccionado = false);

    //  Limpiar el array de usuario_seleccionado
    usuario_seleccionado = [];

    //  Forzar re-renderizado de todas las filas para reflejar los íconos
    table.getRows().forEach(row => row.reformat());
}


async function mdl_nuevo_usuario() {
    let inputs = document.getElementsByName('insertMdl')
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
        inputs[i].classList.remove('is-invalid', 'is-warning')
    }

    //* Lista de roles
    let opcion = [
        { id: 1, text: 'admin' },
        { id: 2, text: 'user' },
    ]

    await general_select2({
        selectId: 'select-regionReg',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Seleccione una región',
        dropdownParent: '#modalInsertar',
        tags: false,
    })

    await general_select2({
        selectId: 'select-rolReg',
        data: opcion,
        placeholder: 'Seleccione un rol',
        dropdownParent: '#modalInsertar',
        tags: false,
    });


    $("#modalInsertar").modal('show')
}

async function insertar_usuario() {


    const validacion = [
        "nombreReg",
        "correoReg",
        "select-regionReg",
        "select-rolReg",
        "contraseniaReg",
        "confContraseniaReg"
    ];

    // Validar campos
    if (!validar_campos(validacion)) {
        mostrar_toast('warning', 'Aviso', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }

    if (!validar_contraseña("contraseniaReg", "confContraseniaReg")) {
        mostrar_toast('warning', 'Aviso', 'Verifique la contraseña por favor');
        return;
    }

    let model = {
        accion: 0,
        nombre: $('#nombreReg').val().trim(),
        correo: $('#correoReg').val().trim(),
        region: $('#select-regionReg').val().trim(),
        rol: $("#select-rolReg").select2('data')[0].text,
        contraseña: $('#contraseniaReg').val().trim()
    }

    let server = await server_usuario(model)

    if (server.resultado.error) {
        mostrar_toast('warning', 'Inventario TI', server.resultado.error)
        return
    } else if (server.resultado) {
        mostrar_toast('success', 'Inventario TI', 'Usuario registrado')
    } else {
        mostrar_toast('error', 'Inventario TI', 'Error del servidor')
        return
    }

    consultar_usuarios()
    $("#modalInsertar").modal('hide')
}


function ver_contraseña() {
    let regPasswordInput = document.getElementById('contraseniaReg')
    let regPasswordInputConf = document.getElementById('confContraseniaReg')
    let iconReg = document.getElementById('ver-passReg')



    if (regPasswordInput.type === 'password') {
        regPasswordInput.type = 'text';
        regPasswordInputConf.type = 'text'
        iconReg.classList.remove('fa-eye-slash');
        iconReg.classList.add('fa-eye');
    } else if (regPasswordInput.type === 'text') {
        regPasswordInput.type = 'password';
        regPasswordInputConf.type = 'password'
        iconReg.classList.remove('fa-eye');
        iconReg.classList.add('fa-eye-slash');
    }
}

//* Función para validar contraseña
function validar_contraseña(inp1, inp2) {
    let regcontraseña = document.getElementById(inp1).value;
    let confcontraseña = document.getElementById(inp2).value;

    if (!(regcontraseña === confcontraseña)) {
        $(`#${inp1}`).addClass('is-warning')
        $(`#${inp2}`).addClass('is-warning')
        $('[name="warning-pass"]').text('La contraseñas no coinciden')
        return false
    }

    let minlongitud = regcontraseña.length >= 8;
    let letrasmay = /[A-Z]/.test(regcontraseña);
    let letrasmin = /[a-z]/.test(regcontraseña);
    let numeros = /\d/.test(regcontraseña);
    let especialesc = /[()*#@.]/.test(regcontraseña);

    let cumpleRequisitos = minlongitud && letrasmay && letrasmin && numeros && especialesc;

    if (!cumpleRequisitos) {
        $(`#${inp1}`).addClass('is-warning')
        $(`#${inp2}`).addClass('is-warning')
        $('[name="warning-pass"]').text('La contraseña no cumple con los requisitos')
        return false;
    }
    return true;

}


let usuDes
async function desactivar_usuariomsg(params) {
    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];

        if (element.id === params.value) {
            usuDes = element;
            break;
        }

    }
    mostrar_alert('warning', '¿Está seguro de eliminar este usuario?', false, desactivar_usuario)
}

async function desactivar_usuario(params) {
    let model = {
        accion: 3,
        id: usuDes.id
    }

    let r = await server_usuario(model)

    if (r.resultado) {
        mostrar_toast('success', 'Inventario TI', 'Usuario eliminado')
        let table = $("#tbl-usuario").DataTable()
        table.destroy()
        consultar_usuarios()

    } else {
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
    }
}




async function recuperar_contraseña() {
    let model = {
        accion: 0,
        correo: $("#correo").val().trim(),
        dominio: window.location.hostname,
        puerto: location.port
    }

    let response = await server_email(model);

    if (response.resultado === true) {
        mostrar_toast('success', 'Correo Enviado', 'Se enviado un correo al usuario para recuperar su contraseña')
        console.log(window.location.hostname);
    } else {
        mostrar_toast('error', 'Error', 'No se envio el correo al usuario')
    }

}




$(document).ready(function () {
    $('[data-toggle="popover"]').popover()
    document.getElementById('ver-passReg').addEventListener('click', ver_contraseña);
})