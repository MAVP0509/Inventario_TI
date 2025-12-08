function server_tipo_auditoria(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_conf_tipo_auditoria/controller_conf_tipo_auditoria.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (respose) {
                try {
                    resolve(JSON.parse(respose))
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

let datos_orden_auditoria = []
let tabla_orden_auditoria
let ord_aud_seleccionado = []
// let orden_actual = []

async function consultar_orden_auditoria(params) {

    ord_aud_seleccionado = []

    let server = await server_tipo_auditoria({ accion: 0 });

    datos_orden_auditoria = server.resultado;

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

    datos_orden_auditoria.forEach(d => d.seleccionado = false);

    let squareIcon = function (cell, formatterParams, onRendered) {
        const seleccionado = cell.getRow().getData().seleccionado;
        const iconClass = seleccionado ? "fa-solid fa-square-check" : "fa-regular fa-square";
        return `<button type='button' class='btn icon toggle-select'>
                    <i class='${iconClass} fa-lg'></i>
                </button>`;
    }

    tabla_orden_auditoria = new Tabulator('#tbl-orden-tp', {
        locale: "es",
        data: datos_orden_auditoria,
        layout: "fitColumns",
        movableRows: true,
        height: "600px",
        // pagination: "local",
        // paginationSize: 15,
        // paginationSizeSelector: [5, 10, 15, 20, true],
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = tabla_orden_auditoria.getDataCount(); // Asegúrate que 'table' esté accesible
            const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
        rowFormatter: function (row) {
            data = row.getData()
            // console.log("rowFormatter", data.tipo, data.ord_aud_seleccionado);
            if (data.seleccionado === true) {
                row.getElement().classList.add("bg-primary")
            } else if (data.seleccionado === false) {
                row.getElement().classList.remove("bg-primary")
            }
        },
        columns: [
            {
                formatter: squareIcon, width: 70, hozAlign: "center",
                cellClick: function (e, cell) {
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_registro(rowData.tipo_id, ord_aud_seleccionado)
                    // console.log(ord_aud_seleccionado);
                }, headerSort: false, frozen: true
            },
            { title: "Orden", field: "orden", headerHozAlign: "center", hozAlign: "center", width: 80 },
            {
                title: "Tipos de activos", field: "tipo", headerHozAlign: "center", hozAlign: "center",
                cellClick: function (e, cell) {
                    let rowData = cell.getRow().getData();
                    rowData.seleccionado = !rowData.seleccionado;
                    cell.getRow().reformat();
                    seleccionar_registro(rowData.tipo_id, ord_aud_seleccionado)
                },
            },
        ],

    })

    tabla_orden_auditoria.on("rowMoved", function (row) {
        let orden = tabla_orden_auditoria.getData().map(data => data.tipo_id)
        // console.log(orden)
        orden_tipos(orden);
    })
}

async function mdl_nuevo_orden_tipo() {
    $('[name="nv-tipo-mant"]').each(function () {
        $(this).removeClass('is-invalid');
    })

    await general_select2({
        selectId: "slc-orden-tp",
        tabla: "cat_tipo",
        campo: "tipo",
        dropdownParent: "#mdl-tipo-mant",
        placeholder: "Seleccione un tipo de dispositivo",
        // multiple: true,
    })

    $("#mdl-btn-orden-tp").off("click").on("click", function () { nuevo_orden_tipo() })
    $("#mdl-tipo-mant").modal("show");
}

async function nuevo_orden_tipo() {

    let validar = ["slc-orden-tp"]

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = { accion: 1, dispositivo: $("#slc-orden-tp").val() }

    let server = await server_tipo_auditoria(model);

    if (server.resultado.result === true) {
        await consultar_orden_auditoria();
        // table_orden.addData();
        mostrar_toast('success', '¡Registro exitoso!', server.resultado.mensaje);
        $('#mdl-tipo-mant').modal("hide");
    } else {
        mostrar_toast('error', '¡Error en el registro!', server.resultado.error);
    }
}

async function msj_eliminar_orden_tipo() {

    if (ord_aud_seleccionado.length === 0) {
        mostrar_toast('warning', 'Inventario TI', 'Por favor, selecciona al menos un tipo para continuar')

    } else {
        mostrar_alert('warning', `¿Está seguro de eliminar ${ord_aud_seleccionado.length} tipo(s)?`, false, eliminar_orden_tipo);
    }
}

async function orden_tipos(orden_actual) {
    let model = {
        accion: 2,
        orden: orden_actual,
        // activo: orden_actual.orden
    }

    let server = await server_tipo_auditoria(model);

    if (server.resultado.result === true) {
        await consultar_orden_auditoria();
        // programar_mantenimiento(orden_actual);
        mostrar_toast('success', '¡Orden registrado!', server.resultado.mensaje);
    } else {
        mostrar_toast('error', '¡Error en el orden!', server.resultado.error)
    }
}

async function eliminar_orden_tipo() {

    let model = { accion: 3, activo: ord_aud_seleccionado };

    let server = await server_tipo_auditoria(model);

    if (server.resultado.result === true) {
        await consultar_orden_auditoria();
        mostrar_toast('success', '¡Eliminación exitosa!', server.resultado.mensaje);
    } else {
        mostrar_toast('error', '¡Error en la eliminación!', server.resultado.error)
    }
}