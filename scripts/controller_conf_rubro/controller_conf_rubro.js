let respuesta

function server_rubro(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_conf_rubro/controller_conf_rubro.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
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
async function consultar_informacion() {
    let server = await server_rubro({ accion: 2 })

    datos = JSON.parse(respuesta).resultado

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
    function seleccionar_rubros(params) {
        let index = seleccionados.indexOf(params);

        if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
            seleccionados.push(params); // Añade uno o más elementos al final de un array
        } else {
            seleccionados.splice(index, 1);
        }
        console.log(seleccionados); // para depuración
    }

    table = new Tabulator('#tbl', {
        data: datos,
        layout: "fitColumns",              //fit columns to width of table
        pagination: "local",               //paginate the data
        paginationSize: 10,                //allow 10 rows per page of data
        paginationCounter: "rows",         //display count of paginated rows in footer
        movableColumns: true,              //allow column order to be changed
        columns: [
            {
                formatter: squareIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    // Alternar estado de seleccionado
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_rubros(rowData.id)
                }, headerSort: false, frozen: true
            },
            //{ title: "ID", field: "id" },
            { title: "ID", formatter: function (cell) { return cell.getRow().getPosition(true); }, width: 45, hozAlign: "center", headerSort: false },
            {
                title: "Rubro", field: "rubro", cellClick:
                    function (e, cell) {
                        let rowData = cell.getRow().getData()
                        rowData.seleccionado = !rowData.seleccionado
                        cell.getRow().reformat();
                        seleccionar_rubros(rowData.id)
                    }
            },
            {
                formatter: editIcon, width: 60, hozAlign: "center",
                cellClick: function (e, cell) {
                    elemento = cell.getRow().getData();
                    mdl_editar_rubro(elemento);
                },
                headerSort: false, frozen: true
            },
        ],
    })
}

let datoSelected = ""
function mdl_editar_rubro(params) {
    for (let i = 0; i < datos.length; i++) {
        let element = datos[i]

        if (element.id === params.id) {
            datoSelected = element
            break;
        }
    }

    document.getElementById('mdl-title').textContent = "Editar Rubro"
    document.getElementById('rubro').value = datoSelected.rubro
    document.getElementById('mdl-btn-conf').onclick = function () { editar_rubro() }

    $("#mdl-rubro").modal('show');
}

async function editar_rubro() {
    let model = {
        accion: 1,
        id: datoSelected.id,
        rubro: $('#rubro').val().trim(),
    }

    let server = await server_rubro(model)

    if (JSON.parse(respuesta).resultado) {
        mostrar_toast('success', 'Rubro editado', 'El rubro ha sido editado exitosamente')
    } else {
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
        return;
    }
    datoSelected = ""
    table.updateData([{ id: elemento.id, rubro: model.rubro }]);
    $("#mdl-rubro").modal('hide')
}

function mdl_nuevo_rubro() {
    document.getElementById('mdl-title').textContent = "Nuevo Rubro"
    document.getElementById('rubro').value = ""
    document.getElementById('rubro').placeholder = "Nuevo rubro"
    document.getElementById('mdl-btn-conf').onclick = function () { nuevo_rubro() }

    $("#mdl-rubro").modal('show');
}

async function nuevo_rubro(){
    let validados = ["rubro"]

    // Validar campos
    if (!validar_campos(validados)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = {
        accion: 0,
        rubro : $('#rubro').val().trim()
    }

    let server = await server_rubro(model)
    if (JSON.parse(respuesta).resultado) {
        mostrar_toast('success', 'Rubro editado', 'El rubro ha sido editado exitosamente')
    } else {
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
        return;
    }

    consultar_informacion()
    $('#mdl-rubro').modal('hide')
}

async function mensaje_eliminar() {

    if (seleccionados.length === 0) {
        mostrar_toast('warning', 'Inventario TI', 'Por favor, selecciona al menos un usuario para continuar')
        
    }else{
        mostrar_alert('warning', `¿Está seguro de eliminar ${seleccionados.length} usuario(s)?`, false, eliminar_usuario);
    }
}

async function eliminar_usuario(params) {
        let model = {
            accion : 3,
            id : seleccionados
        }

        let response = await server_rubro(model);
        
        if (JSON.parse(respuesta).resultado) {
            mostrar_toast('success', '¡Éxito!', 'Usuario(s) eliminado(s) correctamente')

            seleccionados = [];
            consultar_informacion();
        } else {
            mostrar_toast('error', 'Error', 'Fallo al conectar');
        }
        
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