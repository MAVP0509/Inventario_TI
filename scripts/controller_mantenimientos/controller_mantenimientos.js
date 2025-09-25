function server_mantenimiento(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_mantenimientos/controller_mantenimientos.php",
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
function server_excel(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_excel/controller_excel.php",
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

let datos_mantenimiento = []
let elemento_mnt
let table
let gruposAbiertosKey = "grupos_abiertos_mantenimientos";
let gruposRestaurados = false;

function guardarEstadoDeGrupos() {
    const abiertos = table.getGroups()
        .filter(group => group.isVisible())
        .map(group => group.getKey());
    localStorage.setItem(gruposAbiertosKey, JSON.stringify(abiertos));
}

function restaurarEstadoDeGrupos() {
    if (gruposRestaurados) return;

    const abiertos = JSON.parse(localStorage.getItem(gruposAbiertosKey) || "[]");
    let intentos = 0;
    const maxIntentos = 30;

    const intervalo = setInterval(() => {
        intentos++;
        const grupos = table.getGroups();

        if (grupos.length === 0) return; // no hay grupos todavía

        // Intentar abrir todos los grupos que están en 'abiertos'
        abiertos.forEach(key => {
            const grupo = grupos.find(g => g.getKey() === key);
            if (grupo) {
                grupo.show();
            }
        });

        // Verificar si todos los grupos ya están abiertos
        const todosAbiertos = abiertos.every(key => {
            const grupo = grupos.find(g => g.getKey() === key);
            return grupo && grupo.isVisible();
        });

        if (todosAbiertos || intentos >= maxIntentos) {
            gruposRestaurados = true;
            clearInterval(intervalo);
        }

    }, 100);
}

async function consultar_informacion() {

    let server = await server_mantenimiento({ accion: 0 })
    datos_mantenimiento = server.resultado
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

    let editIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return `<button type='button' class='btn btn-warning icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Información' onclick=''><i class='fa-solid fa-circle-info fa-lg'></i></button>`;
    }

    let uploadIcon = function (cell, formatterParams, onRendered) {
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return `<button type='button' class='btn btn-info icon' data-animation="true" data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Subir reporte firmado' data-widget="control-sidebar" data-slide="true" ><i class='fa-solid fa-upload fa-lg'></i></button>`;
    }

    let fileIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return "<button type='button' class='btn btn-success icon' data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Reporte de mantenimiento' onclick=''><i class='fa-solid fa-file-excel fa-lg'></i></button>";
        
    }

    let eyeIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return "<button type='button' class='btn btn-lock btn-outline-dark icon' onclick=''><i class='fa-solid fa-eye '></i></button>";
    }

    let mailIcon = function (cell, formatterParams, onRendered) { //plain text value
        onRendered(function () {
            $(cell.getElement()).find('[data-toggle="popover"]').popover()
        })
        return "<button type='button' class='btn btn-lock btn-danger envelope' data-animation='true' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='bottom' data-content='Enviar correo'><i class='fa-solid fa-envelope '></i></button>";
    }

    let menuEstatus = [
        {
            label: `<i class="fa-solid fa-circle" style="color: #28a745;"></i> Realizado`
        },
        { label: `<i class="fa-solid fa-circle" style="color: #0385ffff;"></i> En proceso` },
        {
            label: `<i class="fa-solid fa-circle" style="color: #ff7300;"></i> Pendiente`
        },
        {
            label: `<i class="fa-solid fa-circle fa-beat-fade" style="color: #dc3545;"></i> Vencido`
        },
    ]

    table = new Tabulator('#tbl01', {
        locale: "es",
        data: datos_mantenimiento,
        layout: "fitColumns",              //fit columns to width of table
        movableColumns: true,              //allow column order to be changed
        paginationButtonCount: 3,
        groupBy: function (data) {
            // Asegura que tenga formato YYYY-MM
            const [año, mes] = data.fecha.split("-");
            // Creamos una fecha con día explícito
            const fecha = new Date(`${año}-${mes}-01T00:00:00`);
            const opciones = { year: 'numeric', month: 'long' };
            return fecha.toLocaleDateString('es-ES', opciones);
        },
        groupStartOpen: false,
        groupToggleElement: "header", //* Permite que dando click en cualquier parte del header group, éste se despliegue
        //headerVisible: false,
        dataGrouped: function (groups) {
            restaurarEstadoDeGrupos();
        },
        renderComplete: function () {
            restaurarEstadoDeGrupos()
        },
        columns: [
            {
                title: "Fecha", field: "fecha", width: 115, headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input", sorter: "date",
            },
            {
                title: "Tipo",
                field: "tipo", width: 130, headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input",
                formatter: function (cell, formatterParams, onRendered) {
                    let data = cell.getData();
                    return `${data.tipo}<br><small>${data.marca}<br><small>${data.modelo}`;
                }
            },
            {
                title: "Número de serie",
                field: "num_serie", headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input"

            },
            {
                title: "Usuario",
                field: "usuario", headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "input",
                formatter: function (cell, formatterParams, onRendered) {
                    let data = cell.getData(); // Obtiene toda la fila
                    return `${data.usuario}<br><small>${data.cargo}</small>`;
                }

            },
            {
                title: "Ubicación",
                field: "ubicacion", headerHozAlign: "center", headerSort: false, hozAlign: "center", headerFilter: "list",
                headerFilterParams: {
                    valuesLookup: true, clearable: true,
                }

            },
            {
                title: "Estatus",
                field: "estado", hozAlign: "center", formatter: "lookup", headerHozAlign: "center", formatter: "lookup", width: 150,
                headerFilterParams: {
                    valuesLookup: true, clearable: true,
                },
                headerMenu: menuEstatus,
                headerMenuIcon: '<i class="fa-solid fa-circle-question"></i>',
                formatterParams: {
                    "Pendiente": `<i class="fa-solid fa-circle" style="color: #ff7300;"></i> Pendiente`,
                    "En proceso": `<i class="fa-solid fa-circle" style="color: #0385ffff;"></i> En proceso`,
                    "Realizado": `<i class="fa-solid fa-circle" style="color: #28a745;"></i> Realizado`,
                    "Vencido": `<i class="fa-solid fa-circle fa-beat-fade" style="color: #dc3545;"></i> Vencido`,
                },
                headerFilter: "list",
                headerFilterParams: {
                    valuesLookup: true, clearable: true,
                }, headerSort: false,

            },
            {
                formatter: mailIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento_mnt = cell.getRow().getData();

                },
            },
            {
                formatter: fileIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento_mnt = cell.getRow().getData();
                    mdl_reporte_mantenimiento(elemento_mnt);
                    // reporte_mantenimiento(elemento_mnt);
                }
            },
            {
                formatter: uploadIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento_mnt = cell.getRow().getData();
                    abrir_subir_reporte(elemento_mnt.id)
                }
            },

            {
                formatter: eyeIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento_mnt = cell.getRow().getData();
                    //mdl_mantenimiento_info(elemento_mnt);
                }
            },
            {
                formatter: editIcon, width: 70, hozAlign: "center", frozen: true, headerSort: false,
                cellClick: function (e, cell) {
                    elemento_mnt = cell.getRow().getData();
                    mdl_mantenimiento_info(elemento_mnt);
                }
            },
        ],



    })
    // Guarda cuando se expande o colapsa un grupo
    table.on("groupVisibilityChanged", guardarEstadoDeGrupos);

    // Verificar cada 100ms hasta que los grupos existan, máximo por 3 segundos
    const intentoMax = 30;
    let intento = 0;
    const timer = setInterval(() => {
        intento++;
        if (!gruposRestaurados) {
            restaurarEstadoDeGrupos();
        }
        if (gruposRestaurados || intento >= intentoMax) {
            clearInterval(timer);
        }
    }, 100);

}

