PESCADIRECTA
============
Plataforma de Comercializacion de Pesca Artesanal

Descripcion
-----------
PescaDirecta es una plataforma web que conecta a pescadores artesanales con
consumidores finales, eliminando intermediarios y permitiendo la compra directa
de pescado fresco con trazabilidad completa del origen.

Funcionalidades
---------------
- Catalogo de productos con busqueda y filtros por categoria
- Sistema de autenticacion (consumidores y vendedores)
- Carrito de compras
- Gestion de inventario para vendedores
- Historial de ventas y compras
- Chat con vendedor
- Panel de edicion de productos

Tecnologias
-----------
- Frontend: HTML5, CSS3, JavaScript
- Backend: PHP
- Base de datos: MySQL
- Hosting: Render
- Base de datos en la nube: Railway

Arquitectura
------------
Este proyecto utiliza una arquitectura monolitica, donde el frontend, backend y
acceso a datos forman parte de una unica aplicacion desplegada en Render.

Estructura del proyecto
-----------------------
/
+-- index.html                 # Pagina principal - catalogo de productos
+-- iniciarSesion.html         # Inicio de sesion
+-- registro.html              # Registro de usuarios
+-- pago.html                  # Carrito de compras
+-- inventario.html            # Gestion de inventario (vendedores)
+-- editar_producto.html       # Edicion de productos
+-- historial_ventas.html      # Historial de ventas (vendedores)
+-- mis_compras.html           # Historial de compras (consumidores)
+-- Base_de_datos_pesca.sql    # Esquema y datos de la base de datos
+-- css/                       # Hojas de estilo
|   +-- index.css
|   +-- auth.css
|   +-- tienda.css
|   +-- inventario.css
|   +-- editar_producto.css
|   +-- mis_compras.css
|   +-- modal.css
|   +-- styles.css
+-- js/                        # Scripts JavaScript
|   +-- index.js
|   +-- auth.js
|   +-- sesion.js
|   +-- registro.js
|   +-- tienda.js
|   +-- inventario.js
|   +-- editar_producto.js
|   +-- historial_ventas.js
|   +-- mis_compras.js
+-- php/                       # Backend PHP
|   +-- conexion.php           # Conexion a la base de datos
|   +-- login.php
|   +-- registro.php
|   +-- producto.php
|   +-- procesar_venta.php
|   +-- historial_ventas.php
|   +-- mis_compras.php
|   +-- logout.php
|   +-- verificar_sesion.php
+-- img/                       # Imagenes
+-- uploads/                   # Archivos subidos
+-- README.txt                 # Este archivo

Instalacion
-----------
1. Clonar el repositorio:
   git clone https://github.com/JesusGranados3004/Pesca.git

2. Importar Base_de_datos_pesca.sql en MySQL.

3. Configurar php/conexion.php con las credenciales de Railway.

4. Ejecutar el proyecto en un servidor local (XAMPP, WAMP, etc.) o desplegar
   en Render.

Despliegue
----------
- Frontend y Backend: Render
- Base de datos: Railway (MySQL)
- URL del sistema: https://pesca-mcl1.onrender.com
- Estado: Produccion

Base de datos
-------------
La base de datos esta alojada en Railway con las siguientes tablas:
- consumidores: Usuarios consumidores
- vendedores: Usuarios vendedores (pescadores)
- productos: Catalogo de productos pesqueros
- compras: Cabecera de compras realizadas
- detalle_compra: Detalle de cada compra

Cuentas de demostracion
-----------------------
ATENCION: Estas cuentas son solo para fines de demostracion.
No utilizar en produccion.

Consumidor:
  Correo: juan@gmail.com
  Contrasena: 123456

Vendedor:
  Correo: carlos@gmail.com
  Contrasena: 123456

Autor
-----
Jesus Granados - Desarrollador de Software y Aplicaciones Moviles
Brayan Fontecha - Desarrollador
Fray Romero - Desarrollador

Proyecto desarrollado como parte del programa de formacion en Desarrollo
de Software.
