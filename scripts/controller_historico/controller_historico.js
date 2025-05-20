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
                    console.log(error);
                }
            }
        })
    });

}

async function consultar_historico() {
    //const usuario = JSON.parse(sessionStorage.getItem('user')); // Obtener usuario en sesión
    //const fecha_evento = new Date().toISOString();

    const model = {
        accion: 0,
    };

    let datos = await server_historico(model);

    var table = new Tabulator("#tbl02", {
        data: datos.resultado,
        columns: [
            { title: "Id", field: "id" },
            { title: "Fecha del evento", field: "fecha_evento" },
            { title: "Usuario del evento", field: "usuario_sesion" },
            { title: "Evento", field: "evento" },
            { title: "Zona", field: "zona" },
            { title: "Ubicación del dispositivo", field: "ubicacion" },
            { title: "Nombre del usuario", field: "usuario" },
            //{ title: "Cargo del usaurio ", field: "cargo" },
            { title: "Numero de serie", field: "num_serie" },
            { title: "Rubro", field: "rubro" },
            { title: "Tipo de dispositivo", field: "tipo" },
            { title: "Modelo del dispositivo", field: "modelo" },
            { title: "Marca del dispositivo", field: "marca" },
            { title: "Activo fijo", field: "af" },
            { title: "TAG", field: "tag" },
            { title: "Fecha de registro", field: "fecha_registro" },
        ],
        //layout: "fitColumns",
    });
}

async function registrar_historico(evento, params) {
    const usuario = JSON.parse(sessionStorage.getItem('user')); // Obtener usuario en sesión
    //console.log(params);
    //const fecha_evento = new Date().toISOString();
    const model = {
        accion: 1,
        usuario_sesion: usuario.resultado[0] || '', // Nombre del usuario
        evento: evento,
        datos: params
        /* num_serie: params.num_serie || '',
        
        zona: params.zona || '',
        ubicacion: params.ubicacion || '',
        usuario: params.usuario || '',
        cargo: params.cargo || '',
        af: params.af || '',
        rubro: params.rubro || '',
        tipo: params.tipo || '',
        marca: params.marca || '',
        modelo: params.modelo || '',
        tag: params.tag || '',
        // Si no hay fecha_registro, manda null para que el backend lo maneje
        fecha_registro: params.fecha_registro || params.fecha_entrega || null */

    };

    let resultado = await server_historico(model);
    console.log(model);
}

function consultar_num_serie() {
    let input = document.getElementsByName('mdl-hst')
    for (let i = 0; i < input.length; i++) {
        input[i].value = "";
        input[i].classList.remove('is-invalid');

    }

    $("#modal-historial").modal('show')
}

async function mostrar_historial() {
    const validacion = ["his-num-serie"];

    if (!validar_campo(validacion)) {
        mostrar_alerta('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    const model = {
        accion: 0,
        num_serie: $('#his-num-serie').val().trim(),
        fecha_inicio: $('#fecha-inicio').val(),
        fecha_fin: $('#fecha-fin').val(),
    };

    let respuesta_historico = await server_historico(model);

    const contenedor = $('#his-versiones');
    contenedor.empty();

    if (respuesta_historico && respuesta_historico.resultado && respuesta_historico.resultado.length > 0) {
        respuesta_historico.resultado.forEach(registro => {
            var fecha = moment(registro.fecha_evento).local('es').format('D [de] MMMM [de] YYYY, h:mm:ss a');

            const item = `
                <div class="list-group-item">
                    <strong>${fecha}</strong><br>
                    <span>${registro.usuario_sesion}</span><br>
                    <em>${registro.evento} en los campos ${registro.zona}, ${registro.ubicacion}, ${registro.usuario}</em>
                </div>
            `;
            contenedor.append(item);
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
