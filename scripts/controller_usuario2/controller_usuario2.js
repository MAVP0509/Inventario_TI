let respuesta
function server_usuario(model) {
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_usuario2/controller_usuario2.php",
            data: {
                trama:JSON.stringify(model) 
            },
            success: function(response){
                try {
                    resolve(JSON.parse(response))
                    respuesta=response
                    //console.log(response)
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

$('#modalEditar').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus')
  })

/* let modalEditar = $("#modalEditar") */
  
let usuarios = []
async function consultar_usuarios() {
    let r = await server_usuario({accion : 2})

    usuarios = r.resultado
    document.getElementById('tbl-usuario-body').innerHTML=``
    for (let i = 0; i < usuarios.length; i++) {
        const element = usuarios[i]
        document.getElementById('tbl-usuario-body').innerHTML+=`
        <tr>
            <td>${element.nombre}</td>
            <td>${element.correo}</td>
            <td>${element.edad}</td>
            <td>${element.telefono}</td>
            <td>${element.fecha_nac}</td>
            <td>${element.fecha_reg}</td>
            <td><button type="button" class="btn btn-warning" id="idEditar${element.id}"  value="${element.id}" onclick="seleccionar_usuario(this)">Editar</button></td>
            <td><button type="button" class="btn btn-danger" id="idEditar${element.id}"  value="${element.id}" onclick="">Eliminar</button></td>
        </tr>
        `
    }   
}

let usuSelect=""
let modalEdit 
async function seleccionar_usuario(params) {

    for (let i = 0; i < usuarios.length; i++) {
        const element = usuarios[i];

        if(element.id===params.value){

            let model ={
                contraseña : element.contraseña
            }
            console.log(model)
            usuSelect = element;
            break;
        }
        
    }

    document.getElementById('usu').innerText=usuSelect.nombre
    document.getElementById('nombre').value=usuSelect.nombre
    document.getElementById('correo').value=usuSelect.correo
    document.getElementById('telefono').value=usuSelect.telefono
    document.getElementById('fechanac').value=usuSelect.fecha_nac
    document.getElementById('edad').value=usuSelect.edad
    document.getElementById('fecha_reg').value=usuSelect.fecha_reg
    document.getElementById('contraseña').value=usuSelect.contraseña
    
    modalEdit = new bootstrap.Modal(document.getElementById('modalEditar'))
    modalEdit.show()
}

async function editar_usuario(params) {
    let model = {
        accion : 1,
        id : usuSelect.id,
        nombre : $('#nombre').val().trim(),
        correo : $('#correo').val().trim(),
        telefono : $('#telefono').val().trim(),
        fecha_nac : $('#fechanac').val().trim(),
        edad : $('#edad').val().trim(),
        fecha_reg : $('#fecha_reg').val().trim(),
        contraseña : $('#contraseña').val().trim()
    }

    let r = await server_usuario(model)
    usuSelect = ""

    consultar_usuarios()
    modalEdit.hide()
}