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
    let usuario = response.resultado;

    let tblBody = $("#tbl-body-info");
    tblBody.empty();
    let row = ""

    for (let i = 0; i < usuario.length; i++) {
        row += `<tr>
                    <td>
                        <div class="form-group form-check">
                            <input type="checkbox" class="form-check-input check-change" onclick="eliminar_usuario(${usuario[i].id})" value="${usuario[i].id}" id="Check${usuario[i].id}">
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

let usuSelect = ""
async function selecionar_usuario(params) {

    for (let i = 0; i < usuario.length; i++) {
        const element = usuario[i];
        if (element.id == params.value) {
            usuSelect = element;
            break;
            
        }
        
    }

    document.getElementById("nombre").value = usuSelect.nombre;
    document.getElementById("correo").value = usuSelect.correo;    
    document.getElementById("edad").value = usuSelect.edad;    
    document.getElementById("telefono").value = usuSelect.telefono;
    document.getElementById("fecha-n").value = usuSelect.fecha_nac;
    document.getElementById("fecha-r").value = usuSelect.fecha_reg;    
}

let selectedUsers = [];

async function eliminar_usuario(id) {

    /* let selectusu =

        let model = {
            accion : 4,
            id : id
        }

        let response = await server_usuario(model);
        
        if (condition) {
            alert("usuario eliminado exitosamente");
            consultar_informacion();
        } else {
            alert("Hubo un error al eliminar el usuario");
        } */

    if (selectedUsers.length === 0) {
        alert("Por favor, selecciona al menos un usuario para eliminar.");
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('mdl-eu'))
    const modalMessage = document.getElementById('modal-message');
    
    modalMessage.textContent = `¿Estás seguro de que deseas eliminar ${selectedUsers.length} usuario(s)?`;
    modal.show();

    document.getElementById("mdl-btn-conf").onclick = async function() {
        let model = {
            accion: 4,
            ids: selectedUsers
        };
    
        let response = await server_usuario(model);

        if (response.success) {
            alert('Usuarios eliminados con éxito.');
            consultar_informacion();
        } else {
            alert('Hubo un error al eliminar los usuarios.');
        }

        modal.hide();
    };

    document.getElementById("mdl-btn-can").onclick = function() {
        modal.hide();  
    };
        
    }