let tabla_tipos
let tipos
let orden_tipos = []

async function consultar_orden_tipo() {

    let server = await server_mantenimiento({ accion: 2 });

    orden_tipos = server.resultado

    tabla_tipos = new Tabulator('#tbl-tipos', {
        movableRows: true,
        data: orden_tipos,
        columns: [
            { title: "Tipos de activos", field: "tipo" },
        ],
    })

}

async function mdl_programar_mantenimiento() {

    /* tipos = Array.from(
        new Map(
            datos_mantenimiento.map(item => [item.tipo_id, { tipo_id: item.tipo_id, tipo: item.tipo }])
        ).values()
    );

    // orden_tipos = tipos.map(t => t.tipo_id)

    // console.log(tipos)
    tabla_tipos = new Tabulator('#tbl-tipos', {
        movableRows: true,
        data: tipos,
        columns: [
            { title: "Tipos de activos", field: "tipo" },
        ],
         rowMoved: function (row) {
            let orden = tabla_tipos.getData();
            orden_tipos = orden.map(r => r.tipo_id);
        } 
    }) */

    // await consultar_orden_tipo()

    await Promise.all([
        general_select2({
            selectId: 'select-elaboro',
            tabla: 'supervisor',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'select-cg-elaboro',
            tabla: 'supervisor',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            sincronizarCon: 'select-elaboro',
            sincronizarCampo: 'cargo'
        }),

        general_select2({
            selectId: 'select-autorizo',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'select-cg-autorizo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-mant',
            tags: false,
            sincronizarCon: 'select-autorizo',
            sincronizarCampo: 'cargo'
        }),
    ])

    rellenar_select("Alejandro Cancino Arguello", "select-elaboro")

    $('#select-cg-elaboro, #select-cg-autorizo').prop('disabled', true)

    $('#mdl-prog-mant').modal("show")
}

