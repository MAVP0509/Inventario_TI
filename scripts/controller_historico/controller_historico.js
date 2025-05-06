let respuesta
function server_historico(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_historico/controller_historico.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response){
                try {
                    resolve(JSON.parse(response))
                    respuesta = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    });
}


async function generar_historico(params) {

    let usuario = JSON.parse(sessionStorage.getItem('user'));

    let model = {
        accion: 0,
        fecha_evento: fecha_evento,
        usuario: usuario.resultado[0],
        evento: "" ,
        num_serie: "" ,
        tipo: ""
    }

    let respuesta = await server_historico(model);

}