let respuesta_historico
function server_historico(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_historico/controller_historico.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response){
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

function server_inventario(model) {
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

    var table = new Tabulator("#tbl01", {
        data: datos.resultado,
        columns: [
            {title: "Id", field: "id"},
            {title: "Fecha", field: "fecha_evento"},
            {title: "Evento", field: "evento"},
            {title: "Zona", field: "zona"},
            {title: "Tipo", field: "tipo"},
            {title: "Usuario", field: "usuario"},
            {title: "Numero de serie", field: "num_serie"},

        ],
        layout: "fitColumns",
    });
}

async function registrar_historico(num_serie, evento) {
    const usuario = JSON.parse(sessionStorage.getItem('user')); // Obtener usuario en sesión
    //const fecha_evento = new Date().toISOString();
    const model = {
        accion: 1,
        usuario: usuario.resultado[0], // Nombre del usuario
        num_serie: num_serie, // Número de serie del dispositivo
        evento: evento,
    };

    let result = await server_historico(model);

}

/* function mostrar_modal_historial(historial) {
    const contenedor = document.getElementById('contenedor-historial');
    contenedor.innerHTML = ''; // Limpiar contenido previo

    historial.forEach(async (h) => {
        // Convertir la fecha del evento a formato legible
        const fecha = new Date(h.fecha_evento).toLocaleString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // Crear los elementos de texto
        const fechaElem = document.createElement('div');
        fechaElem.textContent = fecha;

        const usuarioElem = document.createElement('div');
        usuarioElem.textContent = h.usuario;

        const eventoElem = document.createElement('div');
        eventoElem.textContent = `realizó una ${h.evento.toLowerCase()} con el número de serie ${h.num_serie}.`;

        // Obtener detalles del inventario para el número de serie
        const inventarioDetalles = await obtenerDetallesInventario(h.num_serie);

        // Crear un elemento con detalles adicionales del inventario
        const inventarioElem = document.createElement('div');
        inventarioElem.textContent = `Detalles del inventario: ${inventarioDetalles}`;

        // Agregar los elementos al contenedor
        contenedor.appendChild(fechaElem);
        contenedor.appendChild(usuarioElem);
        contenedor.appendChild(eventoElem);
        contenedor.appendChild(inventarioElem);
        contenedor.appendChild(document.createElement('hr')); // Línea separadora entre eventos
    });

    // Mostrar el modal
    $("#modal-historial").modal('show');
}

async function obtenerDetallesInventario(num_serie) {
    const modal = {
        accion: 2,
        num_serie: num_serie
    }

    let respuesta = await server_inventario(model);

    if (respuesta && respuesta.length > 0) {
        // Obtener los detalles relevantes del inventario
        const inventario = respuesta[0]; 
        return `Tipo: ${inventario.tipo}, Marca: ${inventario.marca}, Ubicación: ${inventario.ubicacion}`;
    } else {
        return 'No se encontraron detalles de inventario para este número de serie.';
    }
} */

