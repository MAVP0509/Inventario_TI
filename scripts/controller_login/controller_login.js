//inv toastr
let respuesta 

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
                    //console.log(JSON.parse(response))
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
                try {
                    resolve(JSON.parse(response))
                    //console.log(JSON.parse(response))   
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

async function load() {
    let urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get("token");

    if (token) {
        // Validar el token con el servidor
        let isValid = await validar_token(token);

        if (isValid) {
            // Mostrar la sección de reseteo de contraseña
            document.getElementById('col-reset').style.display = 'block';

            // Ocultar las demás secciones
            document.getElementById('colblock').style.display = 'none';
            document.getElementById('colnone').style.display = 'none';
            document.getElementById('colrep').style.display = 'none';

            // Guardar el token en una variable global para usarlo al confirmar el reseteo
            window.resetToken = token;
        } else {
            return false;;
        }
    }
}

window.onload = load;

async function validar_token(token) {
    let model = {
        accion: 2, // Acción para validar el token
        token: token
    };

    try {
        let response = await server_usuario(model);
        return response.resultado === true;
    } catch (error) {
        return false;
    }
}

    async function confirmarReset() {
    let nuevaContraseña = document.getElementById('respass').value;
    let confirmarContraseña = document.getElementById('conf-respass').value;

    if (nuevaContraseña !== confirmarContraseña) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    let token = sessionStorage.getItem('resetToken');
    if (!token) {
        alert('Token no válido o expirado.');
        return;
    }

    let model = {
        accion: 3, // Acción para restablecer la contraseña
        token: token, // Usa el token global
        nueva_contraseña: nuevaContraseña
    };

    try {
        let response = await server_usuario(model);

        if (response.resultado === true) {
            alert('Contraseña restablecida correctamente.');
            sessionStorage.removeItem('resetToken'); // Limpiar el token
            window.location.href = 'login.html'; // Redirigir al login
        } else {
            alert('Error al restablecer la contraseña: ' + response.mensaje);
        }
    } catch (error) {
        return false;
    }
}


async function registrarUsu(){

    let toast = $('#liveToast');
    if (!validar_contraseña({ target: { id: 'reg-contraseña' } })) {
        toast.body("¡El toast ha sido actualizado!")
        toast.toast('show')
        return;
    }

    let model = {
        accion : 1,
        nombre: $("#nombre").val().trim(),
        correo :$("#regcorreo").val().trim(),
        contraseña :$("#reg-contraseña").val().trim(),
        edad : $("#edad").val().trim(),
        telefono : $("#telefono").val().trim(),
        fecha_nac : $("#fechanac").val().trim(),
    };


    //console.log(JSON.stringify(model));
    //console.log(JSON.stringify(model));
    let server = await server_usuario(model);

    let resp=JSON.parse(respuesta)
    if(resp.resultado === true){
        // Mostramos el toast usando el método de Bootstrap
        toast.toast('show');
    }else if(resp.resultado === false){
        alert("Usuario no ingresado")
    } 

    let inputs = document.getElementsByName("inputReg");
    for (let i = 0; i < inputs.length; i++) {
        const element = inputs[i].value = "";
    }
    
}


async function validar_ingreso() {
    let model = {
        accion: 0,
        correo :$("#logcorreo").val().trim(),
        contraseña : $("#logcontraseña").val().trim(),

    }

    let server = await server_usuario(model);

    let resp=JSON.parse(respuesta)
    if (resp.resultado === true){
        window.location.href = "index.html";
    }else{
        alert("Usuario no existente")
        let inputs = document.getElementsByName("inputInit");
        for (let i = 0; i < inputs.length; i++) {
        const element = inputs[i].value = "";
        }
    }
    
}


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


$(document).ready(function () {
    $('[data-toggle="popover"]').popover(); 
    
    // Añadimos el evento input al campo de confirmación de contraseña
    document.getElementById('conf-contraseña').addEventListener('input', validar_contraseña);
    document.getElementById('reg-contraseña').addEventListener('input', validar_contraseña);
    document.getElementById('fechanac').addEventListener('input',calcularEdad);
    document.getElementById('toggle-password-icon').addEventListener('click', togglePasswords);
    
});
//console.log(r=document.getElementById('rep-correo').addEventListener('input', validar_email))

function validar_contraseña(){
    let regcontraseña = document.getElementById('reg-contraseña').value;
    let confcontraseña = document.getElementById('conf-contraseña').value;
    let errorMessage = document.getElementById('error-mensaje');

    let minlongitud = regcontraseña.length >= 8;
    let letrasmay = /[A-Z]/.test(regcontraseña);
    let letrasmin = /[a-z]/.test(regcontraseña);
    let numeros = /\d/.test(regcontraseña);
    let especialesc = /[()*#@]/.test(regcontraseña);
    
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
        } else {
            errorMessage.style.display = 'none';    
            document.getElementById('conf-contraseña').style.borderColor = 'green';
        }
    }

    return true;

    }


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

