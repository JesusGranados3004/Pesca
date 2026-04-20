CREATE DATABASE pesca;
USE pesca;

CREATE TABLE consumidores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido1 varchar(100),
    apellido2 varchar(100),
    direccion varchar(100),
    telefono varchar(100),
    correo VARCHAR(100) UNIQUE,
    contraseña VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido1 varchar(100),
    apellido2 varchar(100),
    fecha_nacimiento DATE,
    direccion VARCHAR(100),
    telefono varchar(100),
    correo VARCHAR(100) UNIQUE,
    contraseña VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion varchar(250),
    precio DECIMAL(10,2),
    imagen VARCHAR(300),

    origen VARCHAR(100),
    disponibilidad BOOLEAN,
    pescador_responsable VARCHAR(100),
    cantidad INT,
    fecha DATE,
    tipo_pesca VARCHAR(100),

    vendedor_id INT,
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)
);

CREATE TABLE compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consumidor_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),

    FOREIGN KEY (consumidor_id) REFERENCES consumidores(id)
);

CREATE TABLE detalle_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT,
    producto_id INT,
    cantidad INT,
    precio DECIMAL(10,2),

    FOREIGN KEY (compra_id) REFERENCES compras(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

INSERT INTO consumidores 
(nombre, apellido1, apellido2, direccion, telefono, correo, contraseña)
VALUES 
('Juan', 'Perez', 'Gomez', 'Calle 10 #20-30', '3001234567', 'juan@gmail.com', '123456');

INSERT INTO vendedores 
(nombre, apellido1, apellido2, fecha_nacimiento, direccion, telefono, correo, contraseña)
VALUES 
('Carlos', 'Lopez', 'Martinez', '1990-05-10', 'Santa Marta', '3009876543', 'carlos@gmail.com', '123456');

INSERT INTO productos 
(nombre, descripcion, precio,imagen, origen, disponibilidad, pescador_responsable, cantidad, fecha, tipo_pesca, vendedor_id)
VALUES 

('Pargo Rojo', 'Pescado fresco del Caribe', 25000, 'https://168benoa.com/wp-content/uploads/2018/04/1-red-snapper-whole.jpg', 'Santa Marta', true, 'Carlos', 10, '2026-04-12', 'Artesanal', 1),

('Mojarra', 'Pescado fresco de río', 18000, 'https://tse3.mm.bing.net/th/id/OIP.n4y8C4pTvs_-tBVOPpw8wQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3', 'Magdalena', true, 'Luis', 15, '2026-04-11', 'Artesanal', 1);

select * from consumidores;