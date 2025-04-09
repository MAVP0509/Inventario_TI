let respuesta
function server_usuario(model) {
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_usuario/controller_usuario.php",
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


$(document).ready(function (){
    document.getElementById('fechanacReg').addEventListener('input',calcularEdad);
    document.getElementById('ver-passReg').addEventListener('click', ver_contraseña);

    $('#tbl-usuario').on('mouseover', '.icon', function() {
        $(this).find('i').addClass('fa-bounce');  // Agregar una clase extra si lo deseas
    }).on('mouseout', '.icon', function() {
        $(this).find('i').removeClass('fa-bounce');
    });
})
$(".icon").on('mouseover', function(){
    $(this).find('i').addClass("fa-bounce");
})
$(".icon").on('mouseout', function(e){
    $(this).find('i').removeClass("fa-bounce");
})
let toast = $('#liveToast')

window.addEventListener('load', function () {
    // Leemos el mensaje del registro desde localStorage
    const mensajeRegistro = sessionStorage.getItem('bienvenido');
    
    if (mensajeRegistro) {
        // Si el mensaje existe, mostramos el toast
        toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
        toast.addClass('bg-success');
        toast.find('.toast-body').text(mensajeRegistro).css('color','white');
        toast.toast('show');
        

        // Eliminamos el mensaje para evitar que aparezca nuevamente
        sessionStorage.removeItem('bienvenido');
    }
})




let usuarios = []
async function consultar_usuarios() {
    let usuarioLog = JSON.parse(sessionStorage.getItem('user'))
    let user = document.getElementById('user')
    user.textContent = usuarioLog.resultado[0] 
    let r = await server_usuario({accion : 2})

    usuarios = r.resultado
        
    let table = $("#tbl-usuario").DataTable()
    table.destroy()

    $("#tbl-usuario").DataTable({
                data: usuarios, //? Este es el array de objetos que trae el ajax, en este caso es el array de usuarios.
    
                columns: [ //? Aqui se definen las columnas de la tabla, el primer elemento es el id de la columna, el segundo es el nombre de la columna y el tercero es el render, que es lo que se va a mostrar en la tabla.
                    {
                        data: 'id',
                        render: function (data, type, row) {
                            let control = `<div class="form-check d-flex justify-content-center align-middle" ><input type="checkbox" class="form-check-input check-change" 
                            onclick="seleccionar_usuarios(${data})" value="${data}"></div>`
                            return control;
                        }
                    },
                    {
                        data: 'id',
                        render: function (data, type, row) {
                            let control = `<label style="text-align: center">${data}</label>`
                            return control;
                        }
                    },
                    {
                        data: 'nombre',
                        render: function (data, type, row) {
                            let control = `<label style="text-align: center">${data}</label>`
                            return control;
                        }
                    },
                    {
                        data: "correo",
                        render: function (data, type, row) {
                            let control = `<label style="text-align: center">${data}</label>`
                            return control;
                        }
    
                    },
                    {
                        data: 'edad',
                        render: function (data, type, row) {
                            let control = `<label style="text-align: center">${data}</label>`
                            return control;
                        }
                    },
                    {
                        data: "telefono",
                        render: function (data, type, row) {
                            let control = `<label style="text-align: center">${data}</label>`
                            return control;
                        }
    
                    },
                    {
                        data: 'fecha_nac',
                        render: function (data, type, row) {
                            let control = `<label style="text-align: center">${data}</label>`
                            return control;
                        }
                    },
                    {
                        data: "fecha_reg",
                        render: function (data, type, row) {
                            let control = `<label style="text-align: center">${data}</label>`
                            return control;
                        }
    
                    },
                    {
                        data: 'id',
                        render: function (data, type, row) {
                            let control = `<div class="d-flex justify-content-center align-items-center"><button type="button" style="text-align: center" class="btn btn-warning icon" id="${data}"  value="${data}" onclick="seleccionar_usuario(this)"><i class="fa-solid fa-pen-to-square fa-lg"></i></button></div>`
                            return control;
                        }
                    },
                    {
                        data: "id",
                        render: function (data, type, row) {
                            let control = `<div class="d-flex justify-content-center align-items-center" ><button type="button" tyle="text-align: center" class="btn btn-danger icon"  value="${data}" onclick="desactivar_usuariomsg(this)" value="${data}"><i class="fa-solid fa-trash fa-lg"></i></button></div>`
                            return control;
                        }
    
                    },
               
                    
                ], stateSave: true,
                //!Esta parte del codigo (DOM) es para que los botones, paginacion y filtros de busqueda se acomoden a sus necesidades, si quieren pueden buscar mas info en la documentacion de datatables, pero en este caso no es necesario.
    
    
            }
    )   
}




let usuSelect = ""
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

    let resp=JSON.parse(respuesta)
    if(resp.resultado === true){
        toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
        toast.addClass('bg-success');
        toast.find('.toast-body').text('Usuario editado').css('color','white')
        toast.toast('show')
    }else if(resp.resultado === false){
        toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
        toast.addClass('bg-danger');
        toast.find('.toast-body').text('Error al editar usuario').css('color','white')
        toast.toast('show')
    } 
    usuSelect = ""
    consultar_usuarios()
    modalEdit.hide()
}


