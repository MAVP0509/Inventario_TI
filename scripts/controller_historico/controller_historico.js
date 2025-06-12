let respuesta_historico

function server_historico(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_historico/controller_historico.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                console.log(response);
                try {
                    resolve(JSON.parse(response))
                    console.log(resolve(JSON.parse(response)))
                    respuesta_historico = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    });
}

function server_inventario02(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_inventario/controller_inventario.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                try {
                    resolve(JSON.parse(response))
                    console.log(resolve(JSON.parse(response)))
                    respuesta_historico = response
                } catch (error) {
                    reject(error)
                    //console.log(error);
                }
            }
        })
    });

}

let dato = [];
let tabla;
async function consultar_historico() {
    //const usuario = JSON.parse(sessionStorage.getItem('user')); // Obtener usuario en sesión
    //const fecha_evento = new Date().toISOString();

    const model = {
        accion: 0,
    };

    let response = await server_historico(model);
    dato = response.resultado

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

    tabla = new Tabulator("#tbl02", {
        locale: "es",
        data: dato,
        pagination: true,
        paginationSize: 15,
        paginationSizeSelector: [5, 10, 15, 25, 35],
        movableColumns: true,
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = tabla.getDataCount(); // Asegúrate que 'tabla' esté accesible
            const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
        rowFormatter: function (row) {
            data = row.getData()
            if (data.seleccionado === true) {
                row.getElement().classList.add("bg-primary")
            } else if (data.seleccionado === false) {
                row.getElement().classList.remove("bg-primary")
            }
        },
        columns: [
            { title: "ID", field: "id" },
            {
                title: "Fecha del evento", field: "fecha_evento", headerMenu: [
                    {
                        label: "Fijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: true });
                            tabla.redraw(true);
                        }
                    },
                    {
                        label: "Desfijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: false });
                            tabla.redraw(true);
                        }
                    }
                ]
            },
            {
                title: "Usuario del evento", field: "usuario_sesion", headerMenu: [
                    {
                        label: "Fijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: true });
                            tabla.redraw(true);
                        }
                    },
                    {
                        label: "Desfijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: false });
                            tabla.redraw(true);
                        }
                    }
                ]
            },
            {
                title: "Evento", field: "evento", headerMenu: [
                    {
                        label: "Fijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: true });
                            tabla.redraw(true);
                        }
                    },
                    {
                        label: "Desfijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: false });
                            tabla.redraw(true);
                        }
                    }
                ]
            },
            { title: "Zona", field: "zona" },
            { title: "Ubicación del dispositivo", field: "ubicacion" },
            { title: "Nombre del usuario", field: "nombre" },
            {
                title: "Numero de serie", field: "num_serie", headerMenu: [
                    {
                        label: "Fijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: true });
                            tabla.redraw(true);
                        }
                    },
                    {
                        label: "Desfijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: false });
                            tabla.redraw(true);
                        }
                    }
                ]
            },
            { title: "Rubro", field: "rubro" },
            { title: "Tipo de dispositivo", field: "tipo" },
            { title: "Modelo del dispositivo", field: "modelo" },
            { title: "Marca del dispositivo", field: "marca" },
            { title: "Activo fijo", field: "af" },
            { title: "TAG", field: "tag" },
            { title: "Fecha de registro", field: "fecha_registro" },
            {
                title: "Estatus", field: "estatus", headerMenu: [
                    {
                        label: "Fijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: true });
                            tabla.redraw(true);
                        }
                    },
                    {
                        label: "Desfijar columna",
                        action: function (e, column) {
                            column.updateDefinition({ frozen: false });
                            tabla.redraw(true);
                        }
                    }
                ]
            },
        ],
        //layout: "fitColumns",
    });
}

async function registrar_historico(evento, params) {
    const usuario = JSON.parse(sessionStorage.getItem('user')); // Obtener usuario en sesión
    //console.log(params);
    //const fecha_evento = new Date().toISOString();
    let model = {
        accion: 1,
        usuario_sesion: usuario.resultado[0] || '', // Nombre del usuario
        evento: evento,
        datos: params

    };

    let resultado = await server_historico(model);
    //console.log(model);
}

