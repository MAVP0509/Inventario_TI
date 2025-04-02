let respuesta
function server_usuario(model){
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_usuario/controller_usuario.php",
            data: {
                trama:JSON.stringify(model) 
            },
            success: function(response){
                try {
                    resolve(JSON.parse(response))
                    respuesta=response
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}


let toast = $('#toastIndex')
window.addEventListener('load', function () {
    // Leemos el mensaje del registro desde localStorage
    const mensajeRegistro = sessionStorage.getItem('bienvenido');
    
    if (mensajeRegistro) {
        // Si el mensaje existe, mostramos el toast
        toast.removeClass('bg-success bg-danger bg-info bg-warning bg-primary');
        toast.addClass('bg-success');
        toast.find('.toast-body').text(mensajeRegistro).css('color','white');
        toast.toast('show');
        

        // Eliminamos el mensaje para evitar que aparezca nuevamente
        sessionStorage.removeItem('bienvenido');
    }
})

window.addEventListener('beforeunload',()=>{
  /*  sessionStorage.removeItem('user')
   sessionStorage.setItem('log', 'false') */
   sessionStorage.clear()
})

