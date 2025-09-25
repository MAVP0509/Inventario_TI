function server_tipo_mantenimiento(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_conf_tipo_mantenimiento/controller_conf_tipo_mantenimiento.php",
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

let datos_orden = []
let table_orden

async function consultar_orden_tipo(params) {

    let server = await server_tipo_mantenimiento({ accion: 0 });

    datos_orden = server.resultado;

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

    table_orden = new Tabulator('#tbl-orden-tp', {
        locale: "es",
        data: datos_orden,
        layout: "fitColumns",
        movableRows: true,
        pagination: "local",
        paginationSize: 10,
        paginationSizeSelector: [5, 10, 15, 20],
        columns: [
            { title: "Tipos de activos", field: "tipo" },
        ],
    })

}

async function mdl_nuevo_orden_tipo(params) {

    await general_select2({
        selectId: "slc-orden-tp",
        tabla: "cat_tipo",
        campo: "tipo",
        dropdownParent: "#mdl-tipo-mant",
        placeholder: "Seleccione un tipo de dispositivo"
    })

    $("#mdl-btn-orden-tp").off("click").on("click", function () { nuevo_orden_tipo() })
    $("#mdl-tipo-mant").modal("show");
}

async function nuevo_orden_tipo(params) {

    /* const validar = ["slc-orden-tipo"]

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    } */

    let model = { accion: 1, dispositivo: $("#slc-orden-tp").val() }

    let server = await server_tipo_mantenimiento(model);

    if (server.resultado === true) {
        mostrar_toast('success', '¡Registro exitoso!', 'El registro se realizo corrctamente.');
        $('#mdl-tipo-mant').modal("hide");
    } else {
        mostrar_toast('error', '¡Error en el registro!', 'No se pudo realizar el registro. Intentelo nuevamente.')
    }
}