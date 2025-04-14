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
    document.getElementById('fechanacReg').addEventListener('input',calcular_edadreg);
    document.getElementById('fechanac').addEventListener('input',calcular_edadedit);
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
        mostrar_toast('success', 'Bienvenido', mensajeRegistro)


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
                    }
                ], 
                dom: `
                    <'row mb-2'<'col-sm-6 text-left'f><'col-sm-6 text-right'B>>
                    <'row'<'col-sm-12'tr>>
                    <'row mt-2'<'col-sm-3'l><'col-sm-5 text-center'i><'col-sm-4 text-right'p>>
                `,
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
                    paginate: {
                        first: '<i class="fas fa-angle-double-left"></i>',
                        previous: '<i class="fas fa-angle-left"></i>',
                        next: '<i class="fas fa-angle-right"></i>',
                        last: '<i class="fas fa-angle-double-right"></i>'
                    },
                },
                buttons:[
                    {   text : 'word',
                        action: function (e, dt, node, config) {
                            crear_word()
                        }
                    },
                    /* {
                        extend: 'excelHtml5',
                        text: 'Exportar a Excel',
                        className: 'btn btn-sm btn-success'
                    },
                    {
                        extend: 'pdfHtml5',
                        text: 'Exportar a PDF',
                        className: 'btn btn-sm btn-danger'
                    },
                    {
                        extend: 'print',
                        text: 'Imprimir',
                        className: 'btn btn-sm btn-primary'
                    }, */
                ],
                stateSave: true,
                resposive: true,
                //!Esta parte del codigo (DOM) es para que los botones, paginacion y filtros de busqueda se acomoden a sus necesidades, si quieren pueden buscar mas info en la documentacion de datatables, pero en este caso no es necesario.
  
    })   
}




