function mostrarFormulario() {
    document.getElementById('vistaLista').classList.remove('activa');
    document.getElementById('vistaFormulario').classList.add('activa');
}

function mostrarLista() {
    document.getElementById('vistaFormulario').classList.remove('activa');
    document.getElementById('vistaLista').classList.add('activa');
    cargarMisProductos();
}

function cargarMisProductos() {
    fetchSeguro('php/producto.php?origen=mis_productos')
        .then(res => res.json())  // ✅ Hacer .json() aquí
        .then(data => {
            if (data.error) {
                if (data.redirect) {
                    window.location.href = data.redirect;
                    return;
                }
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No tienes productos. ¡Agrega uno!</td></tr>';
        return;
    }
    productos.forEach(p => {
        const estado = p.disponibilidad == 1 && parseFloat(p.cantidad) > 0 
            ? '<span class="disponible">Disponible</span>' 
            : '<span class="nodisponible">No disponible</span>';
        const img = p.imagen || 'img/default-producto.svg';
        const row = `
            <tr>
                <td><img src="${img}" class="producto-img-tabla" onerror="this.src='img/default-producto.svg'"></td>
                <td>${p.nombre}</td>
                <td>$${p.precio}</td>
                <td>${parseFloat(p.cantidad).toFixed(2)} kg</td>
                <td>${estado}</td>
                <td class="acciones">
                    <button class="btn-icono btn-editar" onclick="editarProducto(${p.id})" title="Editar">✏️</button>
                    <button class="btn-icono btn-eliminar" onclick="eliminarProducto(${p.id})" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function actualizarStats(productos) {
    const total = productos.length;
    const activos = productos.filter(p => p.disponibilidad == 1 && parseFloat(p.cantidad) > 0).length;
    const agotados = productos.filter(p => parseFloat(p.cantidad) <= 0 || p.disponibilidad == 0).length;
    document.getElementById('totalProductos').textContent = total;
    document.getElementById('productosActivos').textContent = activos;
    document.getElementById('productosAgotados').textContent = agotados;
}

function editarProducto(id) {

    fetchSeguro('php/verificar_sesion.php')
        .then(res => res.json())
        .then(data => {

            if (data.logueado && data.tipo === 'vendedor') {

                window.location.href =
                    "editar_producto.html?id=" + id;

            } else {

                mostrarMensajeSesion();

            }

        })
        .catch(err => {
            console.error(err);
            mostrarMensajeSesion();
        });

}

function eliminarProducto(id) {

    if (!confirm("¿Eliminar este producto?")) return;

    fetchSeguro("php/producto.php?origen=eliminar_producto&id=" + id, {
        method: "DELETE"
    })
    .then(res => res.text())
    .then(respuesta => {

        if (respuesta.trim() === "ok") {

            alert("🗑️ Producto eliminado");

            cargarMisProductos();

        } else {

            alert("❌ " + respuesta);

        }

    })
    .catch(err => {
        console.error(err);
        alert("Error eliminando");
    });

}

function verHistorial() {
    window.location.href = "historial_ventas.html";
}

const buscarInput = document.getElementById('buscarProducto');
if (buscarInput) {
    buscarInput.addEventListener('input', function(e) {
        const termino = e.target.value.toLowerCase();
        document.querySelectorAll('#tablaMisProductos tbody tr').forEach(fila => {
            fila.style.display = fila.textContent.toLowerCase().includes(termino) ? '' : 'none';
        });
    });
}

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const fileInfo = document.getElementById('fileInfo');
const removeFile = document.getElementById('removeFile');

if (dropZone) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFiles({ target: fileInput });
        }
    });
}

if (fileInput) fileInput.addEventListener('change', handleFiles);

function handleFiles(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Solo imágenes'); fileInput.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); fileInput.value = ''; return; }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        fileInfo.textContent = `📷 ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
        previewContainer.style.display = 'block';
        dropZone.querySelector('.drop-zone__icon').style.display = 'none';
        dropZone.querySelector('.drop-zone__text').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

if (removeFile) {
    removeFile.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = ''; previewImage.src = ''; previewContainer.style.display = 'none';
        dropZone.querySelector('.drop-zone__icon').style.display = 'block';
        dropZone.querySelector('.drop-zone__text').style.display = 'block';
    });
}

const formProducto = document.getElementById('formProducto');
if (formProducto) {
    formProducto.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        fetch('php/producto.php?origen=guardar_productos', {
            method: 'POST',
            body: formData
        })
        .then(r => r.text())
        .then(respuesta => {
            if (respuesta.includes('No autorizado') || respuesta.includes('vendedor')) {
                alert('Sesión expirada. Redirigiendo...');
                window.location.href = 'iniciarSesion.html';
                return;
            }
            if (respuesta.trim() === 'ok') {
                alert('✅ Producto guardado');
                this.reset();
                fileInput.value = ''; previewImage.src = ''; previewContainer.style.display = 'none';
                dropZone.querySelector('.drop-zone__icon').style.display = 'block';
                dropZone.querySelector('.drop-zone__text').style.display = 'block';
                mostrarLista();
            } else {
                alert('❌ Error: ' + respuesta);
            }
        })
        .catch(err => alert('❌ Error: ' + err));
    });
}