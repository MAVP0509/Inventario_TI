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
                //console.log(response);
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

let dato = [];  // Arreglo que almacena los datos del historico
let tabla;  // Instancias de la tabla Tabulator
//* Función asíncrona que consulta el histórico y construye la tabla
async function consultar_historico() {
    // Modelo de datos que se enviará al backend
    const model = {
        accion: 0,
    };

    let response = await server_historico(model);   // Se envía la petición al servidor y se espera la respuesta
    dato = response.resultado   // Se asignan los datos recibidos a la variable global
    // Se configura el idioma español para Tabulator
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
    // Se crea la tabla Tabulator sobre el elemento con id "tbl02"
    tabla = new Tabulator("#tbl02", {
        locale: "es",   // Idioma configurado
        data: dato, // Datos a mostrar en la tabla
        pagination: true,   // Habilita paginación
        height: "800px",    // Altura de la tabla
        paginationSize: 15, // Registros por página
        paginationSizeSelector: [5, 10, 15, 25, 35],    // Opciones de tamaño de página
        movableColumns: true,   // Permite mover columnas
        // Función personalizada para mostrar el contador de registros
        paginationCounter: function (pageSize, currentRowStart, currentRowEnd, currentPage) {
            const totalRows = tabla.getDataCount(); // Asegúrate que 'tabla' esté accesible
            const end = Math.min(currentRowStart + pageSize - 1, totalRows);
            return `Mostrando del ${currentRowStart} al ${end} de ${totalRows} registros`;
        },
        // Formateador de filas según su estado
        rowFormatter: function (row) {
            data = row.getData()    // Obtiene los datos de la fila
            if (data.seleccionado === true) {    // Si está marcada como seleccionada, pinta la fila
                row.getElement().classList.add("bg-primary")
            } else if (data.seleccionado === false) {   // Si no está seleccionada, quita el color
                row.getElement().classList.remove("bg-primary")
            }
        },
        columns: [  // Definición de columnas
            {
                title: "Fecha del evento", field: "fecha_evento", headerSort: false, headerHozAlign: "center", headerFilter: "input", headerMenu: [
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
                title: "Usuario del evento", field: "usuario_sesion", headerSort: false, headerHozAlign: "center", headerFilter: "list",
                headerFilterParams: {
                    valuesLookup: true, clearable: true // se auto genera a partir de los valores únicos de la columna
                },
                headerMenu: [
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
                title: "Evento", field: "evento", headerSort: false, headerHozAlign: "center", headerFilter: "list",
                headerFilterParams: {
                    valuesLookup: true, clearable: true // se auto genera a partir de los valores únicos de la columna
                },
                headerMenu: [
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
            { title: "Zona", field: "zona", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            { title: "Ubicación del dispositivo", field: "ubicacion", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            { title: "Nombre del usuario", field: "nombre", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            {
                title: "Numero de serie", field: "num_serie", headerSort: false, headerHozAlign: "center", headerFilter: "input", headerMenu: [
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
            { title: "Rubro", field: "rubro", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            { title: "Tipo de dispositivo", field: "tipo", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            { title: "Modelo del dispositivo", field: "modelo", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            { title: "Marca del dispositivo", field: "marca", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            { title: "IMEI", field: "imei", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            { title: "Linea", field: "linea", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            { title: "Activo fijo", field: "af", headerHozAlign: "center", headerSort: false, headerFilter: "input" },
            { title: "TAG", field: "tag", headerHozAlign: "center", headerSort: false, headerFilter: "input" },
            { title: "Fecha de asignación", field: "fecha_registro", headerSort: false, headerHozAlign: "center", headerFilter: "input" },
            {
                title: "Estatus", field: "estatus", headerSort: false, headerFilter: "list",
                headerFilterParams: {
                    valuesLookup: true, clearable: true // se auto genera a partir de los valores únicos de la columna
                },
                headerMenu: [
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
    });
    // Se obtiene el input del buscador
    let searchInput = document.getElementById("buscador-tabla-historico")
    // Evento que se ejecuta cada vez que el usuario escribe
    searchInput.addEventListener("keyup", function () {
        // Texto que el usuario escribe en el buscador
        let query = searchInput.value.toLowerCase();
        // Función de filtro personalizada
        tabla.setFilter(function (data) {
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

//* Función que registra un evento en el histórico del sistema
async function registrar_historico(evento, params) {
    // Obtiene el usuario almacenado en sessionStorage y lo convierte a objeto JavaScript
    const usuario = JSON.parse(sessionStorage.getItem('user'));
    // Objeto que se enviará al servidor con la información del evento
    let model = {
        accion: 1,
        usuario_sesion: usuario.resultado[0] || '', // Nombre del usuario que ejecuta la acción (o cadena vacía si no existe)
        evento: evento, // Descripción del evento ocurrido
        datos: params   // Datos de los activos

    };
    // Envía el objeto al servidor para guardar el registro en la base de datos
    await server_historico(model);
}

//* Función que prepara el formulario para consultar por número de serie
async function consultar_num_serie() {
    // Obtiene todos los elementos que tengan el nombre 'mdl-hst'
    let input = document.getElementsByName('mdl-hst');
    // Recorre cada uno de los inputs obtenidos
    for (let i = 0; i < input.length; i++) {
        // Verifica que el input no sea el de rango de fechas
        if (input[i].id != "rango-fecha") {
            input[i].value = "";
            input[i].classList.remove('is-invalid');
        }
    }
    // Inicializa el select usando datos del historico
    await general_select2({
        selectId: 'select-evento',  // ID del select a inicializar
        tabla: 'historico', // Tabla de donde se obtienen los datos
        campo: 'evento',    // Campo que se usará como opciones
        placeholder: 'Selecione un evento', // Texto por defecto del select
        dropdownParent: '#modal-historial', // Define que el desplegable esté dentro del modal
        tags: false,    // Desactiva la creación de nuevos valores
    })

    let opcionNueva = '20'; // Valor que representará la opción "Todo"
    let opTexto = 'Todo';   // Texto que se mostrará en la opción
    // Crea una nueva opción con texto y valor, marcada como seleccionada por defecto
    let nuevaOpcion = new Option(opTexto, opcionNueva, true, true);
    // Inserta la opción "Todo" al inicio del select y dispara el evento change
    $('#select-evento').prepend(nuevaOpcion).trigger('change');
    // Vacía el contenedor donde se mostrarán las versiones del historial
    $('#his-versiones').empty();
    $('#resultado-historico').addClass('d-none');   // Oculta el contenedor del resultado del histórico
    $("#modal-historial").modal('show');  // Muestra el modal del historial al usuario
}

//* Función que obtiene y muestra el historial de un equipo por número de serie
async function mostrar_historial() {

    const validacion = ["his-num-serie"];   // Arreglo con los IDs de los campos que se deben validar

    if (!validar_campos(validacion)) {  // Valida que los campos requeridos estén completos
        mostrar_toast('warning', 'Alerta', 'Rellena los campos. Inténtelo nuevamente.');
        return; // Detiene la ejecución de la función
    }
    const rango_fecha = $('#rango-fecha').val();    // Obtiene el valor del input de rango de fechas
    const [fecha_inicio, fecha_fin] = rango_fecha.split(' - '); // Separa la fecha inicial y final usando el separador " - "
    // Construye el objeto que se enviará al servidora
    const model = {
        accion: 0,
        num_serie: $('#his-num-serie').val().trim(),
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        evento: $("#select-evento").select2('data')[0].text,
        limite: true,   // Indica que se aplique límite de resultados
    };
    // Envía el modelo al servidor y espera la respuesta
    let respuesta_historico = await server_historico(model);
    // Obtiene el contenedor donde se mostrarán los resultados
    const contenedor = $('#his-versiones');
    contenedor.empty(); // Limpia el contenido anterior del contenedor
    idCollapse = 0  // Inicializa el contador para los IDs de los collapses
    // Verifica que la respuesta exista y tenga resultados
    if (respuesta_historico && respuesta_historico.resultado && respuesta_historico.resultado.length > 0) {
        // Recorre cada registro del historial
        respuesta_historico.resultado.forEach(registro => {
            // Formatea la fecha del evento a un formato legible en español
            var fecha = moment(registro.fecha_evento).locale('es').format('D [de] MMMM [de] YYYY, h:mm:ss a');
            // Lista de campos que no se deben mostrar en el detalle
            const camposExcluir = ['id', 'fecha_evento', 'usuario_sesion', 'evento'];
            // Diccionario para mostrar nombres más amigables en pantalla
            const clavesAmigables = {
                fecha_registro: 'Fecha de asignación',
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

            let datosTexto = '';    // Variable donde se construirá el HTML con los datos del registro
            // Recorre cada campo del registro
            for (var key in registro) {
                if (!camposExcluir.includes(key)) {  // Si el campo no está en la lista de campos a excluir
                    const claveAmigable = clavesAmigables[key] || key;  // Usar la clave amigable o la original si no está definida
                    datosTexto += `<li>${claveAmigable}: ${registro[key]}</li>`;    // Agrega el campo y su valor como un elemento de lista
                }
            }
            // Construye el bloque HTML que se mostrará en pantalla
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
            contenedor.append(item);    // Agrega el item al contenedor principal
            idCollapse++    // Incrementa el ID del collapse para el siguiente registro
        });
        $('#resultado-historico').removeClass('d-none');    // Muestra el contenedor del resultado del historial
    } else {
        // Si no hay resultados, muestra un mensaje informativo
        contenedor.html('<div class="list-group-item">No se encontraron moviemientos para ese número de serie.</div>');
        // Muestra el contenedor del resultado del historial
        $('#resultado-historico').removeClass('d-none');
    }
}