let usuSelect = ""
let modalEdit 
async function seleccionar_usuario(params) {

    for (let i = 0; i < usuarios.length; i++) {
        const element = usuarios[i];

        if(element.id===params.value){

            /* let model ={
                contraseña : element.contraseña
            }
            console.log(model) */
            usuSelect = element;
            break;
        }
        
    }

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
        mostrar_toast('success', 'Inventario TI', 'Usuario editado')
    }else if(resp.resultado === false){
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
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


async function mensaje_eliminar() {

    if (usuSeleccionado.length === 0) {
        mostrar_toast('warning', 'Inventario TI', 'Por favor, selecciona al menos un usuario para continuar')
        return;
    }else{
        mostrar_alert('warning', `¿Está seguro de eliminar ${usuSeleccionado.length} usuario(s)?`, false , eliminar_usuario)
        /* modalElim = new bootstrap.Modal(document.getElementById('modalElim'))
        modalElim.show() */
    }
}

async function eliminar_usuario(params) {
        let model = {
            accion : 3,
            id : usuSeleccionado
        }

        let response = await server_usuario(model);
        
        if (response.resultado) {
            mostrar_toast('success', 'Inventario TI', 'Usuario(s) eliminado(s) correctamente')

            usuSeleccionado = [];
            let table = $("#tbl-usuario").DataTable()
            table.destroy()
            consultar_usuarios()
        } else {
            mostrar_toast('error', 'Inventario TI', 'Error en la consulta');
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

    
    if(!email || !tel || !nombre ||!fecha || !pass){
        mostrar_toast('warning', 'Inventario TI', '¡Rellena todos los campos correctamente para continuar!');
        return false;
        

    }else{
    
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
            mostrar_toast('success', 'Inventario TI', 'Usuario registrado correctamente')
        }else if(resp.resultado === false){
            mostrar_toast('warning', 'Inventario TI', 'Usuario Usuario ya existente')
        } 
    
        let table = $("#tbl-usuario").DataTable()
        table.destroy()
        consultar_usuarios()
        modalReg.hide()
        
        email = false
        tel = false
        nombre = false
        fecha = false
        pass = false
    }
}


function calcular_edadreg(){
    let fechaNacimiento = new Date(document.getElementById('fechanacReg').value);
    let hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    
    let mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    document.getElementById('edadReg').value = edad;
}

function calcular_edadedit(){
    let fechaNacimiento = new Date(document.getElementById('fechanac').value);
    let hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    
    let mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    document.getElementById('edad').value = edad;
}

function ver_contraseña(){
    let regPasswordInput = document.getElementById('contraseñaReg')
    let iconReg = document.getElementById('ver-passReg')    

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


let usuDes
async function desactivar_usuariomsg(params) {
    for (let i = 0; i < usuarios.length; i++) {
        const element = usuarios[i];

        if(element.id===params.value){
            usuDes = element;
            break;
        }
        
    }
    mostrar_alert('warning', '¿Está seguro de eliminar este usuario?', false ,desactivar_usuario)
}

async function desactivar_usuario(params) {
    let model ={
        accion : 3,
        id : usuDes.id
    }
    
    let r = await server_usuario(model)

    if (r.resultado) {
        mostrar_toast('success', 'Inventario TI', 'Usuario eliminado')
        let table = $("#tbl-usuario").DataTable()
        table.destroy()
        consultar_usuarios()
        
    } else {
        mostrar_toast('error', 'Inventario TI', 'Error en la consulta')
    }
}

$("#log-out").on('mouseover', function(){
    $(this).find('i').removeClass('fa-solid fa-door-closed fa-lg').addClass('fa-solid fa-door-open fa-xl');
})
$("#log-out").on('mouseout', function(){
    $(this).find('i').removeClass('fa-solid fa-door-open fa-lg').addClass('fa-solid fa-door-closed fa-xl')
})


// *Función para comprobar el nombre en el modal de registrar usuario
let nombre= false
$('#nombreReg').on('input', function(e) {
    //validar_nombre(e.currentTarget.value)
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚüÜ]{3,}$/
    if(!regexNombre.test(e.currentTarget.value)){
        document.getElementById('error-mensajeNombre').style = 'display : block; color:red;'
        nombre=false
    }else{
        document.getElementById('error-mensajeNombre').style = ' display : none;'
        nombre=true
    }
    
}); 


//*Función para comprobar el correo en el modal de registrar usuario
let email=false
$('#correoReg').on('input',function(e){
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if(!regexEmail.test(e.currentTarget.value)){
        document.getElementById('error-mensajeEmail').style = 'display : block; color:red;'
        email=false
    }else{
        document.getElementById('error-mensajeEmail').style = ' display : none;'
        email=true
    }
}
)

let tel= false
$('#telefonoReg').on('input', function() {
    this.value= this.value.replace(/[^0-9]/g, '')
    valTel = $(this).val();
    if (valTel.length < 10 ||valTel.length === 0) {
        document.getElementById('error-mensageTel').style = "display : block; color:red;"
        tel=false
    } else {
        document.getElementById('error-mensageTel').style = "display : none;"
        tel=true
    }
});


//* Función para comprobar la fecha de nacimiento en el modal de registrar usuario
let fecha= false
$('#fechanacReg').on('input', function(e) {
    //validar_nombre(e.currentTarget.value)
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/
    if(!regexFecha.test(e.currentTarget.value)){
        document.getElementById('error-mensageFecha').style = 'display : block; color:red;'
        fecha=false
    }else{
        document.getElementById('error-mensageFecha').style = ' display : none;'
        fecha=true
    }
    
});


let pass= false
$('#contraseñaReg').on('input', function(e) {
    //validar_nombre(e.currentTarget.value)
    const regexPass = /^(?!\s*$).{2,}$/
    if(!regexPass.test(e.currentTarget.value)){
        document.getElementById('error-mensagePass').style = 'display : block; color:red;'
        pass=false
    }else{
        document.getElementById('error-mensagePass').style = ' display : none;'
        pass=true
    }
    
});

async function cerrar_sesionmsg() {
    mostrar_alert('warning', `¿Seguro que quieres salir?`, false , cerrar_sesion)
}

function cerrar_sesion(){
    sessionStorage.setItem('log','false')
    window.location.reload()
}

function crear_word() {
    const enlace = document.createElement('a');
    enlace.href = 'database/controller_word2/controller_word2.php'; // ← cambia esto
    enlace.download = 'Pruebas.docx'; // nombre sugerido
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

}
function mostrar_toast(tipo, titulo, mensaje) {
    Swal.fire({
        icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
        title: titulo,
        text: mensaje,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        heightAuto : true,
        theme : 'dark'
    });
}

function mostrar_alert(tipo, mensaje, skip, funcion) {
    Swal.fire({
        title: 'Inventario TI',
        text: mensaje,
        icon: tipo, // 'success', 'error', 'warning', 'info', 'question'
        showCancelButton: true,
        confirmButtonColor: '#d33',
        allowOutsideClick : skip, // true, false
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar <i class="fa-solid fa-thumbs-up fa-lg"></i>',
        cancelButtonText: 'Cancelar <i class="fa-solid fa-thumbs-down fa-lg"></i>',
        backdrop: `
        rgba(0,0,123,0.4)` ,
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario hace clic en "Aceptar", ejecutamos la función que pasamos como parámetro
            funcion();
        }
    })
}