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
    cantidad DECIMAL(10,2),
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
    cantidad DECIMAL(10,2),
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

('Pargo Rojo', 'Pescado fresco del Caribe', 25000, 'https://168benoa.com/wp-content/uploads/2018/04/1-red-snapper-whole.jpg', 'Santa Marta', true, 'Carlos', 10.50, '2026-04-12', 'Artesanal', 1),

('Mojarra', 'Pescado fresco de río', 18000, 'https://tse3.mm.bing.net/th/id/OIP.n4y8C4pTvs_-tBVOPpw8wQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3', 'Magdalena', true, 'Luis', 15.00, '2026-04-11', 'Artesanal', 1);

INSERT INTO consumidores
(nombre, apellido1, apellido2, direccion, telefono, correo, contraseña)
VALUES

('Maria', 'Rodriguez', 'Lopez', 'Rodadero, Santa Marta', '3001112233', 'maria@gmail.com', '123456'),

('Andres', 'Torres', 'Perez', 'Taganga, Santa Marta', '3002223344', 'andres@gmail.com', '123456'),

('Luisa', 'Fernandez', 'Diaz', 'Gaira, Santa Marta', '3003334455', 'luisa@gmail.com', '123456');

INSERT INTO vendedores
(nombre, apellido1, apellido2, fecha_nacimiento, direccion, telefono, correo, contraseña)
VALUES

('Miguel', 'Rojas', 'Castro', '1988-03-12', 'Taganga, Santa Marta', '3011111111', 'miguel@gmail.com', '123456'),

('Pedro', 'Jimenez', 'Suarez', '1992-07-20', 'Pescaíto, Santa Marta', '3022222222', 'pedro@gmail.com', '123456'),

('Jorge', 'Mendoza', 'Ruiz', '1985-11-15', 'Rodadero, Santa Marta', '3033333333', 'jorge@gmail.com', '123456');

INSERT INTO productos
(nombre, descripcion, precio, imagen, origen, disponibilidad,
pescador_responsable, cantidad, fecha, tipo_pesca, vendedor_id)
VALUES

('Pargo Rojo','Pargo fresco capturado en Taganga',28000,
'https://thumbs.dreamstime.com/b/pargo-rojo-entero-fresco-en-el-hielo-107205781.jpg',
'Santa Marta',true,'Miguel Rojas',12,'2026-05-01','Artesanal',1),

('Mojarra','Mojarra fresca del mercado de Santa Marta',18000,
'https://th.bing.com/th/id/R.974527a3f76b8734bdbab7097a0fdf9b?rik=jN5BOnppr1riFw&riu=http%3a%2f%2f1.bp.blogspot.com%2f-3nx71WI-wAo%2fU5CkwSYC2VI%2fAAAAAAAAB8s%2fhvdVleDTquM%2fs1600%2fIM0013512.JPG&ehk=tavuLGW2Rn9lZr5gjxpmlFieE7q0UEz6%2fhCXYxAXwPA%3d&risl=&pid=ImgRaw&r=0',
'Santa Marta',true,'Carlos Lopez',15,'2026-05-02','Artesanal',2),

('Sierra','Sierra fresca pescada en el Caribe',26000,
'https://www.gob.mx/cms/uploads/article/main_image/36219/sierra_blog.jpg',
'Santa Marta',true,'Pedro Jimenez',10,'2026-05-03','Industrial',3),

('Robalo','Robalo premium de Taganga',35000,
'https://www.shutterstock.com/shutterstock/videos/18574922/thumb/1.jpg?ip=x480',
'Santa Marta',true,'Jorge Mendoza',8,'2026-05-04','Industrial',4),

