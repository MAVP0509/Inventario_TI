let respuesta = ""
function server_usuario(model){
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_recuperacion/controller_recuperacion.php",
            data: {
                trama:JSON.stringify(model)},  
            success: function(response){
                respuesta = response;
                try {
                    resolve(JSON.parse(response));
                    console.log(JSON.parse(response));
                } catch (error) {
                    reject(error);
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

let toast = $('#toast-rec')
let token

async function load() {
    let urlParams = new URLSearchParams(window.location.search);
     token = urlParams.get("ftygui"); // *Este es el token de la URL 

    if (token) {
        // Validar el token con el servidor
        let isValid = await validar_token(token);
        let resp =JSON.parse(respuesta)
        window.resetToken = token;
    } else {
            return false;;
    }
}

async function validar_token(token) {
    let model = {
        accion: 0, // Acción para validar el token
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
    let messageError = document.getElementById('mensaje-error');

    let mnlong = nuevaContraseña.length >=8;
    let mylet = /[A-Z]/.test(nuevaContraseña);
    let mnlet = /[a-z]/.test(nuevaContraseña);
    let mn = /\d/.test(nuevaContraseña);
    let mincrc = /[()*#@.]/.test(nuevaContraseña);

    try {
        document.getElementById('mnlong').style.color = mnlong ? 'green' : 'red';  
        document.getElementById('mymlet').style.color = (mylet && mnlet) ? 'green' : 'red';
        document.getElementById('mnlet').style.color = mn ? 'green' : 'red';
        document.getElementById('mincrc').style.color = mincrc ? 'green' : 'red';
        } catch (error) {
        
    }

    let cumpleReq = mnlong && mylet &&  mnlet && mn && mincrc;

    if(!cumpleReq){
        messageError.style.display = 'block';
        messageError.textContent = "La contraseña no cumple con los requisitos de seguridad";
        document.getElementById('respass').style.borderColor = 'red';
        return false;
    } else {
        messageError.style.display = 'none';
        document.getElementById('respass').style.borderColor = 'green';
    }
    if(event.target.id === 'conf-respass' || event.target.id === 'respass'){
        if (nuevaContraseña !== confirmarContraseña) {
            messageError.style.display = 'block';
            messageError.textContent = "La contraseña no coinciden";
            document.getElementById('conf-respass').style.borderColor = 'red';
            return false;
        } else {
            messageError.style.display = 'none';
            document.getElementById('conf-respass').style.borderColor = 'green';
        }
        return true;
    } 
    

    if (!token) {
        return false;
    }else{
        sessionStorage.setItem('resetToken',token);
    }

    let model = {
        accion: 1, // Acción para restablecer la contraseña
        token: token, // Usa el token global
        contraseña: nuevaContraseña
    };

    try {
        let response = await server_usuario(model);

        if (response.resultado === true) {
            localStorage.setItem('reseteoContraseña', '¡Contraseña restablecida exitosamente!')
            localStorage.removeItem('resetToken'); // Limpiar el token
            window.location.href = 'login.html'; // Redirigir al login
        } else {
            toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
            toast.addClass('bg-danger');
            toast.find('.toast-body').text("El tiempo ha vencido, solicita otro correo").css('color','white');
            toast.toast('show')
        }
    } catch (error) {
        return false;
    }
}

$(document).ready(function () {
    $('[data-toggle="popover"]').popover(); 
    
    // Añadimos el evento input al campo de confirmación de contraseña
    document.getElementById('conf-respass').addEventListener('input', confirmarReset);
    document.getElementById('respass').addEventListener('input', confirmarReset);
    document.getElementById('mostrar-pass').addEventListener('click', togglePasswords);
    
});

function togglePasswords() {
    let regPasswordInput = document.getElementById('respass');
    let confPasswordInput = document.getElementById('conf-respass');
    let toggleIcon = document.getElementById('mostrar-pass');   

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
