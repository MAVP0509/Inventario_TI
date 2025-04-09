let respuesta
function server_usuario(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_usuario/controller_usuario.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                try {
                    resolve(JSON.parse(response))
                    respuesta = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

//variable global
let usuario = [];

$('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
  })

  let modal = $('#mdl-rs')

async function consultar_informacion() {

    let model = {
        accion: 2
    };

    let response = await server_usuario(model);
    console.log(response);
    usuario = response.resultado;

    let tblBody = $("#tbl-body-info");
    tblBody.empty();
    let row = ""

    for (let i = 0; i < usuario.length; i++) {
        row += `<tr>
                    <td>
                        <div class="form-group form-check">
                            <input type="checkbox" class="form-check-input check-change" 
                            onclick="seleccionar_usuario(${usuario[i].id})" 
                            value="${usuario[i].id}" id="Check${usuario[i].id}">
                        </div>
                    </td>
                    <td >${i + 1}</td>
                    <td>${usuario[i].nombre}</td>
                    <td>${usuario[i].correo}</td>
                    <td>${usuario[i].edad}</td>
                    <td>${usuario[i].telefono}</td>
                    <td>${usuario[i].fecha_nac}</td>
                    <td>${usuario[i].fecha_reg}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editar_usuario(${usuario[i].id})">Editar</button>
                    </td>
                </tr>`;
    }
    //tblBody.append(`<tr><td colspan="6">No se encontraron usuarios.</td></tr>`) //function consultar informacion
    //<td>
    //<button class="btn btn-danger btn-sm" onclick="eliminar_usuario(${usuario[i].id})">Eliminar</button>
    //</td>
    tblBody.append(row); //function consultar informacion
}

async function editar_usuario(params) {
    let model = {
        accion: 1,
        id: id,
        nombre: nombre,
        correo: correo,
        edad: edad,

    }

    let response = await server_usuario(model);
}

let usuSeleccionado = [];

async function seleccionar_usuario(params) {

    let index = usuSeleccionado.indexOf(params); // Retorna el primer índice en el que se puede encontrar un elemento dado en el array,
    if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
        usuSeleccionado.push(params); // Añade uno o más elementos al final de un array
    } else {
        usuSeleccionado.splice(index, 1); 
    }

}


async function eliminar_usuario() {

    if (usuSeleccionado.length === 0) {
        alert("Por favor, selecciona al menos un usuario para eliminar.");
        return;
    }

    if (!confirm(`¿¿Estás seguro de que deseas eliminar ${usuSeleccionado.length} usuario(s)?`)) {
        return;
    }

        let model = {
            accion : 4,
            id : usuSeleccionado
        }

        let response = await server_usuario(model);
        
        if (response.resultado) {
            alert("usuario eliminado exitosamente");
            usuSeleccionado = [];
            consultar_informacion();
        } else {
            alert("Hubo un error al eliminar el usuario");
        }
        
    }



