let respuesta

function server_supervisor(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_supervisores/controller_supervisores.php",
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
let supervisor_seleccionado = []

async function consultar_informacion(params) {
    let model = {
        accion: 2
    };

    let server = await server_supervisor(model);

    datos = server.resultado;
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

    table = new Tabulator('#tbl', {
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
        groupBy: "region",
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
                title: "Nombre", field: "nombre", headerHozAlign: "center", /* headerFilter: "input", */ headerSort: false, cellClick: function (e, cell) {
                    // Alternar estado de seleccionado
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_registro(rowData.id, supervisor_seleccionado)
                }
            },
            {
                title: "Cargo", field: "cargo", headerHozAlign: "center", /* headerFilter: "input", */ headerSort: false, cellClick: function (e, cell) {
                    // Alternar estado de seleccionado
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_registro(rowData.id, supervisor_seleccionado)
                }
            },
            {
                title: "Región", field: "region", headerHozAlign: "center", headerSort: false, width: 100, hozAlign: "center", /* headerFilter: "list", */
                headerFilterParams: {
                    valuesLookup: true, clearable: true // se auto genera a partir de los valores únicos de la columna
                }, cellClick: function (e, cell) {
                    // Alternar estado de seleccionado
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_registro(rowData.id)
                }
            },
            {
                title: "Habilitado",
                field: "habilitado", headerHozAlign: "center", /* headerFilter: "list", */ headerFilterParams: { values: { "1": "Habilitado", "0": "Inhabilitado" }, clearable: true },
                formatter: function (cell, formatterParams, onRendered) {
                    let value = cell.getValue();
                    let icon = value === "1" ? "fa-solid fa-toggle-on fa-2xl" : "fa-solid fa-toggle-off fa-2xl";
                    let color = value === "0" ? "#dc3545" : "#28a745";
                    let valor = value === "1" ? "Habilitado": "Inhabilitado"
                    regionesSinSupervisor(table)
                    return `<span class="custom-toggle"><i class="${icon}"  style="color:${color}; font-size: 1.5em;"></i></span>`;
                },
                cellClick: function (e, cell) {
                    const tableData = table.getData();
                    const rowData = cell.getRow().getData();
                    const id = rowData.id;
                    const region = rowData.region;
                    const current = rowData.habilitado;
                    const isChecked = current === "1";

                    let habilitadosEnRegion = tableData.filter(row =>
                        row.region === region && row.habilitado === "1"
                    );

                    if (!isChecked) {
                        // Habilitar este y deshabilitar el resto
                        if (habilitadosEnRegion.length >= 1) {
                            habilitadosEnRegion.forEach(sup => {
                                if (sup.id !== id) {
                                    const otherRow = table.getRow(sup.id);
                                    if (otherRow) {
                                        otherRow.update({ habilitado: "0" });

                                        // Habilitar botón editar
                                        const otherRowEl = otherRow.getElement();
                                        const otherBtn = otherRowEl.querySelector("button.btn-warning");
                                        if (otherBtn) {
                                            otherBtn.disabled = false;
                                            $(otherBtn).popover('dispose');
                                            otherBtn.removeAttribute("data-toggle");
                                            otherBtn.removeAttribute("data-trigger");
                                            otherBtn.removeAttribute("data-html");
                                            otherBtn.removeAttribute("data-placement");
                                            otherBtn.removeAttribute("data-content");
                                        }

                                        supervisor_habilitado({
                                            accion: 3,
                                            id: sup.id,
                                            habilitado: 0
                                        });
                                    }
                                }
                            });
                        }

                        // Activar actual
                        cell.setValue("1");
                        rowData.habilitado = "1";

                        supervisor_habilitado({
                            accion: 3,
                            id: id,
                            habilitado: 1
                        });

                        const editBtn = cell.getRow().getElement().querySelector("button.btn-warning");
                        /* if (editBtn) {
                            editBtn.disabled = true;
                            editBtn.setAttribute("data-toggle", "popover");
                            editBtn.setAttribute("data-trigger", "hover");
                            editBtn.setAttribute("data-html", "true");
                            editBtn.setAttribute("data-placement", "top");
                            editBtn.setAttribute("data-content", '<div class="bg-warning text-dark p-1 rounded">Deshabilite para editar</div>');
                            $(editBtn).popover();
                        } */

                    } else {
                        // Intentamos desactivar
                        if (habilitadosEnRegion.length <= 1) {
                            mostrar_toast('warning', 'Advertencia', 'Debe haber un supervisor habilitado por región.');
                            return;
                        }

                        cell.setValue("0");
                        rowData.habilitado = "0";

                        supervisor_habilitado({
                            accion: 3,
                            id: id,
                            habilitado: 0
                        });

                        const editBtn = cell.getRow().getElement().querySelector("button");
                        if (editBtn) {
                            editBtn.disabled = false;
                            $(editBtn).popover('dispose');
                            editBtn.removeAttribute("data-toggle");
                            editBtn.removeAttribute("data-trigger");
                            editBtn.removeAttribute("data-html");
                            editBtn.removeAttribute("data-placement");
                            editBtn.removeAttribute("data-content");
                        }
                    }
                }, width: 90, hozAlign: "center", headerSort: false,

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
//*Cada que un supervisor es habilitado se ejecuta para actualizar la BD
async function supervisor_habilitado(model) {
    await server_supervisor(model)
}

//TODO Funciones para un nuevo supervisor
async function nuevo_supervisor() {
    $('.select').each(function () {
        $(this).val(null).trigger('change'); // Restablece el valor y actualiza visualmente
        $(this).removeClass('is-invalid'); // Elimina la clase de validación
    });

    await general_select2({
        selectId: 'inp-nombre',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Seleciona un supervisor',
        dropdownParent: '#modalInsertar',
        tags: true
    });

    await general_select2({
        selectId: 'inp-cargo',
        tabla: 'cat_usuarios',
        campo: 'cargo',
        placeholder: 'Seleciona un cargo',
        dropdownParent: '#modalInsertar',
        tags: true
    });

    await general_select2({
        selectId: 'inp-region',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Seleccione una región',
        dropdownParent: '#modalInsertar',
        tags: true,
    });

    $("#modalInsertar").modal('show');
}

async function insertar_supervisor() {
    // Campos requeridos para validación
    const validacion = [
        "inp-nombre",
        "inp-cargo",
        "inp-region",
    ];
    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }

    let model = {
        accion: 0,
        nombre: $('#inp-nombre').select2('data')[0].text,
        cargo: $('#inp-cargo').select2('data')[0].text,
        region: $('#inp-region').val().trim(),
    }

    let server = await server_supervisor(model)

    let resultado = JSON.parse(respuesta)

    if (resultado.resultado === true) {
        mostrar_toast("success", "Supervisor registrado", "El supervisor ha sido registrado exitosamente")
        consultar_informacion()
        $("#modalInsertar").modal('hide');

    } else {
        mostrar_toast("error", "Error", "Supervisor ya existente")
        return
    }
}

//TODO Funciones para editar los supervisores
let selecreg = ""

async function mdl_editar_supervisor(params) {
    for (let i = 0; i < datos.length; i++) {
        const element = datos[i];
        if (element.id === params.id) {
            selecreg = element;
            break;
        }
    }
    // Limpia y carga los select
    await general_select2({
        selectId: 'edi-nombre',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Selecione un nombre',
        dropdownParent: '#modalEditar',
    })

    await general_select2({
        selectId: 'edi-cargo',
        tabla: 'cat_usuarios',
        campo: 'cargo',
        placeholder: 'Selecione un cargo',
        dropdownParent: '#modalEditar',
        tags: true
    })

    await general_select2({
        selectId: 'edi-region',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Seleccione una región',
        dropdownParent: '#modalEditar',
        tags: true,
    })

    rellenar_select(selecreg.nombre, "edi-nombre")
    rellenar_select(selecreg.cargo, "edi-cargo")
    $('#edi-region').val(selecreg.region).trigger('change');

    $("#modalEditar").modal('show');
}

async function editar_supervisor() {
    // Campos requeridos para validación
    const validacion = [
        "edi-nombre",
        "edi-cargo",
        "edi-region",
    ];
    if (!validar_campos(validacion)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente');
        return;
    }

    if (selecreg.region === $('#edi-region').val().trim()) {
        let model = {
            accion: 1,
            id: selecreg.id,
            nombre: $('#edi-nombre').select2('data')[0].text,
            cargo: $('#edi-cargo').select2('data')[0].text,
            region: $('#edi-region').val().trim(),
        }

        let server = await server_supervisor(model)
        //let resultado = JSON.parse(respuesta)

        if (server.resultado.resultado) {
            mostrar_toast("success", "Éxito", server.resultado.resultado)
            consultar_informacion()
            $("#modalEditar").modal('hide')
        } else {
            mostrar_toast("error", "Error", "Supervisor no pudo editarse")
            return
        }
    } else {
        mostrar_alert('warning', `Esto deshabilitará al supervisor habilitado que tenga esa región`, false,
            async () => {
                let model = {
                    accion: 1,
                    id: selecreg.id,
                    nombre: $('#edi-nombre').select2('data')[0].text,
                    cargo: $('#edi-cargo').select2('data')[0].text,
                    region: $('#edi-region').val().trim(),
                }

                let server = await server_supervisor(model);

                if (server.resultado.resultado) {
                    mostrar_toast("success", "Éxito", server.resultado.resultado);
                    consultar_informacion();
                    $("#modalEditar").modal('hide');
                } else {
                    mostrar_toast("error", "Error", "Supervisor no pudo editarse");
                }
            }
        )
    }

}

async function mensaje_eliminar() {

    if (supervisor_seleccionado.length === 0) {
        mostrar_toast('warning', 'Inventario TI', 'Por favor, selecciona al menos un supervisor para continuar')

    } else {
        mostrar_alert('warning', `¿Está seguro de eliminar ${supervisor_seleccionado.length} supervisor(es)?`, false, eliminar_supervisor);
    }
}

async function eliminar_supervisor() {
    let model = {
        accion: 5,
        id: supervisor_seleccionado
    }

    let server = await server_supervisor(model);

    if (server.resultado.error) {
        mostrar_toast('warning', 'Aviso', server.resultado.error, 4000)
    } else if (server.resultado.mensaje) {
        mostrar_toast('success', '¡Éxito!', server.resultado.mensaje)
        consultar_informacion();
    } else {
        mostrar_toast('error', 'Error', 'Fallo al conectar');
    }
    deseleccionar_todos()
}

function deseleccionar_todos() {
    //  Resetear propiedad "seleccionado"
    datos.forEach(d => d.seleccionado = false);

    //  Limpiar el array de supervisor_seleccionado
    supervisor_seleccionado = [];

    //  Forzar re-renderizado de todas las filas para reflejar los íconos
    table.getRows().forEach(row => row.reformat());
}

function regionesSinSupervisor(table) {
    const data = table.getData();

    // Crear un objeto para contar habilitados por región
    const regiones = {};

    data.forEach(row => {
        const region = row.region;
        const habilitado = row.habilitado === "1";

        if (!regiones[region]) {
            regiones[region] = 0;
        }

        if (habilitado) {
            regiones[region]++;
        }
    });

    // Contar cuántas regiones tienen cero habilitados
    const sinSupervisores = Object.values(regiones).filter(cantidad => cantidad === 0).length;

    // Actualizar el contador en el DOM
    document.getElementById("contador-region").textContent = sinSupervisores;
}
