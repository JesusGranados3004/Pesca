document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById("loginForm");
    const mensajeDiv = document.getElementById("mensaje");

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const datos = new FormData(this);
            mostrarMensaje("Verificando...", "info");

            fetch('php/login.php', { method: 'POST', body: datos })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    mostrarMensaje(data.message, "exito");
                    localStorage.setItem('userTipo', data.tipo);
                    localStorage.setItem('userNombre', data.message.replace('Bienvenido ', ''));
                    
                    setTimeout(() => {
                        location.href = data.tipo === 'vendedor' ? 'inventario.html' : 'index.html';
                    }, 1000);
                } else {
                    mostrarMensaje(data.message, "error");
                }
            })
            .catch(err => mostrarMensaje("Error de conexión", "error"));
        });
    }

    function mostrarMensaje(texto, tipo) {
        if (!mensajeDiv) return;
        mensajeDiv.textContent = texto;
        mensajeDiv.className = "mensaje " + tipo + " visible";
    }
});