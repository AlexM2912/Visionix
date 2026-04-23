CREATE 	DATABASE bd_autenticacion;
USE bd_autenticacion;

CREATE TABLE usuario (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'USER',
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE_VERIFICACION',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_activacion DATETIME NULL,
    INDEX idx_usuario_email (email),
    INDEX idx_usuario_estado (estado)
);

CREATE TABLE codigo_verificacion (
    id_codigo BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    tipo VARCHAR(20) NOT NULL, 
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_codigo_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_codigo_usuario (id_usuario),
    INDEX idx_codigo_tipo (tipo),
    INDEX idx_codigo_expiracion (fecha_expiracion)
);

CREATE TABLE sesion (
    id_sesion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVA',
    CONSTRAINT fk_sesion_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_sesion_usuario (id_usuario),
    INDEX idx_sesion_token (token),
    INDEX idx_sesion_estado (estado)
);

SELECT * FROM usuario;
SELECT * FROM codigo_verificacion;
SELECT * FROM sesion;