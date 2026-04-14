console.log("✅ registro.js cargado");

document.addEventListener('DOMContentLoaded', function() {
    
    const tipoSelect = document.getElementById("tipoUsuario");
    const formConsumidor = document.getElementById("formConsumidor");
    const formVendedor = document.getElementById("formVendedor");
    const mensajeDiv = document.getElementById("mensaje");

    if (tipoSelect) {
        tipoSelect.addEventListener('change', function() {
            console.log("Tipo seleccionado:", this.value);
            
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
            console.log("Submit en", this.id);
            e.preventDefault();
            e.stopPropagation();

            const datos = new FormData(this);
            const pass = datos.get("password");
            const passConfirm = datos.get("password_confirm");

            if (pass !== passConfirm) {
                mostrarMensaje("Las contraseñas no coinciden", "error");
                return;
            }

            if (pass.length < 6) {
                mostrarMensaje("Mínimo 6 caracteres", "error");
                return;
            }

            mostrarMensaje("Procesando...", "info");

            fetch('php/registro.php', {
                method: 'POST',
                body: datos
            })
            .then(r => r.text())
            .then(texto => {
                console.log("Servidor dice:", texto);
                
                if (texto.trim() === 'ok') {
                    mostrarMensaje("¡Registro exitoso!", "exito");
                    this.reset();
                    setTimeout(() => location.href = 'iniciarSesion.html', 1500);
                } else {
                    mostrarMensaje("Error: " + texto, "error");
                }
            })
            .catch(err => {
                console.error("Error:", err);
                mostrarMensaje("Error de conexión", "error");
            });
        });
    }

    function mostrarMensaje(texto, tipo) {
        if (!mensajeDiv) return;
        mensajeDiv.textContent = texto;
        mensajeDiv.className = "mensaje " + tipo + " visible";
    }
});