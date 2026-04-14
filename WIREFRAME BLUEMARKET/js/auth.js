document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById("loginForm");
    const mensajeDiv = document.getElementById("mensaje");

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            console.log("Submit login detectado");
            e.preventDefault();

            const datos = new FormData(this);
            
            mostrarMensaje("Verificando...", "info");

            fetch('php/login.php', {
                method: 'POST',
                body: datos
            })
            .then(r => r.json())
            .then(data => {
                console.log("Respuesta:", data);

                if (data.success) {
                    mostrarMensaje(data.message, "exito");
                    
                    localStorage.setItem('userTipo', data.tipo);
                    localStorage.setItem('userNombre', data.message.replace('Bienvenido ', ''));
                    
                    setTimeout(() => {
                        if (data.tipo === 'vendedor') {
                            location.href = 'inventario.html';
                        } else {
                            location.href = 'index.html';
                        }
                    }, 1000);
                } else {
                    mostrarMensaje(data.message, "error");
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