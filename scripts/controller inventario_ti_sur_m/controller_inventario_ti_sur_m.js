let respuesta
function server_inventario(model) {
    return new Promise ((resolve,reject)=>{
        $.ajax({
            type: "POST",
            url: "database/controller_inventario_ti_sur_m/inventario_ti_sur_m.php",
            data: {
                trama:JSON.stringify(model) 
            },
            success: function(response){
                try {
                    resolve(JSON.parse(response))
                    respuesta=response
                    //console.log(response)
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

async function consultar_inventario() {
    let model = {
        accion : 2
    }

    let Task = new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_inventario_ti_sur_m/inventario_ti_sur_m.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (response) {
                try {
                    resolve(JSON.parse(response))
                } catch (error) {
                    reject(error)
                }
            }
        });
    });

    Promise.all([Task]).then((respuesta) => {
        let UserData = respuesta[0].resultado
        /**
         * !A partir de aqui es donde se dibuja la tabla, primero se destruye la tabla si existe, y luego se vuelve a crear con los datos que trae el ajax.
         * !Recuerda que el id de la tabla es "tableUsuarios", si cambias el id de la tabla, cambia aqui tambien.
         */
        try {
            let table = $("#tbl-inventario").DataTable()
            table.destroy()
        } catch (error) {

        }

        DibujarTabla(UserData)
    })
}