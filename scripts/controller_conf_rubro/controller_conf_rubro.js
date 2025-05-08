let respuesta

function server_rubro(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_conf_rubro/controller_conf_rubro.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function(response) {
                //console.log(response);
                try {
                    resolve(JSON.parse(response))
                    //console.log(resolve(JSON.parse(response)))
                    respuesta = response
                } catch (error) {
                    reject(error)
                }
            }
        })
    });
}

let datos = []

async function consultar_informacion(){
    let server = await server_rubro({accion : 2})

    let table = new Tabulator('#tbl', {
        data: JSON.parse(respuesta).resultado,
        layout:"fitColumns",              //fit columns to width of table
        pagination:"local",               //paginate the data
        paginationSize:10,                //allow 10 rows per page of data
        paginationCounter:"rows",         //display count of paginated rows in footer
        movableColumns:true,              //allow column order to be changed
        columns:[
            {title:"ID", field:"id"},
            {title:"Rubro", field:"rubro"}
        ],
    })
}
