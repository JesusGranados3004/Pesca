function cargarMisCompras() {
    fetchSeguro('php/mis_compras.php')
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                mostrarToast('Error: ' + data.error, 'error');
                return;
            }
            renderCompras(data);
        })
        .catch(err => {
            console.error('Error cargando compras:', err);
            document.getElementById('comprasContainer').innerHTML = 
                '<p style="text-align:center; padding:40px;">Error cargando historial de compras</p>';
        });
}

function renderCompras(compras) {
    const container = document.getElementById('comprasContainer');
    const sinCompras = document.getElementById('sinCompras');
    
    if (!compras || compras.length === 0) {
        container.innerHTML = '';
        sinCompras.style.display = 'block';
        return;
    }
    
    sinCompras.style.display = 'none';
    container.innerHTML = '';
    
    compras.forEach(compra => {
        const fecha = new Date(compra.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let itemsHTML = '';
        compra.items.forEach(item => {
            const imagen = item.imagen || 'img/default-producto.svg';
            itemsHTML += `
                <div class="item-compra">
                    <img src="${imagen}" alt="${item.nombre}" onerror="this.src='img/default-producto.svg'">
                    <div class="item-info">
                        <h4>${item.nombre}</h4>
                        <p>📍 ${item.origen || 'Origen no especificado'}</p>
                        <p>👤 Vendedor: ${item.vendedor}</p>
                        <p>⚖️ ${item.cantidad.toFixed(2)} kg × $${item.precio_unitario.toLocaleString()} = <strong>$${item.subtotal.toLocaleString()}</strong></p>
                    </div>
                    <a href="https://wa.me/${formatearTelefono(item.vendedor_telefono)}" target="_blank" class="btn-whatsapp" title="Contactar vendedor">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            `;
        });
        
        const compraCard = `
            <div class="compra-card">
                <div class="compra-header">
                    <div>
                        <span class="compra-id">Orden #${compra.id}</span>
                        <span class="compra-fecha">${fechaFormateada}</span>
                    </div>
                    <div class="compra-total">Total: $${compra.total.toLocaleString()}</div>
                </div>
                <div class="compra-items">
                    ${itemsHTML}
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', compraCard);
    });
}

function formatearTelefono(telefono) {
    if (!telefono) return '';
    let t = telefono.replace(/\D/g, '');
    if (t.startsWith('3') && t.length === 10) t = '57' + t;
    return t;
}

function mostrarToast(mensaje, tipo = 'info', duracion = 3000) {

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

    setTimeout(() => {

        toast.classList.remove('mostrar');
        toast.classList.add('ocultar');

        setTimeout(() => {
            toast.remove();
        }, 400);

    }, duracion);
}