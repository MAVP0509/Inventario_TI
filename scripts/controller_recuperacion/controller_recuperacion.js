let respuesta = ""
function server_usuario(model){
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_recuperacion/controller_recuperacion.php",
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


let token

async function load() {
    let urlParams = new URLSearchParams(window.location.search);
     token = urlParams.get("token");

    if (token) {
        // Validar el token con el servidor
        let isValid = await validar_token(token);
        let resp =JSON.parse(respuesta)

            // Guardar el token en una variable global para usarlo al confirmar el reseteo
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

    if (nuevaContraseña !== confirmarContraseña) {
        alert('Las contraseñas no coinciden.');
        return;
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

async function enlaceconParametros(token) {

    let baseUrl = "http://localhost/Inventario/recuperacion.html";
    
    let params = new URLSearchParams();
    params.append("token", token);

    let urlConParametros = `${baseUrl}?${params.toString()}`;

    return urlConParametros;
}