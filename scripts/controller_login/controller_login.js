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
                } catch (error) {
                    reject(error)
                }
            }
        })
    })  
}


async function registrarUsu(){
    let model = {
        accion : 1,
        nombre: $("#nombre").val().trim(),
        correo :$("#regcorreo").val().trim(),
        contraseña : $("#reg-contraseña").val().trim(),
        edad : $("#edad").val().trim(),
        telefono : $("#telefono").val().trim(),
        fecha_nac : $("#fechanac").val().trim(),
    }


    //console.log(JSON.stringify(model));
    console.log(JSON.stringify(model));
    let server =await server_usuario(model);
    console.log(server)
    let inputs = document.getElementsByName("inputReg");
    for (let i = 0; i < inputs.length; i++) {
        const element = inputs[i].value = "";
    }
    if(respuesta.resultado = true){
        let toast = $('#liveToast');
        // Mostramos el toast usando el método de Bootstrap
        toast.toast('show');
    }else if(respuesta.resultado = false){
        alert("Usuario no ingresado")
    }
    
    
}

async function validarIngreso() {
    let model = {
        correo :$("#logcorreo").val().trim(),
        contraseña : $("#logcontraseña").val().trim(),

    }

    let server = await server_usuario({Accion : 0});
    if(server.resultado[0] === model.correo && server.resultado[1] === model.contraseña){
        alert("Felicidades")
    }else {
        alert("Usuario y/o contraseña incorrectos")
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
    $('[data-toggle="popover"]').popover()
  });

function validar_contraseña(){
    let contraseña = document.getElementById("reg-contraseña").value;
    let vcontraseña = document.getElementById("conf-contraseña").value;

    if (contraseña !== vcontraseña) {
        mensaje += 'Las contraseñas no coinciden.<br>';
    }

    var popoverContent = document.querySelector('#reg-contraseña').getAttribute('data-content');
    if (mensaje) {
        document.querySelector('#reg-contraseña').setAttribute('data-content', mensaje);
        $('#reg-contraseña').popover('show');
    } else {
        $('#reg-contraseña').popover('hide');
    }
    document.getElementById('reg-contraseña').addEventListener('input', validar_contraseña);
    document.getElementById('conf-contraseña').addEventListener('input', validar_contraseña);
}

function enter_enviar(event){
    if (event.keyCode == 13){
        validar_contraseña()
    }
}


/* async function validar_email(){
        inputCorreo = document.getElementsByName("inputInit")[1]

        inputCorreo.addEventListener("invalid", ()=> {
            alert("Ingrese un correo electrónico válido")
        })

        inputCorreo.addEventListener("input", () => {
            inputCorreo.reportValidity();
            alert("Correo válido")
            if (!reportVal) {
              alert("Correo no válido")
            }
          });
} */

async function validar_telefono(){
    telefonoInput = document.getElementById('telefono');

  telefonoInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, ''); // Reemplaza cualquier cosa que no sea un número
  });
}
