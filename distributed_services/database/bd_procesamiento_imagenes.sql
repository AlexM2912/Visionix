CREATE DATABASE bd_procesamiento_imagenes;
USE bd_procesamiento_imagenes;

CREATE TABLE nodo_trabajador (
    id_nodo BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion_red VARCHAR(150) NOT NULL,
    puerto INT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    carga_actual INT NOT NULL DEFAULT 0,
    capacidad_maxima INT NOT NULL DEFAULT 50,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_nodo_direccion_puerto (direccion_red, puerto),
    INDEX idx_nodo_estado (estado)
);

CREATE TABLE solicitud_lote (
    id_lote BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    fecha_recepcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    porcentaje_progreso DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    cantidad_imagenes INT NOT NULL DEFAULT 0,
    INDEX idx_solicitud_usuario (usuario_id),
    INDEX idx_solicitud_estado (estado)
);

CREATE TABLE imagen_solicitud (
    id_imagen BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_lote BIGINT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_original VARCHAR(255) NOT NULL,
    ruta_resultado VARCHAR(255) NULL,
    formato_entrada VARCHAR(20) NULL,
    formato_salida VARCHAR(20) NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    fecha_recepcion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_procesamiento DATETIME NULL,
    tiempo_ejecucion DECIMAL(10,2) NULL,
    id_nodo BIGINT NULL,
    CONSTRAINT fk_imagen_lote
        FOREIGN KEY (id_lote) REFERENCES solicitud_lote(id_lote)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_imagen_nodo
        FOREIGN KEY (id_nodo) REFERENCES nodo_trabajador(id_nodo)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_imagen_lote (id_lote),
    INDEX idx_imagen_nodo (id_nodo),
    INDEX idx_imagen_estado (estado)
);

CREATE TABLE transformacion (
    id_transformacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_imagen BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    orden_transformacion INT NOT NULL,
    parametros TEXT NULL,
    CONSTRAINT fk_transformacion_imagen
        FOREIGN KEY (id_imagen) REFERENCES imagen_solicitud(id_imagen)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_transformacion_imagen (id_imagen),
    INDEX idx_transformacion_orden (orden_transformacion)
);

CREATE TABLE resultado_procesamiento (
    id_resultado BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_imagen BIGINT NOT NULL UNIQUE,
    ruta_archivo VARCHAR(255) NOT NULL,
    formato_salida VARCHAR(20) NOT NULL,
    fecha_generacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tiempo_ejecucion DECIMAL(10,2) NOT NULL,
    tamano_archivo_kb DECIMAL(10,2) NULL,
    CONSTRAINT fk_resultado_imagen
        FOREIGN KEY (id_imagen) REFERENCES imagen_solicitud(id_imagen)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE log_trabajo (
    id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_imagen BIGINT NOT NULL,
    nivel VARCHAR(20) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_imagen
        FOREIGN KEY (id_imagen) REFERENCES imagen_solicitud(id_imagen)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    INDEX idx_log_imagen (id_imagen),
    INDEX idx_log_nivel (nivel)
);

INSERT INTO nodo_trabajador (nombre, direccion_red, puerto, estado, carga_actual, capacidad_maxima)
VALUES
('nodo-1', 'localhost', 50051, 'ACTIVO', 0, 50),
('nodo-2', 'localhost', 50062, 'ACTIVO', 0, 50),
('nodo-3', 'localhost', 50053, 'ACTIVO', 0, 50);

SELECT * FROM nodo_trabajador;
SELECT * FROM solicitud_lote;
SELECT * FROM imagen_solicitud;
SELECT * FROM transformacion;
SELECT * FROM resultado_procesamiento;
SELECT * FROM log_trabajo;
	
USE bd_procesamiento_imagenes;

SELECT * FROM solicitud_lote ORDER BY id_lote DESC;
SELECT * FROM imagen_solicitud ORDER BY id_imagen DESC;
SELECT * FROM resultado_procesamiento ORDER BY id_resultado DESC;
SELECT * FROM log_trabajo ORDER BY id_log DESC;