async function programar_mantenimiento() {

    const validar = ['select-elaboro', 'select-autorizo']

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    // const orden_actual = tabla_tipos.getData().map(r => parseInt(r.tipo_id));

    let model = {
        accion: 3,
        elaboro: $('#select-elaboro').select2('data')[0].text,
        cg_elaboro: $('#select-cg-elaboro').select2('data')[0].text,
        autorizo: $('#select-autorizo').select2('data')[0].text,
        cg_autorizo: $('#select-cg-autorizo').select2('data')[0].text,
        // tipo: orden_actual
    }

    mostrar_toast_cargando()

    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url;
        mostrar_toast('success', '¡Programa de mantenimiento exitosa!', 'Rellena los campos. Inténtelo nuevamente.');
        $('#mdl-prog-mant').modal("hide");
    } else if (server.resultado.result === false) {
        mostrar_toast('error', 'Error', 'No se pudo realizar el programa de mantenimiento. Inténtalo nuevamente.');
    } else if (server.resultado.duplicado === false) {
        mostrar_toast('error', '¡Error!', 'Ya existe un programa de mantenimiento para el año');
    }

}

let selecreg
async function mdl_mantenimiento_info(elemento_mnt) {
    // Busca en el arreglo 'datos_mantenimiento' el registro con el mismo id_equipo
    for (let i = 0; i < datos_mantenimiento.length; i++) {
        const element = datos_mantenimiento[i];
        if (element.id === elemento_mnt.id && element.anio === elemento_mnt.anio) {
            // Guarda el registro completo en una variable global
            selecreg = element;
            // console.log(selecreg)
            break;
        }
    }
    // Llama a varias funciones para cargar los selects con datos dinámicos
    await Promise.all([
        general_select2({
            selectId: 'select-rubro',
            tabla: 'cat_rubro',
            campo: 'rubro',
            placeholder: 'Selecione un rubro',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Categoría general del activo. Agrupa dispositivos por su tipo funcional, como computadoras, dispositivos móviles, etc."
        }),

        general_select2({
            selectId: 'select-tipo',
            tabla: 'cat_tipo',
            campo: 'tipo',
            placeholder: 'Selecione un tipo',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'select-marca',
            tabla: 'cat_marca',
            campo: 'marca',
            placeholder: 'Seleccione una marca',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Es la marca del activo."
        }),

        general_select2({
            selectId: 'select-ubicacion',
            tabla: 'inventario_ti_sur',
            campo: 'ubicacion',
            placeholder: 'Selecciona una ubicacion',
            dropdownParent: '#mdl-mant-info',
            tags: true,
            popoverTitle: "Descripción",
            popoverContent: "Indica el lugar específico dentro de la zona donde se encuentra físicamente el dispositivo."
        }),

        general_select2({
            selectId: 'select-usuario',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'NA',
            dropdownParent: '#mdl-mant-info',
        }),

        general_select2({
            selectId: 'select-cargo',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'NA',
            dropdownParent: '#mdl-mant-info',
            sincronizarCampo: 'cargo',
            sincronizarCon: 'select-usuario'
        }),
    ])

    rellenar_select(selecreg.usuario, "select-usuario");
    rellenar_select(selecreg.cargo, 'select-cargo')
    rellenar_select(selecreg.tipo, "select-tipo");
    rellenar_select(selecreg.marca, "select-marca");
    rellenar_select(selecreg.ubicacion, "select-ubicacion");
    rellenar_select(selecreg.rubro, "select-rubro")
    $('#inp-modelo').val(selecreg.modelo)
    $('#inp-num-serie').val(selecreg.num_serie)
    $('#inp-fecha').val(selecreg.fecha)
    $('#inp-estatus').val(selecreg.estado)

    switch (selecreg.estado) {
        case "Pendiente":
            $('#estatus-icon').css('color', '#ff7300')
            break;
        case "En proceso":
            $('#estatus-icon').css('color', '#0385ffff')
            break;
        case "Realizado":
            $('#estatus-icon').css('color', '#28a745')
            break;
        case "Vencido":
            $('#estatus-icon').css('color', '#dc3545')
            break;
        default:
            $('#estatus-icon').css('color', '')
            break;
    }

    $('#mdl-mant-info').modal("show")
}