async function consultar_num_serie() {
    let input = document.getElementsByName('mdl-hst')
    for (let i = 0; i < input.length; i++) {
        if (input[i].id != "rango-fecha") {
            input[i].value = "";
            input[i].classList.remove('is-invalid');
        }
    }

    await general_select2({
        selectId: 'select-evento',
        tabla: 'historico',
        campo: 'evento',
        placeholder: 'Selecione un evento',
        dropdownParent: '#modal-historial',
        tags: false,
    })
    let opcionNueva = '20';
    let opTexto = 'Todo';

    // Crear la opción (selected = true, defaultSelected = true)
    let nuevaOpcion = new Option(opTexto, opcionNueva, true, true);

    // Agregar al select
    $('#select-evento').prepend(nuevaOpcion).trigger('change');

    $('#his-versiones').empty();
    $('#resultado-historico').addClass('d-none');
    $("#modal-historial").modal('show')
}

async function mostrar_historial() {
    //let evento =  $("#select-evento").select2('data')[0].text
    const validacion = ["his-num-serie"];

    if (!validar_campo(validacion)) {
        mostrar_alerta('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }
    const rango_fecha = $('#rango-fecha').val();
    const [fecha_inicio, fecha_fin] = rango_fecha.split(' - ')
    const model = {
        accion: 0,
        num_serie: $('#his-num-serie').val().trim(),
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        evento: $("#select-evento").select2('data')[0].text,
    };

    let respuesta_historico = await server_historico(model);

    const contenedor = $('#his-versiones');
    contenedor.empty();
    idCollapse = 0
    if (respuesta_historico && respuesta_historico.resultado && respuesta_historico.resultado.length > 0) {
        respuesta_historico.resultado.forEach(registro => {
            var fecha = moment(registro.fecha_evento).local('es').format('D [de] MMMM [de] YYYY, h:mm:ss a');
            //console.log("Datos crudos:", registro.datos);
            //console.log("Tipo de datos:", typeof registro);
            const camposExcluir = ['id', 'fecha_evento', 'usuario_sesion', 'evento'];
            const clavesAmigables = {
                fecha_registro: 'Fecha de registro',
                zona: 'Zona',
                ubicacion: 'Ubicación',
                nombre: 'Nombre del usuario',
                num_serie: 'Número de serie',
                rubro: 'Rubro',
                tipo: 'Tipo',
                marca: 'Marca',
                modelo: 'Modelo',
                af: 'AF',
                tag: 'TAG',
                estatus: 'Estatus'
            };

            let datosTexto = '';
            for (var key in registro) {
                if (!camposExcluir.includes(key)) {  // Si el campo no está en la lista de campos a excluir
                    const claveAmigable = clavesAmigables[key] || key; // Usar la clave amigable o la original si no está definida
                    datosTexto += `<li>${claveAmigable}: ${registro[key]}</li>`;
                }
            }

            const item = `
                <div class="list-group-item">
                    <strong>${fecha}</strong><br>
                    <span>${registro.usuario_sesion}</span><br>
                    <em>${registro.evento}</em><br>
                    <button class="btn btn-sm btn-link p-0 mt-2" data-toggle="collapse" data-target="#collapseId${idCollapse}">
                        Más información
                    </button>

                    <div class="collapse mt-2" id="collapseId${idCollapse}">
                        <ul class="mb-0">
                            ${datosTexto}
                        </ul>
                    </div>
                </div>
            `;
            contenedor.append(item);
            idCollapse++
        });

        $('#resultado-historico').removeClass('d-none');
    } else {
        contenedor.html('<div class="list-group-item">No se encontraron moviemientos para ese número de serie.</div>');
        $('#resultado-historico').removeClass('d-none');
    }
}

function validar_campo(campos) {
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

        /* if (!campo.value.trim()) {
            campo.classList.add('is-invalid'); // Agrega la clase de advertencia
            valido = false;
        } else {
            campo.classList.remove('is-invalid'); // Remueve la clase si el campo es válido
        } */

        campo.addEventListener('input', function () {
            if (campo.value.trim()) {
                campo.classList.remove('is-invalid');
            }
        });
    });

    return valido;
}


//TODO Funciones de los Select2

async function general_select2({ selectId, tabla, campo, placeholder, dropdownParent, tags, popoverTitle, popoverContent }) {
    //try {
    const response = await server_inventario02({
        accion: 5,
        tabla: tabla,
        campo: campo
    });

    //console.log('Respuesta del servidor para select2:', response);

    const opciones = response.resultado.map(item => ({
        id: item.id || '',
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

    //  Si se pasan datos de popover, aplicarlo
    if (popoverTitle && popoverContent) {
        const $select2Container = $select.next('.select2-container');

        $select2Container.attr({
            'data-toggle': 'popover',
            'data-trigger': 'hover',
            'data-html': 'true',
            'title': popoverTitle,
            'data-content': popoverContent
        });

        $select2Container.popover();
    }

}
