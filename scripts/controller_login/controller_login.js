function server_usuario(model){
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_usuario/controller_usuario.php",
            data: {
                Trama:JSON.stringify(model)
            },
            success: function(response){
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
        correo :$("#correo").val().trim(),
        contraseña : $("#contraseña").val().trim(),
        edad : $("#edad").val().trim(),
        fecha_nac : $("#fechaNac").val().trim(),

    }

    console.log(JSON.stringify(model));
    let server =await server_usuario(model);
    console.log(server);
}

async function validarIngreso() {
    let model = {
        correo :$("#correo").val().trim(),
        edad : $("#edad").val().trim(),

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
