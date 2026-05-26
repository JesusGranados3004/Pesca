document.addEventListener('DOMContentLoaded', function() {
    const tipoSelect = document.getElementById("tipoUsuario");
    const formConsumidor = document.getElementById("formConsumidor");
    const formVendedor = document.getElementById("formVendedor");
    const mensajeDiv = document.getElementById("mensaje");

    if (tipoSelect) {
        tipoSelect.addEventListener('change', function() {
            if (formConsumidor) formConsumidor.style.display = 'none';
            if (formVendedor) formVendedor.style.display = 'none';
            
            if (this.value === 'consumidor' && formConsumidor) {
                formConsumidor.style.display = 'block';
            } else if (this.value === 'vendedor' && formVendedor) {
                formVendedor.style.display = 'block';
            }
        });
    }

    configurarFormulario(formConsumidor);
    configurarFormulario(formVendedor);

   function configurarFormulario(form) {

        if (!form) return;

        form.addEventListener('submit', function(e) {

            e.preventDefault();
            e.stopPropagation();

            const datos = new FormData(this);

            const pass =
                datos.get("password");

            const passConfirm =
                datos.get("password_confirm");

            // VALIDAR CONTRASEÑAS
            if (pass !== passConfirm) {

                mostrarToast(
                    "Las contraseñas no coinciden",
                    "error"
                );

                return;
            }

            // VALIDAR LONGITUD
            if (pass.length < 6) {

                mostrarToast(
                    "La contraseña debe tener mínimo 6 caracteres",
                    "aviso"
                );

                return;
            }

            // PROCESANDO
            mostrarToast(
                "Procesando registro...",
                "info"
            );

            fetch('php/registro.php', {
                method: 'POST',
                body: datos
            })

            .then(r => r.text())

            .then(texto => {

                if (texto.trim() === 'ok') {

                    mostrarToast(
                        "¡Registro exitoso!",
                        "exito"
                    );

                    this.reset();

                    setTimeout(() => {

                        location.href =
                            'iniciarSesion.html';

                    }, 1500);

                } else {

                    mostrarToast(
                        "Error: " + texto,
                        "error"
                    );

                }

            })

            .catch(() => {

                mostrarToast(
                    "Error de conexión",
                    "error"
                );

            });

        });

    }

});