let usuSeleccionado = []
async function seleccionar_usuarios(params) {

    let index = usuSeleccionado.indexOf(params); // Retorna el primer índice en el que se puede encontrar un elemento dado en el array,
    if (index === -1) {                  // ó retorna -1 si el elemento no esta presente.
        usuSeleccionado.push(params); // Añade uno o más elementos al final de un array
    } else {
        usuSeleccionado.splice(index, 1); 
    }
}

let modalElim
async function mensaje_eliminar() {

    if (usuSeleccionado.length === 0) {
        toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
        toast.addClass('bg-warning');
        toast.find('.toast-body').text('Por favor, selecciona al menos un usuario para continuar').css('color','white')
        toast.toast('show')
        return;
    }else{
        modalElim = new bootstrap.Modal(document.getElementById('modalElim'))
        modalElim.show()
    }
}

async function eliminar_usuario(params) {
        let model = {
            accion : 3,
            id : usuSeleccionado
        }

        let response = await server_usuario(model);
        
        if (response.resultado) {
            toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
            toast.addClass('bg-warning');
            toast.find('.toast-body').text('Usuario(s) eliminado(s)').css('color','white')
            toast.toast('show')
            usuSeleccionado = [];
            let table = $("#tbl-usuario").DataTable()
            table.destroy()
            consultar_usuarios()
            modalElim.hide()
        } else {
            toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
            toast.addClass('bg-danger');
            toast.find('.toast-body').text('Error en la consulta').css('color','white')
            toast.toast('show')
            modalElim.hide()
        }
        
}

let modalReg
async function nuevo_usuario(params) {
    let inputs = document.getElementsByName('insertMdl')
        for (let i = 0; i < inputs.length; i++) {
            const element = inputs[i].value = "";
        }
    modalReg = new bootstrap.Modal(document.getElementById('modalInsertar'))
    modalReg.show()
}

async function insertar_usuario(params) {
    try {
        let model = {
            accion : 0,
            nombre : $('#nombreReg').val().trim(),
            correo : $('#correoReg').val().trim(),
            telefono : $('#telefonoReg').val().trim(),
            fecha_nac : $('#fechanacReg').val().trim(),
            edad : $('#edadReg').val().trim(),
            contraseña : $('#contraseña').val().trim()
        }
    
        let server = await server_usuario(model)
    
        let resp=JSON.parse(respuesta)
        if(resp.resultado === true){
            toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
            toast.addClass('bg-success');
            toast.find('.toast-body').text('Usuario registrado').css('color','white')
            toast.toast('show')
        }else if(resp.resultado === false){
            toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
            toast.addClass('bg-danger');
            toast.find('.toast-body').text('Usuario ya existente').css('color','white')
            toast.toast('show')
        } 
    
        let table = $("#tbl-usuario").DataTable()
        table.destroy()
        consultar_usuarios()
        modalReg.hide()
    } catch (error) {
        toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
        toast.addClass('bg-danger');
        toast.find('.toast-body').text('Rellene correctamente los campos').css('color','white')
        toast.toast('show')
    }
    
}

let vEdad=false
function calcularEdad(){
    let fechaNacimiento = new Date(document.getElementById('fechanacReg').value);
    let hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    
    let mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    document.getElementById('edadReg').value = edad;

    if (edad<18){
        vEdad=false
    }else{
        vEdad=true
    }
}

function ver_contraseña(){
    let regPasswordInput = document.getElementById('contraseñaReg')
    let iconReg = document.getElementById('ver-passReg')   
    let editPasswordInput = document.getElementById('contraseña')
    let iconEdit = document.getElementById('ver-passEdit');  

    if (regPasswordInput.type === 'password') {
        regPasswordInput.type = 'text';
        iconReg.classList.remove('fa-eye-slash');  
        iconReg.classList.add('fa-eye');
    } else if(regPasswordInput.type === 'text'){
        regPasswordInput.type = 'password';
        iconReg.classList.remove('fa-eye');
        iconReg.classList.add('fa-eye-slash');
    }
}

let modalDes
let usuDes
async function desactivar_usuariomsg(params) {
    for (let i = 0; i < usuarios.length; i++) {
        const element = usuarios[i];

        if(element.id===params.value){
            usuDes = element;
            break;
        }
        
    }
    modalDes = new bootstrap.Modal(document.getElementById('modalDes'))
    modalDes.show()
}

async function desactivar_usuario(params) {
    let model ={
        accion : 3,
        id : usuDes.id
    }
    
    let r = await server_usuario(model)

    if (r.resultado) {
        modalDes.hide()
        toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
        toast.addClass('bg-warning');
        toast.find('.toast-body').text('Usuario eliminado').css('color','white')
        toast.toast('show')
        let table = $("#tbl-usuario").DataTable()
        table.destroy()
        consultar_usuarios()
        
    } else {
        toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
        toast.addClass('bg-danger');
        toast.find('.toast-body').text('Error en la consulta').css('color','white')
        toast.toast('show')
    }
}

$("#log-out").on('mouseover', function(){
    $(this).find('i').removeClass('fa-solid fa-door-closed fa-lg').addClass('fa-solid fa-door-open fa-xl');
})
$("#log-out").on('mouseout', function(){
    $(this).find('i').removeClass('fa-solid fa-door-open fa-lg').addClass('fa-solid fa-door-closed fa-xl')
})
async function cerrar_sesion() {
    sessionStorage.setItem('log','false')
    window.location.reload()
}