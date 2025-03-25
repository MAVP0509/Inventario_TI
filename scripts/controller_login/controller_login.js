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
                    console.log(JSON.parse(response))
                } catch (error) {
                    reject(error)
                }
            }
        })
    })  
}


async function registrarUsu(){

    if (!validar_contraseña({ target: { id: 'reg-contraseña' } })) {
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
    let server =await server_usuario(model);

    let resp=JSON.parse(respuesta)
    if(resp.resultado === true){
        let toast = $('#liveToast');
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
    document.getElementById('toggle-passwords').addEventListener('change', togglePasswords);
    document.getElementById('regcorreo').addEventListener('input', validar_email);
    
});

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
        let toggle = document.getElementById('toggle-passwords');
    
        if (toggle.checked) {
            regPasswordInput.type = 'text';
            confPasswordInput.type = 'text';
        } else {
            regPasswordInput.type = 'password';
            confPasswordInput.type = 'password';
        }
    }
/* document.getElementById('conf-contraseña').addEventListener('input', validar_contraseña); */ //Manda a llamar el input donde se registra la contraseña para usar la función

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


async function validar_email(event){
    inputEmail = document.getElementById('regcorreo').value
    errorMessageEmail = document.getElementById("error-mensaje-email")
    const email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputEmail)
    
    if (event.target.id === 'regcorreo') {
        if(email === false){
            errorMessageEmail.style.display = 'block';
            errorMessageEmail.textContent = 'Ingresa un correo válido';
            document.getElementById('btn-reg').disabled= true
        } else {
            errorMessageEmail.style.display = 'none';
            document.getElementById('btn-reg').disabled= false
        }
    }
}

async function validar_telefono(){
    telefonoInput = document.getElementById('telefono');

  telefonoInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, ''); // Reemplaza cualquier cosa que no sea un número
          });
}

let models ={
    nombre : "Miguel",
    edad : 23
}

sessionStorage.setItem("nombre", models)
//sessionStorage.getItem
console.log(sessionStorage.getItem("nombre"))
