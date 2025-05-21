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
let seleccionados = []

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
            const rowElement = row.getElement();
            const editBtn = rowElement.querySelector("button");

            if (editBtn) {
                if (data.habilitado === "1") {
                    editBtn.disabled = true;
                    editBtn.setAttribute("data-toggle", "popover");
                    editBtn.setAttribute("data-trigger", "hover");
                    editBtn.setAttribute("data-html", "true");
                    editBtn.setAttribute("data-placement", "top");
                    editBtn.setAttribute("data-content", '<div class="bg-warning text-dark p-1 rounded">Deshabilite para editar</div>');
                    $(editBtn).popover();
                } else {
                    editBtn.disabled = false;
                    $(editBtn).popover('dispose');
                    editBtn.removeAttribute("data-toggle");
                    editBtn.removeAttribute("data-trigger");
                    editBtn.removeAttribute("data-html");
                    editBtn.removeAttribute("data-placement");
                    editBtn.removeAttribute("data-content");
                }
            }
        },
        groupBy: "region",
        columns: [
            { title: "ID", field: "id", width: 45, hozAlign: "center", headerSort: false, headerHozAlign: "center", },
            {
                title: "Nombre", field: "nombre", headerHozAlign: "center", headerFilter: "input", headerSort: false
            },
            {
                title: "Cargo", field: "cargo", headerHozAlign: "center", headerFilter: "input", headerSort: false
            },
            {
                title: "Región", field: "region", headerHozAlign: "center", headerSort: false, width: 100, hozAlign: "center", headerFilter: "list",
                headerFilterParams: {
                    valuesLookup:true, clearable:true // se auto genera a partir de los valores únicos de la columna
                },
            },
            {
                title: "Habilitado",
                field: "habilitado", headerHozAlign: "center", headerFilter:"list", headerFilterParams:{values:{"1":"Activo", "0":"Inactivo"}, clearable:true},
                formatter: function (cell, formatterParams, onRendered) {
                    let value = cell.getValue();
                    let icon = value === "1" ? "fa-solid fa-toggle-on fa-2xl" : "fa-solid fa-toggle-off fa-2xl";
                    let color = value === "0" ? "#dc3545" : "#28a745";
                    return `<span class="custom-toggle"><i class="${icon}" style="color:${color}; font-size: 1.5em;"></i></span>`;
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
                                        const otherBtn = otherRowEl.querySelector("button");
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

                        const editBtn = cell.getRow().getElement().querySelector("button");
                        if (editBtn) {
                            editBtn.disabled = true;
                            editBtn.setAttribute("data-toggle", "popover");
                            editBtn.setAttribute("data-trigger", "hover");
                            editBtn.setAttribute("data-html", "true");
                            editBtn.setAttribute("data-placement", "top");
                            editBtn.setAttribute("data-content", '<div class="bg-warning text-dark p-1 rounded">Deshabilite para editar</div>');
                            $(editBtn).popover();
                        }

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

}


//*TODO Controlar el switch de la tabla para activar o desactivar supervisores

/* $('#tabla1 tbody').on('change', '.switch-toggle', function () {

    const switchElement = $(this);
    const id = switchElement.data('id');
    const isChecked = switchElement.is(':checked');

    const table = $('#tabla1').DataTable();
    const rowData = table.row(switchElement.closest('tr')).data();
    const region = rowData.region;

    const data = table.rows().data();

    // Contar cuántos están habilitados en la misma región
    let habilitadosEnRegion = 0;

    data.each(function (item) {
        if (item.region === region && parseInt(item.habilitado) === 1) {
            habilitadosEnRegion++;
        }
    }); 
   

    if (isChecked) {
        // Validar: si ya hay uno habilitado en la región, deshabilitarlo
        if (habilitadosEnRegion >= 1) {
            data.each(function (item, index) {
                if (item.region === region && item.id !== id && parseInt(item.habilitado) === 1) {
                    // Deshabilitar visualmente
                    const rowIdx = table.row(function (idx, data, node) {
                        return data.id === item.id;
                    });
                    const checkbox = $(table.row(rowIdx).node()).find('.switch-toggle');
                    checkbox.prop('checked', false);

                    // Actualizar en DataTable y backend
                    item.habilitado = 0;
                    supervisor_habilitado({
                        accion: 3,
                        id: item.id,
                        habilitado: 0
                    });

                    // También actualiza su botón
                const oldEditButton = $(table.row(rowIdx).node()).find('button');
                oldEditButton.prop('disabled', false);
                oldEditButton.removeAttr('data-toggle data-trigger data-html title data-content');
                oldEditButton.popover('dispose');
                }
            });

        }

        // Actualizar actual habilitado
        rowData.habilitado = 1;
        supervisor_habilitado({
            accion: 3,
            id: id,
            habilitado: 1
        });

        const editButton = switchElement.closest('tr').find('button');
        editButton.prop('disabled', true);
        editButton.attr({
            'data-toggle': 'popover',
            'data-placement': 'top',
            'data-trigger': 'hover',
            'data-html': 'true',
            'data-content': '<div class="bg-warning text-dark p-1 rounded">Deshabilite para editar</div>',
        });
        editButton.popover(); // Inicializa el popover

    } else {

        // Si este es el único habilitado, no permitir deshabilitar
        if (habilitadosEnRegion <= 1) {
            mostrar_toast('warning', 'Advertencia', 'Debe haber un supervisor habilitado por región.');
            switchElement.prop('checked', true);
            return;
        }
        // Actualizar y guardar
        rowData.habilitado = 0;
        supervisor_habilitado({
            accion: 3,
            id: id,
            habilitado: 0
        });

         // Rehabilitar el botón y quitar el popover
        const editButton = switchElement.closest('tr').find('button');
        editButton.prop('disabled', false);
        editButton.removeAttr('data-toggle data-trigger data-html title data-content');
        editButton.popover('dispose');


         checkbox.prop('checked', true);
        // Actualizar en DataTable y backend
        primerSupervisor.habilitado = 1;
        supervisor_habilitado({
            accion: 3,
            id: primerSupervisor.id,
            habilitado: 1
        }); 

    }
});
 */

async function supervisor_habilitado(model) {
    await server_supervisor(model)
}

//TODO Funciones para un nuevo supervisor
function nuevo_supervisor() {
    limpiar_campos_nuevo_supervisor()

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
        nombre: $('#inp-nombre').val().trim(),
        cargo: $('#inp-cargo').val().trim(),
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

function limpiar_campos_nuevo_supervisor() {
    /* let inputs = document.getElementsByName('insertMdl');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = ""; // Limpia el valor del input
        inputs[i].classList.remove('is-invalid'); // Elimina la clase de validación
    } */

    $('.select').each(function () {
        $(this).val(null).trigger('change'); // Restablece el valor y actualiza visualmente
        $(this).removeClass('is-invalid'); // Elimina la clase de validación
    });

    general_select2({
        selectId: 'inp-nombre',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        placeholder: 'Seleciona un supervisor',
        dropdownParent: '#modalInsertar',
        tags: true
    });

    general_select2({
        selectId: 'inp-cargo',
        tabla: 'cat_usuarios',
        campo: 'cargo',
        placeholder: 'Seleciona un cargo',
        dropdownParent: '#modalInsertar',
        tags: true
    });

    general_select2({
        selectId: 'inp-region',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Seleccione una región',
        dropdownParent: '#modalInsertar',
        tags: true,
    });
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
    })

    await general_select2({
        selectId: 'edi-region',
        tabla: 'supervisor',
        campo: 'region',
        placeholder: 'Seleccione una region',
        dropdownParent: '#modalEditar',
        tags: true,
    })

    $('#edi-nombre').val(selecreg.nombre).trigger('change');
    $('#edi-cargo').val(selecreg.cargo).trigger('change');
    $('#edi-region').val(selecreg.region).trigger('change');

    $("#modalEditar").modal('show');
}

async function editar_supervisor(params) {
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

    let model = {
        accion: 1,
        id: selecreg.id,
        nombre: $('#edi-nombre').val().trim(),
        cargo: $('#edi-cargo').val().trim(),
        region: $('#edi-region').val().trim(),
    }

    let server = await server_supervisor(model)
    let resultado = JSON.parse(respuesta)

    if (typeof resultado.resultado === 'string') {
        mostrar_toast("error", "Error", resultado.resultado); // Muestra el mensaje que venga en el string
        return;
    } else if (resultado.resultado === true) {
        mostrar_toast("success", "Éxito", "Supervisor editado exitosamente")
        consultar_informacion()
        $("#modalEditar").modal('hide')
    } else {
        mostrar_toast("error", "Error", "Supervisor no pudo editarse")
        return
    }
}

async function general_select2({ selectId, tabla, campo, placeholder, dropdownParent, tags }) {
    //try {
    const response = await server_supervisor({
        accion: 4,
        tabla: tabla,
        campo: campo
    });

    //console.log('Respuesta del servidor para select2:', response);

    const opciones = response.resultado.map(item => ({
        id: item[campo] || '',
        text: item[campo] || ''
    }));

    const $select = $('#' + selectId);
    $select.empty().append(new Option('', '', false, false));

    $select.select2({
        theme: 'bootstrap4',
        allowClear: true,
        placeholder: placeholder,
        tags: tags,
        dropdownParent: $(dropdownParent),
        data: opciones
    });

    $select.val(null).trigger('change');

    //} catch (error) {

    //}
}

function mostrar_toast(tipo, titulo, mensaje) {
    Swal.fire({
        icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
        title: titulo,
        text: mensaje,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
    });
}