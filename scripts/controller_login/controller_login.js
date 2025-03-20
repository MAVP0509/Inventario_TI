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

