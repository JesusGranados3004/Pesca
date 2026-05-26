document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const datos = new FormData(this);
            const verifyingToast = mostrarToast("Verificando...", "info");

            fetch('php/login.php', { method: 'POST', body: datos })
            .then(r => r.json())
            .then(data => {
                if (verifyingToast && typeof verifyingToast.dismiss === 'function') {
                    verifyingToast.dismiss();
                }
                if (data.success) {

                    localStorage.setItem('userTipo', data.tipo);

                    // SOLO PARA MOSTRAR UNA VEZ
                    sessionStorage.setItem(
                        'toastBienvenida',
                        JSON.stringify({
                            mensaje: data.message,
                            tipo: data.tipo,
                            toastTipo: 'exito'
                        })
                    );

                    setTimeout(() => {

                        location.href =
                            data.tipo === 'vendedor'
                            ? 'inventario.html'
                            : 'index.html';

                    }, 1200);
                } else {
                    mostrarToast("Contraseña o usuario incorrecta", "error");
                }
            })
            .catch(err => {
                if (verifyingToast && typeof verifyingToast.dismiss === 'function') {
                    verifyingToast.dismiss();
                }
                mostrarToast("Error de conexión", "error");
            });
        });
    }
});

function mostrarToast(mensaje, tipo = 'info', onComplete = null) {

    const iconos = {
        error: '❌',
        exito: '✅',
        aviso: '⚠️',
        info: 'ℹ️'
    };

    let container = document.getElementById('toast-container');

    if (!container) {

        container = document.createElement('div');
        container.id = 'toast-container';

        document.body.appendChild(container);
    }

    const toast = document.createElement('div');

    toast.className = `toast ${tipo}`;

    toast.innerHTML = `
        <span class="toast-icon">${iconos[tipo] || iconos.info}</span>
        <span>${mensaje}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('mostrar');
    });

    let hideTimeout = setTimeout(hideAndRemove, 3000);

    function hideAndRemove() {
        clearTimeout(hideTimeout);
        toast.classList.remove('mostrar');
        toast.classList.add('ocultar');

        setTimeout(() => {
            toast.remove();
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }, 400);
    }

    toast.dismiss = hideAndRemove;
    return toast;
}