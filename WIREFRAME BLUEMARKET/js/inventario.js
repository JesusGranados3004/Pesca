// === VISTAS ===
function mostrarFormulario() {
    document.getElementById('vistaLista').classList.remove('activa');
    document.getElementById('vistaFormulario').classList.add('activa');
}

function mostrarLista() {
    document.getElementById('vistaFormulario').classList.remove('activa');
    document.getElementById('vistaLista').classList.add('activa');
    cargarMisProductos();
}

// === CARGAR PRODUCTOS ===
function cargarMisProductos() {
    fetch('php/mis_productos.php')
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
                return;
            }
            renderMisProductos(data);
            actualizarStats(data);
        })
        .catch(err => {
            console.error('Error:', err);
            document.querySelector('#tablaMisProductos tbody').innerHTML = 
                '<tr><td colspan="6">Error cargando productos</td></tr>';
        });
}

function renderMisProductos(productos) {
    const tbody = document.querySelector('#tablaMisProductos tbody');
    tbody.innerHTML = '';

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No tienes productos registrados. ¡Agrega uno!</td></tr>';
        return;
    }

    productos.forEach(p => {
        const estado = p.disponibilidad == 1 && p.cantidad > 0 
            ? '<span class="disponible">Disponible</span>' 
            : '<span class="nodisponible">No disponible</span>';
        
        const img = p.imagen || 'img/default-producto.svg';
        
        const row = `
            <tr>
                <td><img src="${img}" class="producto-img-tabla" onerror="this.src='img/default-producto.svg'"></td>
                <td>${p.nombre}</td>
                <td>$${p.precio}</td>
                <td>${p.cantidad}</td>
                <td>${estado}</td>
                <td class="acciones">
                    <button class="btn-icono btn-editar" onclick="editarProducto(${p.id})" title="Editar">✏️</button>
                    <button class="btn-icono btn-eliminar" onclick="eliminarProducto(${p.id})" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function actualizarStats(productos) {
    const total = productos.length;
    const activos = productos.filter(p => p.disponibilidad == 1 && p.cantidad > 0).length;
    const agotados = productos.filter(p => p.cantidad == 0 || p.disponibilidad == 0).length;

    document.getElementById('totalProductos').textContent = total;
    document.getElementById('productosActivos').textContent = activos;
    document.getElementById('productosAgotados').textContent = agotados;
}

function editarProducto(id) {
    alert('Editar producto #' + id + ' (en desarrollo)');
}

function eliminarProducto(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    alert('Eliminar producto #' + id + ' (en desarrollo)');
}

function verHistorial() {
    alert('Historial de ventas (en desarrollo)');
}

// === BÚSQUEDA ===
document.addEventListener('DOMContentLoaded', function() {
    const buscarInput = document.getElementById('buscarProducto');
    if (buscarInput) {
        buscarInput.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase();
            const filas = document.querySelectorAll('#tablaMisProductos tbody tr');
            
            filas.forEach(fila => {
                const texto = fila.textContent.toLowerCase();
                fila.style.display = texto.includes(termino) ? '' : 'none';
            });
        });
    }

    // Cargar productos al iniciar
    cargarMisProductos();
});

// === DRAG & DROP ===
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const fileInfo = document.getElementById('fileInfo');
const removeFile = document.getElementById('removeFile');

if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFiles({ target: fileInput });
        }
    });
}

if (fileInput) {
    fileInput.addEventListener('change', handleFiles);
}

function handleFiles(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona solo imágenes (JPG, PNG, WEBP)');
        fileInput.value = '';
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB permitido.');
        fileInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        fileInfo.textContent = `📷 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        previewContainer.style.display = 'block';
        dropZone.querySelector('.drop-zone__icon').style.display = 'none';
        dropZone.querySelector('.drop-zone__text').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

if (removeFile) {
    removeFile.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        previewImage.src = '';
        previewContainer.style.display = 'none';
        dropZone.querySelector('.drop-zone__icon').style.display = 'block';
        dropZone.querySelector('.drop-zone__text').style.display = 'block';
    });
}

// === ENVÍO FORMULARIO ===
const formProducto = document.getElementById('formProducto');
if (formProducto) {
    formProducto.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('php/guardar_producto.php', {
            method: 'POST',
            body: formData
        })
        .then(r => r.text())
        .then(respuesta => {
            if (respuesta.trim() === 'ok') {
                alert('✅ Producto guardado correctamente');
                this.reset();
                fileInput.value = '';
                previewImage.src = '';
                previewContainer.style.display = 'none';
                dropZone.querySelector('.drop-zone__icon').style.display = 'block';
                dropZone.querySelector('.drop-zone__text').style.display = 'block';
                mostrarLista();
            } else {
                alert('❌ Error: ' + respuesta);
            }
        })
        .catch(err => {
            alert('❌ Error de conexión: ' + err);
        });
    });
}