function calcularEdad(){
    let fechaNacimiento = new Date(document.getElementById('fechanac').value);
    let hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    
    let mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    document.getElementById('edad').value = edad;
}

/* function enter_enviar(event){
    if (event.keyCode == 13){
        validar_contraseña()
    }
} */


//Comprueba en tiempo real el contenido de los inputs tipo email
let inputEmail
$('.Comprobarmail').on('input',function(e){
    //console.log(e.currentTarget.value)
    inputEmail =e.currentTarget.value
    idInput = e.currentTarget.id
    validar_email(e.currentTarget.value)
}
)

 async function validar_email(){
    const email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    //console.log(inputEmail)

    if(idInput === "logcorreo"){
        if(!email.test(inputEmail)){
            document.getElementById('error-mensajeEmail-log').style = 'display : block; color:red;'
        }else{
            document.getElementById('error-mensajeEmail-log').style = ' display : none;'
        }
    }else if(idInput === "regcorreo"){
        if(!email.test(inputEmail) || inputEmail === ""){
            document.getElementById('error-mensajeEmail-reg').style = 'display : block; color:red;'
            document.getElementById('btn-reg').disabled= true;
        }else{
            document.getElementById('error-mensajeEmail-reg').style = ' display : none;'
            document.getElementById('btn-reg').disabled= false;
        }
    }else if(idInput === "repcorreo"){
        if(!email.test(inputEmail)){
            document.getElementById('error-mensajeEmail-rep').style = 'display : block; color:red;'
        }else{
            document.getElementById('error-mensajeEmail-rep').style = ' display : none;'
        }
    }
} 


//Función para comprobar que el telefono sea uno válido
$('#telefono').on('input', function() {
    this.value= this.value.replace(/[^0-9]/g, '')
    valTel = $(this).val();
    if (valTel.length < 10 ||valTel.length === 0) {
        document.getElementById('error-mensageTel').style = "display : block; color:red;"
        document.getElementById('btn-reg').disabled= true;
    } else {
        document.getElementById('error-mensageTel').style = "display : none;"
        document.getElementById('btn-reg').disabled= false;
    }
}); 



/* let models ={
    nombre : "Miguel",
    edad : 23
}

sessionStorage.setItem("nombre", models)
//sessionStorage.getItem
console.log(sessionStorage.getItem("nombre"))
 */

async function recuperar_contraseña() {
    let model ={
        accion : 0,
        correo : $("#repcorreo").val().trim()
    }
    
    let response = await server_email(model);

    let emailmessages = document.getElementById('mensaje-correo-success');
    let emailmessaged = document.getElementById('mensaje-correo-danger');

    if(response.resultado === true) {
        emailmessages.style.display = 'block';
        emailmessages.textContent = 'Te hemos enviado un correo para recuperar tu contraseña.';
        //emailmessaged.style.display = 'none';
        setTimeout(() => {
            document.getElementById('colrep').style.display = 'none';
            document.getElementById('colblock').style.display = 'block';
        }, 10000); // Ocultar el mensaje después de 5 segundos
        

        //emailmessages.classList.remove('alert-danger'); // Eliminar clase de error (si existe)
        //emailmessages.classList.add('alert-success');   // Asegurarse de que tenga clase de éxito (verde)
    } else {
        emailmessaged.style.display = 'block';
        emailmessaged.textContent = 'El correo ingresado no está registrado. Por favor, inténtelo nuevamente.';
        document.getElementById('colrep').style.display = 'block';
        //emailmessages.style.display = 'none';
        //emailmessaged.classList.remove('alert-success'); // Eliminar clase de éxito (si existe)
        //emailmessaged.classList.add('alert-danger');   // Asegurarse de que tenga clase de error (rojo)
        //document.getElementById('colrep').style.display = 'block';
    }

    if(response.resultado===false){
        alert("El correo ingresado no está registrado")
    }else{
        document.getElementById("colrep").style.display = 'none'
        document.getElementById("col-reset").style.display = 'block'
    }
}