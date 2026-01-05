auditoria_loading = false;
function server_auditoria(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_mantenimientos/controller_mantenimientos.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (respose) {
                try {
                    resolve(JSON.parse(respose))
                    if (mantenimiento_loading) {
                        Swal.close()
                        auditoria_loading = !auditoria_loading
                    }
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

function server_excel(model) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "database/controller_excel/controller_excel.php",
            data: {
                trama: JSON.stringify(model)
            },
            success: function (respose) {
                try {
                    resolve(JSON.parse(respose))
                } catch (error) {
                    reject(error)
                }
            }
        })
    })
}

async function mdl_programar_auditoria() {

    await Promise.all([
        general_select2({
            selectId: 'elaboro-aud',
            tabla: 'cat_usuarios',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'cg-elaboro-aud',
            tabla: 'cat_usuarios',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
            sincronizarCon: 'elaboro-aud',
            sincronizarCampo: 'cargo'
        }),

        general_select2({
            selectId: 'autorizo-aud',
            tabla: 'supervisor',
            campo: 'nombre',
            placeholder: 'Selecione un usuario',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
            // popoverTitle: "Descripción",
            // popoverContent: "Especificación técnica o funcional del equipo. Depende del rubro seleccionado."
        }),

        general_select2({
            selectId: 'cg-autorizo-aud',
            tabla: 'supervisor',
            campo: 'cargo',
            placeholder: 'Seleccione un cargo',
            dropdownParent: '#mdl-prog-aud',
            tags: false,
            sincronizarCon: 'autorizo-aud',
            sincronizarCampo: 'cargo'
        }),
    ])

    rellenar_select("Alejandro Cancino Argüello", "autorizo-aud");
    rellenar_select("César Ignacio Torres Almeida", "elaboro-aud");

    $('#cg-elaboro-aud, #cg-autorizo-aud').prop('disabled', true)
    $("#btn-conf-aud").off("click").on("click", function () { programar_auditoria() })

    $('#mdl-prog-aud').modal("show")
}

async function programar_auditoria() {

    const validar = ['elaboro-aud', 'autorizo-aud']

    if (!validar_campos(validar)) {
        mostrar_toast('error', 'Error', 'Rellena los campos. Inténtelo nuevamente.');
        return;
    }

    let model = {
        accion: 5,
        elaboro: $('#elaboro-aud').select2('data')[0].text,
        cg_elaboro: $('#cg-elaboro-aud').select2('data')[0].text,
        autorizo: $('#autorizo-aud').select2('data')[0].text,
        cg_autorizo: $('#cg-autorizo-aud').select2('data')[0].text,

    }

    mostrar_toast_cargando('Programando auditoria...')
    $('#mdl-btn-conf').prop('disabled', true);

    let server = await server_excel(model);

    if (server.resultado.result === true && server.resultado.url) {
        window.location = server.resultado.url;
        mostrar_toast('success', '¡Programa de auditoria exitosa!', 'El programa de auditoria se generó correctamente.');
        $('#mdl-prog-aud').modal("hide");
        load()

    } else {
        mostrar_toast('error', 'Error', server.resultado.error);
        $('#mdl-prog-aud').modal("hide");
    }/*  else if (server.resultado.duplicado === false) {
        mostrar_toast('error', '¡Error!', 'Ya existe un programa de auditoria para el año');
        $('#mdl-prog-mant').modal("hide");
    } */
    // console.log(auditoriasPendientes);


}