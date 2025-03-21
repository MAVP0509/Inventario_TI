function server_usuario(model){
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_login/controller_login.php",
            data: {
                trama:JSON.stringify(model)
            },
            success: function(response){
                try {
                    resolve(JSON.parse(response))
                    alert("Registro exitoso")
                } catch (error) {
                    reject(error)
                    alert("Registro fallido")
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
        contraseña : $("#regcontraseña").val().trim(),
        edad : $("#edad").val().trim(),
        telefono : $("#telefono").val().trim(),
        fecha_nac : $("#fechanac").val().trim(),

    }

    //console.log(JSON.stringify(model));
    let server =await server_usuario(model);
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

/*async function prueba(params) {
    let persona = {
        nombre : "Miguel",
        fecha : Date()
    }


}
let a = 0;
let b = 1;
let res = suma(a,b);

let parametrosparasua ={
    a:0,
    b:1
}

function suma(params){
    return params.a + params.b;
} */