('Atun','Atun fresco capturado en altamar',32000,
'https://img.freepik.com/foto-gratis/atun-fresco-vende-mostrador-pescado-muelle-pescado-crudo-recien-capturado-mostrador-pescado-dieta-mediterranea-enfoque-selectivo_166373-3321.jpg?w=900&t=st=1673385997~exp=1673386597~hmac=20f9fa8abd16a917f280a8acd395076cbb3274efaaef4fe4551b1e81021ac9ce',
'Santa Marta',true,'Miguel Rojas',14,'2026-05-05','Industrial',1),

('Corvina','Corvina artesanal fresca',30000,
'https://cdn.yorso.com/components/products/1490_aaab9f85-0641-47dc-8d42-bacfa9dffc36/images/3bb07b25d8c10b82213b7222d889c50f.JPEG',
'Santa Marta',true,'Carlos Lopez',9,'2026-05-06','Artesanal',2),

('Lisa','Lisa fresca del Caribe colombiano',17000,
'https://tse4.mm.bing.net/th/id/OIP.re_OyF3J60pi7sV6gFXhUQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
'Santa Marta',true,'Pedro Jimenez',20,'2026-05-07','Artesanal',3),

('Bagre','Bagre fresco para sopa',22000,
'https://th.bing.com/th/id/R.022f607fb19e994b7899daafe987e467?rik=Y%2frSrp0Z3MKgSQ&riu=http%3a%2f%2fpescadordeportivo.files.wordpress.com%2f2011%2f10%2fariusspp.jpg&ehk=6Qc97%2bYt%2bMfTrsxwAe%2fSI9srnqhBM4rNO7LFmArufWI%3d&risl=&pid=ImgRaw&r=0',
'Santa Marta',true,'Jorge Mendoza',11,'2026-05-08','Artesanal',4),

('Mero','Mero grande fresco del Caribe',42000,
'https://tse1.explicit.bing.net/th/id/OIP.2bpXG4_V0ztUbvoAzJtREQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3',
'Santa Marta',true,'Miguel Rojas',7,'2026-05-09','Industrial',1),

('Pez Vela','Pez vela fresco de Santa Marta',50000,
'https://www.bigfish.mx/__export/1741238850335/sites/debate/img/2025/03/05/pezvela_25.jpg_673822677.jpg',
'Santa Marta',true,'Carlos Lopez',5,'2026-05-10','Industrial',2),

('Cherna','Cherna fresca capturada en Taganga',39000,
'https://www.mercasa.es/wp-content/uploads/2019/01/cherne_fresco.jpg',
'Santa Marta',true,'Pedro Jimenez',6,'2026-05-11','Artesanal',3),

('Lebranche','Lebranche fresco del Caribe',24000,
'https://th.bing.com/th/id/R.52a0dc85c401c1d9f7b18ab61d3ad73d?rik=Qm%2b5r7rxFRQ8JQ&riu=http%3a%2f%2fleysguide.weebly.com%2fuploads%2f1%2f7%2f0%2f0%2f17008986%2f3195906_orig.jpg&ehk=hDaA5s2iA9zV78CRo2eapaJrKXPtYKC2P%2bkrd4HCzP8%3d&risl=&pid=ImgRaw&r=0',
'Santa Marta',true,'Jorge Mendoza',13,'2026-05-12','Artesanal',4),

('Jurel','Jurel fresco del mercado pesquero',27000,
'https://tse2.mm.bing.net/th/id/OIP.09b5fh7_dVkizjXsAKvSSAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3',
'Santa Marta',true,'Miguel Rojas',10,'2026-05-13','Industrial',1),

('Carite','Carite fresco capturado artesanalmente',31000,
'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB8p45RVC_uP2ffIYpmeOW82w_8QglfCiJaA&s',
'Santa Marta',true,'Carlos Lopez',9,'2026-05-14','Artesanal',2),

('Pampano','Pámpano fresco premium del Caribe',36000,
'https://thumbs.dreamstime.com/b/textura-brillante-de-pompano-blanco-o-lenguado-listo-para-la-venta-423921903.jpg',
'Santa Marta',true,'Pedro Jimenez',8,'2026-05-15','Industrial',3);
select * from compras;