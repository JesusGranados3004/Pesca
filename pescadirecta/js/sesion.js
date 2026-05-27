document.addEventListener('DOMContentLoaded', function() {

    fetch('php/verificar_sesion.php', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
    })
    .then(r => r.json())
    .then(data => {
        actualizarMenu(data);
    })
    .catch(() => actualizarMenu({logueado: false}));

    function actualizarMenu(sesion) {
        const menu = document.querySelector('.menu');
        if (!menu) return;

        const esIndex = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
        const cerrarSesionLink = esIndex ? '<a href="#" onclick="cerrarSesion(event)" style="background: rgba(255,255,255,0.2); border-radius: 4px;"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>' : '';

        menu.innerHTML = '';

        if (sesion.logueado) {
            const nombre = sesion.nombre || 'Usuario';
            
            if (sesion.tipo === 'vendedor') {
                menu.innerHTML = `
                    <a href="inventario.html"><i class="fas fa-box"></i> MI INVENTARIO</a>
                    <span style="color: white; padding: 8px 15px;"><i class="fas fa-user"></i> ${nombre}</span>
                    ${cerrarSesionLink}
                `;
            } else {
                menu.innerHTML = `
                    <a href="mis_compras.html"><i class="fas fa-clipboard-list"></i> Mis Compras</a>
                    <a href="index.html#productos"><i class="fas fa-search"></i> Productos</a>
                    <span style="color: white; padding: 8px 15px;"><i class="fas fa-user"></i> ${nombre}</span>
                    ${cerrarSesionLink}
                `;
                
                const carrito = document.createElement('div');
                carrito.className = 'carrito-flotante';
                carrito.onclick = () => window.location.href = 'pago.html';
                carrito.innerHTML = '<i class="fas fa-shopping-cart"></i> <span class="carrito-badge" id="badgeCarrito">0</span>';
                document.body.appendChild(carrito);

                if (typeof actualizarBadgeCarrito === 'function') {
                    actualizarBadgeCarrito();
                }
            }
        } else {
            menu.innerHTML = `
                <a href="iniciarSesion.html">INICIAR SESIÓN</a>
                <a href="registro.html" class="btn-primario" style="padding: 8px 20px;">REGISTRARSE</a>
            `;
        }
    }
});

function cerrarSesion(e) {

    e.preventDefault();

    const modal = document.createElement('div');

    modal.className = 'logout-modal';

    modal.innerHTML = `
        <div class="logout-box">

            <div class="logout-icon"><i class="fas fa-sign-out-alt"></i></div>

            <h3>Cerrar sesión</h3>

            <p>¿Deseas cerrar tu sesión actual?</p>

            <div class="logout-actions">

                <button class="btn-cancelar">
                    Cancelar
                </button>

                <button class="btn-confirmar">
                    Sí, salir
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    const btnCancelar =
        modal.querySelector('.btn-cancelar');

    const btnConfirmar =
        modal.querySelector('.btn-confirmar');

    btnCancelar.onclick = () => {

        modal.classList.add('cerrando');

        setTimeout(() => {
            modal.remove();
        }, 300);
    };

    btnConfirmar.onclick = () => {

        btnConfirmar.disabled = true;

        btnConfirmar.textContent = 'Cerrando...';

        fetch('php/logout.php', {
            cache: 'no-store'
        })
        .then(() => {

            localStorage.clear();

            window.location.href =
                'index.html?_=' + new Date().getTime();

        })
        .catch(() => {

            localStorage.clear();

            window.location.href =
                'index.html?_=' + new Date().getTime();

        });

    };
}

window.addEventListener('pageshow', function(event) {
   
    if (event.persisted) {
        
        window.location.reload();
    }
});

function fetchSeguro(url, opciones = {}) {
    
    opciones.cache = 'no-store';
    
    return fetch(url, opciones)
        .then(res => {
            if (res.status === 401) {
                mostrarMensajeSesion();
                window.location.href = "iniciarSesion.html";
                throw new Error("No autorizado");
            }
            return res;
        });
}

function verificarSesion() {
    return fetchSeguro('php/verificar_sesion.php');
}

function mostrarMensajeSesion() {
    let tiempo = 5;
    let mensaje = document.createElement("div");
    mensaje.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#e74c3c;color:white;padding:15px 25px;border-radius:10px;font-size:18px;z-index:9999;";
    document.body.appendChild(mensaje);

    let intervalo = setInterval(() => {
        mensaje.textContent = `<i class="fas fa-lock"></i> Sesión requerida. Redirigiendo en ${tiempo}...`;
        tiempo--;
        if (tiempo < 0) {
            clearInterval(intervalo);
            window.location.href = "iniciarSesion.html";
        }
    }, 1000);
}


window.fetchSeguro = fetchSeguro;
window.verificarSesion = verificarSesion;
window.cerrarSesion = cerrarSesion;