//TODO En cuanto se recargue la página, limpiar la sessionStorage
sessionStorage.clear()


/* const originalSetItem = sessionStorage.setItem;
sessionStorage.setItem = function(key, value) {
    console.log(`🔍 sessionStorage.setItem -> ${key}:`, value);
    originalSetItem.apply(this, arguments);
} */

let respuesta = ""
function server_usuario(model){
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_login/controller_login.php",
            data: {
                trama:JSON.stringify(model)
            },
            success: function(response){
                respuesta = response
                try {
                    resolve(JSON.parse(response))
                    console.log(JSON.parse(response))
                } catch (error) {
                    reject(error)
                }
            }
        })
    })  
}

function server_email(model){
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_email/controller_email.php",
            data: {
                trama:JSON.stringify(model)
            },
            success: function(response){
                respuesta = response
                Swal.close()
                try {
                    resolve(JSON.parse(response))  
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

//TODO funciones para animar los iconos de los botones
$(".icon").on('mouseover', function(){
    $(this).find('i').addClass("fa-bounce");
})
$(".icon").on('mouseout', function(e){
    $(this).find('i').removeClass("fa-bounce");
})



//TODO Función para el formulario de registro y sus funciones derivadas
async function registrarUsu(){
    try{
        if (!pass || !email || !tel || !nombre || !fecha || !vEdad  ) {
            mostrar_toast('warning', 'Inventario TI', '¡Rellena todos los campos correctamente para continuar!');

            //console.log(pass, email, tel, nombre, fecha, edad)
            return false;
    
        }else {
            let model = {
                accion : 1,
                nombre: $("#nombre").val().trim(),
                correo :$("#regcorreo").val().trim(),
                contraseña :$("#reg-contraseña").val().trim(),
                edad : $("#edad").val().trim(),
                telefono : $("#telefono").val().trim(),
                fecha_nac : $("#fechanac").val().trim(),
            };
        
            let server = await server_usuario(model);
        
            let resp=JSON.parse(respuesta)
            if(resp.resultado === true){
                localStorage.setItem('registroExitoso', '¡Usuario Registrado!');
                window.location.href = "login.html"
            }else if(resp.resultado === false){
                mostrar_toast('warning', 'Inventario TI', 'El correo ya está registrado');

            } 
            
            /* let inputs = document.getElementsByName("inputReg");
            for (let i = 0; i < inputs.length; i++) {
                const element = inputs[i].value = "";
            } */
        }    
    }catch (error){
        mostrar_toast('error', 'Inventario TI', 'No se puedo conectar al servidor');
    }
    
}

//* Función para validar la edad del usuario
let vEdad=false
function calcularEdad(){
    let fechaNacimiento = new Date(document.getElementById('fechanac').value);
    let hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    
    let mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    document.getElementById('edad').value = edad;

    if (edad<18){
        vEdad=false
    }else{
        vEdad=true
    }
}

//Comprueba en tiempo real las contraseñas
let pass=false
$('.ComprobarContraseña').on('input',function(e) {
    //console.log(e.currentTarget.value)
    
    validar_contraseña()
})

function validar_contraseña() {
    let regcontraseña = document.getElementById('reg-contraseña').value;
    let confcontraseña = document.getElementById('conf-contraseña').value;
    let errorMessage = document.getElementById('error-mensaje');

    let minlongitud = regcontraseña.length >= 8;
    let letrasmay = /[A-Z]/.test(regcontraseña);
    let letrasmin = /[a-z]/.test(regcontraseña);
    let numeros = /\d/.test(regcontraseña);
    let especialesc = /[()*#@.]/.test(regcontraseña);
    
    try {
        document.getElementById('minlongitud').style.color = minlongitud ? 'green' : 'red';  
        document.getElementById('lestrasmm').style.color = (letrasmay && letrasmin) ? 'green' : 'red';
        document.getElementById('numeros').style.color = numeros ? 'green' : 'red';
        document.getElementById('caracteresp').style.color = especialesc ? 'green' : 'red';
        } catch (error) {
        
    }
      
    let cumpleRequisitos = minlongitud && letrasmay && letrasmin && numeros && especialesc;

    if (!cumpleRequisitos) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'La contraseña no cumple con los requisitos de seguridad';
        document.getElementById('reg-contraseña').style.borderColor = 'red';
        return false;
    } else {
        errorMessage.style.display = 'none';
        document.getElementById('reg-contraseña').style.borderColor = 'green';
    }

    if (event.target.id === 'conf-contraseña' || event.target.id === 'reg-contraseña') {
        if (regcontraseña !== confcontraseña){
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Las contraseñas no coinciden';
            document.getElementById('conf-contraseña').style.borderColor = 'red';
            pass = false
        } else {
            errorMessage.style.display = 'none';    
            document.getElementById('conf-contraseña').style.borderColor = 'green';
            pass = true
        }
    }
    return true;

}

//*Función para comprobar que el telefono sea uno válido
let tel= false
$('#telefono').on('input', function() {
    this.value= this.value.replace(/[^0-9]/g, '')
    valTel = $(this).val();
    if (valTel.length < 10 ||valTel.length === 0) {
        document.getElementById('error-mensageTel').style = "display : block; color:red;"
        tel=false
        //document.getElementById('btn-reg').disabled= true;
    } else {
        document.getElementById('error-mensageTel').style = "display : none;"
        tel=true
        //document.getElementById('btn-reg').disabled= false;
    }
});

//*Función para comprobar que el nombre del registro sea uno válido
let nombre= false
$('#nombre').on('input', function(e) {
    //validar_nombre(e.currentTarget.value)
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚüÜ\s]{3,}$/
    if(!regexNombre.test(e.currentTarget.value)){
        document.getElementById('error-mensajeNombre').style = 'display : block; color:red;'
        nombre=false
    }else{
        document.getElementById('error-mensajeNombre').style = ' display : none;'
        nombre=true
    }
    
}); 

//*Función para comprobar que se ingresó una fecha
let fecha= false
$('#fechanac').on('input', function(e) {
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

//*Función para ver las contraseñas del registro
function togglePasswords() {
    let regPasswordInput = document.getElementById('reg-contraseña');
    let confPasswordInput = document.getElementById('conf-contraseña');
    let toggleIcon = document.getElementById('toggle-password-icon');   

    if (regPasswordInput.type === 'password') {
        regPasswordInput.type = 'text';
        confPasswordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');  
        toggleIcon.classList.add('fa-eye');
    } else {
        regPasswordInput.type = 'password';
        confPasswordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}

//*Función para el mensaje de "Usuario Registrado en el formulario de ingreso" y del reseteo de contraseña exitoso
window.addEventListener('load', function () {
    // Leemos el mensaje del registro desde sessionStorage
    const mensajeRegistro = localStorage.getItem('registroExitoso');
    const mensajeContraseña = localStorage.getItem('reseteoContraseña')
    
    if (mensajeRegistro) {
        // Si el mensaje existe, mostramos el toast
        mostrar_toast('success', 'Inventario TI', mensajeRegistro);
    }else if(mensajeContraseña){
        mostrar_toast('success', 'Inventario TI', mensajeContraseña);
    }

    localStorage.clear()
})



//TODO Función para el formulario de ingreso y sus funciones derivadas
async function validar_ingreso() {
 
    try{
        let model = {
            accion: 0,
            correo : $("#logcorreo").val().trim(),
            contraseña : $("#logcontraseña").val().trim(),
    
        }
        
        let server = await server_usuario(model);
    
        let resp=JSON.parse(respuesta)
        if (resp.resultado === false){
            mostrar_toast('error', 'Inventario TI', "Usuario/contraseña no válidos");
            let inputs = document.getElementsByName("inputInit");
            for (let i = 0; i < inputs.length; i++) {
            const element = inputs[i].value = "";
            }
        }else{
            sessionStorage.setItem("user", respuesta)
            sessionStorage.setItem("log", 'true')
            sessionStorage.setItem("rol", resp.resultado[5])
            sessionStorage.setItem("bienvenido", "Bienvenido " + resp.resultado[0])
            window.location.href = "inventario.html";
            let inputs = document.getElementsByName('inputInit')
            for (let i = 0; i < inputs.length; i++) {
                const element = inputs[i].value = "";
            }
            }
    }catch (error){
        mostrar_toast('error', 'Inventario TI', "No se pudo conectar al servidor");
    }
    
}

//* Para poder ver la contraseña en el formulario
function ver_contraseña(){
    let logPasswordInput = document.getElementById('logcontraseña')
    let iconLog = document.getElementById('toggle-password-icon-log')    

    if (logPasswordInput.type === 'password') {
        logPasswordInput.type = 'text';
        iconLog.classList.remove('fa-eye-slash');  
        iconLog.classList.add('fa-eye');
    } else if(logPasswordInput.type === 'text'){
        logPasswordInput.type = 'password';
        iconLog.classList.remove('fa-eye');
        iconLog.classList.add('fa-eye-slash');
    }
}
//? Función para mandar el formulario con la tecla "Enter"
document.getElementById('logcontraseña').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Evita que se recargue la página si estás usando AJAX
      document.getElementById('btn-ini').click(); // Llama al botón que hace el login
    }
});

//? Función para detectar si la tecla bloq mayus está activada
let capsMsg = document.getElementById('caps-lock-msg');

document.addEventListener('keydown', (e) => {
    const capsOn = e.getModifierState && e.getModifierState('CapsLock');
    capsMsg.style.display = capsOn ? 'inline' : 'none';
});

document.addEventListener('keyup', (e) => {
    const capsOn = e.getModifierState && e.getModifierState('CapsLock');
    capsMsg.style.display = capsOn ? 'inline' : 'none';
});


//TODO Función para navegar entre formularios del login
async function toggleForms(showRegister = false, showRecovery = false){
    if(showRecovery){
        $("#colrep").show(); //Muetsra el formulario de recuperación
        $("#colnone").hide(); //Oculta el formulario de inicio de sesión
        $("#colblock").hide(); //Oculta el formulario de registro
    } else if(showRegister) {
        $("#colnone").show(); //Muestra la sección de registro
        $("#colblock").hide(); //Oculta la sección de inicio de sesión
        $("#colrep").hide(); //Oculta la seccion de recuperación
    } else {
        $("#colnone").hide(); //Oculta la sección de registro
        $("#colblock").show(); //Muestra el formulario de inicio de sesión
        $("#colrep").hide(); //Oculta la sección de recuperación
    }
}

//TODO Función para llamar las funciones de validación y ver las contraseñas
$(document).ready(function () {
    $('[data-toggle="popover"]').popover(); 
    
    // Añadimos el evento input al campo de confirmación de contraseña
    document.getElementById('conf-contraseña').addEventListener('input', validar_contraseña);
    document.getElementById('reg-contraseña').addEventListener('input', validar_contraseña);
    document.getElementById('fechanac').addEventListener('input',calcularEdad);
    document.getElementById('toggle-password-icon').addEventListener('click', togglePasswords);
    document.getElementById('toggle-password-icon-log').addEventListener('click', ver_contraseña);
    
});



//TODO Comprueba en tiempo real el contenido de los inputs tipo email
let inputEmail
let email=false
let idInput
$('.Comprobarmail').on('input',function(e){
    //console.log(e.currentTarget.value)
    inputEmail =e.currentTarget.value
    idInput = e.currentTarget.id
    validar_email(e.currentTarget.value)
}
)

 async function validar_email(){
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    //console.log(inputEmail)

    if(idInput === "logcorreo"){
        if(!regexEmail.test(inputEmail)){
            document.getElementById('error-mensajeEmail-log').style = 'display : block; color:red;'
        }else{
            document.getElementById('error-mensajeEmail-log').style = ' display : none;'
        }
    }else if(idInput === "regcorreo"){
        if(!regexEmail.test(inputEmail) || inputEmail === ""){
            document.getElementById('error-mensajeEmail-reg').style = 'display : block; color:red;'
            email=false
            //document.getElementById('btn-reg').disabled= true;
        }else{
            document.getElementById('error-mensajeEmail-reg').style = ' display : none;'
            email=true
            //document.getElementById('btn-reg').disabled= false;
        }
    }else if(idInput === "repcorreo"){
        if(!regexEmail.test(inputEmail)){
            document.getElementById('error-mensajeEmail-rep').style = 'display : block; color:red;'
        }else{
            document.getElementById('error-mensajeEmail-rep').style = ' display : none;'
        }
    }
} 



//TODO Función de recuperación de la contraseña y funciones derivadas
async function recuperar_contraseña() {
    //let dominio = window.location.hostname
    //let puerto = location.port
    let model ={
        accion : 0,
        correo : $("#repcorreo").val().trim(),
        dominio : window.location.hostname,
        puerto : location.port
    }
    
    let response = await server_email(model);

    let emailmessages = document.getElementById('mensaje-correo-success');
    let emailmessaged = document.getElementById('mensaje-correo-danger');

    if(response.resultado === true) {

        // let token = response.token; // Suponiendo que el servidor devuelve un token
        // let enlace = await enlaceconParametros(token); // Obtener el enlace con el token
        emailmessages.style.display = 'block';
        emailmessages.textContent = 'Te hemos enviado un correo para recuperar tu contraseña.';
        emailmessaged.style.display = 'none';
        
    } else {
        emailmessaged.style.display = 'block';
        emailmessaged.textContent = 'El correo ingresado no está registrado. Por favor, inténtelo nuevamente.';
        emailmessages.style.display = 'none';
    }
}

async function enlaceconParametros(token) {
    
    let baseUrl = "http://localhost/Inventario/recuperacion.html";
    
    let params = new URLSearchParams();
    params.append("ftygui", token);

    let urlConParametros = `${baseUrl}?${params.toString()}`;

    return urlConParametros;
}

//? Función para mandar el correo con la tecla "Enter"
document.getElementById('repcorreo').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Evita que se recargue la página si estás usando AJAX
      document.getElementById('btn-recuperar').click(); // Llama al botón que hace el login

      document.getElementById('repcorreo').value = ""
    }
});


//TODO funciones para mostrar mensajes en pantalla
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
        heighAuto : true,
    });
}

function cargando(){
    Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espere un momento',
        allowOutsideClick: false,
        allowEscapeKey: false,
        heightAuto: false,
        color: "#716add",
        backdrop: `
        rgba(0,0,123,0.4)` ,
        imageUrl: "diavaz.png",
        imageWidth: 200,
        imageHeight: 200,
        imageAlt: "Custom image",
        didOpen: () => {
          Swal.showLoading();
        }
        
      });
}