async function mdl_reporte_mantenimiento(elemento_mnt) {

    await general_select2({
        selectId: 'slc-encargado',
        tabla: 'cat_usuarios',
        campo: 'nombre',
        dropdownParent: '#mdl-reporte-mant',
        placeholder: 'Seleccione un encargado'
    })

    rellenar_select("César Ignacio Torres Almeida", "slc-encargado");
    $("#btn-reporte-mant").off('click').on('click', function () { reporte_mantenimiento(elemento_mnt) })
    $("#mdl-reporte-mant").modal("show");
}

async function reporte_mantenimiento(elemento_mnt) {
    // console.log(elemento_mnt)
    let model = {
        accion: 4,
        elementos: elemento_mnt,
        encargado: $("#slc-encargado").select2('data')[0].text
    }

    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url;
        $('#mdl-reporte-mant').modal("hide");
        mostrar_toast('success', '¡Generación de reporte exitoso!', 'La generación de reporte de mantenimiento se ha realizado correctamente.');
    } else {
        mostrar_toast('error', '¡Error!', 'No se pudo generar el reporte de mantenimiento. Inténtelo nuevamente.');
    }
}

//? Inicializar popover
$(function () {
    $('[data-toggle="popover"]').tooltip()
})

function rellenar_select(texto, select) {
    let textoBuscado = texto;
    let $select = $('#' + select);

    $select.find('option').filter(function () {
        return $(this).text().trim() === textoBuscado;
    }).prop('selected', true);

    $select.trigger('change');
}


//todo Subida de reportes de mantenimiento
FilePond.registerPlugin(FilePondPluginFileValidateType);


let pond
//* Variable utilizada para guardar temporalmente el archivo y asi poder ser eliminado desde otra función
let fileItemCargado
function abrir_subir_reporte(id) {
    //*Escondiendo el visor de pdf
    $('#ver-pdf-reporte').hide()

    if (pond) {
        pond.destroy();   //* <- Esto destruye la instancia anterior, lo cual es necesario
    }

    //* Al destruir la instancia es necesario colocarle de nuevo el name al input, sino, no aceptará el archivo el php
    $('#subir-reporte').attr('name', 'reporte_mantenimiento');

    let fileResguardo = document.getElementById('subir-reporte')

    // Create a FilePond instance
    pond = FilePond.create(fileResguardo, {
        maxFiles: 1,
        labelIdle: 'Arrastra y suelta tu archivo .pdf o <span class="filepond--label-action"> Examina </span>',
        allowMultiple: false,
        dropOnPage: true,
        dropValidation: true,
        instantUpload: false,
        acceptedFileTypes: ['application/pdf'],
        labelFileTypeNotAllowed: 'Archivo no válido solo .pdf',
        server: {
            process: {
                url: "database/controller_mantenimientos/controller_mantenimientos.php",
                method: 'POST',
                name: 'reporte_mantenimiento',
                withCredentials: false,
                ondata: (formData) => {
                    const trama = {
                        accion: 1,
                        id_equipo: id,
                    };
                    formData.append('trama', JSON.stringify(trama));
                    return formData;
                },
                onload: (response) => {
                    try {
                        const data = JSON.parse(response); // <- convierte string en objeto
                        if (data.resultado.error) {
                            //console.error("Error del servidor:", data.resultado.error);
                            mostrar_toast("error", "Error", data.resultado.error);
                        } else {
                            mostrar_toast("success", "Subido", data.resultado.mensaje)

                            pond.removeFile();
                        }

                    } catch (e) {
                        console.error("Error al parsear respuesta:", e);
                    }
                },
                onerror: (error) => {
                    console.error('Error al subir:', error);
                    alert("Error al subir archivo.");
                }
            },
        }


    });


    //* Mostrando pdf cuando se suba
    let fileToOpen;

    pond.on('addfile', (error, fileItem) => {
        if (error) {
            mostrar_toast('error', 'Error', 'Error al cargar PDF:' + error);
            return;
        }

        fileItemCargado = fileItem; // <-- guardar archivo

        // Generar URL temporal para el archivo PDF
        fileToOpen = URL.createObjectURL(fileItem.file);

        const viewer = document.getElementById('pdf-reporte-viewer');
        viewer.src = fileToOpen;

        $('#ver-pdf-reporte').show()

    });
}

//*Funcion para remover el archivo del filepond cuando se cierre el control-sidebar
function remover_archivo() {
    if (pond && fileItemCargado) {
        pond.removeFile(fileItemCargado);
        fileItemCargado = null;
    }
}

//* Escondiendo el boton de ver pdf cuando el archivo haya sido removido del filePond
document.addEventListener('FilePond:removefile', (e) => {
    $('#ver-pdf-reporte').hide()
})