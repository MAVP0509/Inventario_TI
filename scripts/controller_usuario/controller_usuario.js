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

