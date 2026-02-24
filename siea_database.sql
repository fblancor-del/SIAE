-- ============================================================
--  SIEA - Sistema Integral para Estudiantes y Administradores
--  Base de datos MySQL
--  Compatible con XAMPP / phpMyAdmin
--  Fecha: 2026
-- ============================================================

-- Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS siea_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_spanish_ci;

USE siea_db;

-- ============================================================
-- TABLA: administradores
-- Usuarios con acceso total al sistema
-- ============================================================
CREATE TABLE administradores (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    usuario       VARCHAR(50)  NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,          -- guardar con password_hash() en PHP
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(100),
    activo        TINYINT(1)   NOT NULL DEFAULT 1,
    creado_en     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: especialidades
-- Carreras / especialidades del plantel
-- ============================================================
CREATE TABLE especialidades (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   TEXT,
    activa        TINYINT(1)   NOT NULL DEFAULT 1,
    creado_en     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: alumnos
-- Datos completos del estudiante
-- ============================================================
CREATE TABLE alumnos (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    numero_control       VARCHAR(20)  NOT NULL UNIQUE,
    nombre_completo      VARCHAR(150) NOT NULL,
    fecha_nacimiento     DATE         NOT NULL,          -- funciona como contraseña de acceso
    email                VARCHAR(100),
    telefono             VARCHAR(20),
    direccion            TEXT,
    seccion              CHAR(1),                        -- A, B, C, D, E
    especialidad_id      INT,
    semestre_actual      TINYINT      NOT NULL DEFAULT 1,
    foto                 LONGTEXT,                       -- imagen en base64
    emergencia_nombre    VARCHAR(150),
    emergencia_telefono  VARCHAR(20),
    activo               TINYINT(1)   NOT NULL DEFAULT 1,
    creado_en            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_alumno_especialidad
        FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: docentes
-- Profesores del plantel
-- ============================================================
CREATE TABLE docentes (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo       VARCHAR(150) NOT NULL,
    email                 VARCHAR(100),
    telefono              VARCHAR(20),
    especialidad          VARCHAR(100),
    horario_disponibilidad TEXT,
    activo                TINYINT(1)  NOT NULL DEFAULT 1,
    creado_en             DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: materias
-- Asignaturas que se imparten en el plantel
-- ============================================================
CREATE TABLE materias (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    especialidad_id INT,
    activa        TINYINT(1)  NOT NULL DEFAULT 1,

    CONSTRAINT fk_materia_especialidad
        FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: calificaciones
-- Calificaciones por alumno, materia, semestre y parcial
-- ============================================================
CREATE TABLE calificaciones (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id     INT          NOT NULL,
    materia_id    INT          NOT NULL,
    docente_id    INT,
    calificacion  DECIMAL(4,1) NOT NULL,             -- ej: 8.5, 10.0
    semestre      TINYINT      NOT NULL,              -- 1 al 6
    parcial       TINYINT      NOT NULL,              -- 1, 2 o 3
    registrado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cal_alumno
        FOREIGN KEY (alumno_id)  REFERENCES alumnos(id)  ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cal_materia
        FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cal_docente
        FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: eventos
-- Eventos academicos, deportivos, culturales, etc.
-- ============================================================
CREATE TABLE eventos (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    titulo        VARCHAR(200) NOT NULL,
    descripcion   TEXT,
    fecha_evento  DATE         NOT NULL,
    hora_evento   TIME,
    lugar         VARCHAR(200),
    tipo          VARCHAR(50),                        -- academico, deportivo, cultural, etc.
    flyer         LONGTEXT,                           -- imagen en base64
    activo        TINYINT(1)  NOT NULL DEFAULT 1,
    creado_en     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: citas
-- Citas entre alumnos y docentes
-- ============================================================
CREATE TABLE citas (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id     INT         NOT NULL,
    docente_id    INT,
    fecha_cita    DATE        NOT NULL,
    hora_cita     TIME        NOT NULL,
    motivo        TEXT,
    estado        ENUM('espera','aceptado','rechazado') NOT NULL DEFAULT 'espera',
    creado_en     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cita_alumno
        FOREIGN KEY (alumno_id)  REFERENCES alumnos(id)  ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cita_docente
        FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: cuadernillos
-- Materiales (libros/cuadernillos) por especialidad
-- ============================================================
CREATE TABLE cuadernillos (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    especialidad_id  INT          NOT NULL,
    nombre           VARCHAR(200) NOT NULL,
    url              VARCHAR(500),                   -- ruta del archivo o enlace externo
    archivo          LONGBLOB,                       -- archivo guardado en BD (opcional)
    subido_en        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cuad_especialidad
        FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: formatos
-- Formatos / documentos descargables por especialidad
-- ============================================================
CREATE TABLE formatos (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    especialidad_id  INT          NOT NULL,
    nombre           VARCHAR(200) NOT NULL,
    url              VARCHAR(500),
    archivo          LONGBLOB,
    subido_en        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_formato_especialidad
        FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DATOS INICIALES (los mismos que tiene el demo)
-- ============================================================

-- Administrador por defecto
-- Usuario: admin | Contraseña: admin123
INSERT INTO administradores (usuario, password, nombre, email) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador SIEA', 'admin@dgeti.edu.mx');
-- NOTA: el hash corresponde a "password" de Laravel por compatibilidad.
-- En PHP usa: password_hash('admin123', PASSWORD_BCRYPT)

-- Especialidades
INSERT INTO especialidades (nombre, descripcion) VALUES
('Programacion',  'Desarrollo de software y aplicaciones'),
('Contabilidad',  'Gestion financiera y contable'),
('Electronica',   'Circuitos y sistemas electronicos'),
('Mecanica',      'Mantenimiento de maquinaria');

-- Materias generales
INSERT INTO materias (nombre, especialidad_id) VALUES
('Matematicas',  NULL),
('Historia',     NULL),
('Fisica',       NULL),
('Quimica',      NULL),
('Programacion', 1),
('Contabilidad', 2),
('Electronica',  3),
('Mecanica',     4);

-- Docentes de ejemplo
INSERT INTO docentes (nombre_completo, especialidad, email, telefono) VALUES
('Prof. Roberto Sanchez',  'Matematicas',  'roberto@escuela.edu.mx', '555-0201'),
('Prof. Ana Martinez',     'Historia',     'ana@escuela.edu.mx',     '555-0202'),
('Prof. Luis Hernandez',   'Programacion', 'luis@escuela.edu.mx',    '555-0203');

-- Alumnos de ejemplo (contraseña = fecha de nacimiento en formato YYYY-MM-DD)
INSERT INTO alumnos (numero_control, nombre_completo, fecha_nacimiento, especialidad_id, seccion, semestre_actual, email, telefono, direccion) VALUES
('2024001', 'Juan Perez Garcia',   '2005-03-15', 1, 'A', 3, 'juan@email.com',  '555-0101', 'Calle 123'),
('2024002', 'Maria Lopez Silva',   '2006-07-22', 2, 'B', 2, 'maria@email.com', '555-0102', 'Calle 456'),
('2024003', 'Carlos Ruiz Mendoza', '2004-11-08', 3, 'A', 4, 'carlos@email.com','555-0103', 'Calle 789');

-- Calificaciones de ejemplo
INSERT INTO calificaciones (alumno_id, materia_id, docente_id, calificacion, semestre, parcial) VALUES
(1, 1, 1, 8.5, 3, 1),
(1, 5, 3, 9.2, 3, 2),
(2, 6, 2, 9.0, 2, 1),
(3, 7, 3, 8.0, 4, 1);

-- Eventos de ejemplo
INSERT INTO eventos (titulo, fecha_evento, hora_evento, lugar, tipo, descripcion) VALUES
('Feria de Ciencias',  '2026-03-15', '10:00:00', 'Auditorio Principal', 'academico',  'Exposicion de proyectos cientificos'),
('Torneo Deportivo',   '2026-03-20', '14:00:00', 'Cancha Deportiva',    'deportivo',  'Torneo interno de futbol');

-- Citas de ejemplo
INSERT INTO citas (alumno_id, docente_id, fecha_cita, hora_cita, motivo, estado) VALUES
(1, 1, '2026-03-10', '11:00:00', 'Revision de calificaciones', 'espera'),
(2, 2, '2026-03-12', '12:30:00', 'Consulta academica',         'espera');

-- ============================================================
-- VISTAS UTILES (opcionales pero muy recomendadas)
-- ============================================================

-- Vista: alumnos con nombre de especialidad
CREATE OR REPLACE VIEW v_alumnos AS
SELECT
    a.id,
    a.numero_control,
    a.nombre_completo,
    a.fecha_nacimiento,
    a.email,
    a.telefono,
    a.direccion,
    a.seccion,
    a.semestre_actual,
    a.foto,
    a.emergencia_nombre,
    a.emergencia_telefono,
    a.activo,
    e.nombre AS especialidad_nombre,
    e.id     AS especialidad_id
FROM alumnos a
LEFT JOIN especialidades e ON a.especialidad_id = e.id
WHERE a.activo = 1;

-- Vista: calificaciones con todos los nombres
CREATE OR REPLACE VIEW v_calificaciones AS
SELECT
    c.id,
    a.nombre_completo   AS alumno_nombre,
    a.numero_control,
    m.nombre            AS materia_nombre,
    d.nombre_completo   AS docente_nombre,
    c.calificacion,
    c.semestre,
    c.parcial,
    c.registrado_en
FROM calificaciones c
JOIN alumnos  a ON c.alumno_id  = a.id
JOIN materias m ON c.materia_id = m.id
LEFT JOIN docentes d ON c.docente_id = d.id;

-- Vista: citas con nombres de alumno y docente
CREATE OR REPLACE VIEW v_citas AS
SELECT
    c.id,
    a.nombre_completo  AS alumno_nombre,
    a.numero_control,
    d.nombre_completo  AS docente_nombre,
    c.fecha_cita,
    c.hora_cita,
    c.motivo,
    c.estado,
    c.creado_en
FROM citas c
JOIN alumnos  a ON c.alumno_id  = a.id
LEFT JOIN docentes d ON c.docente_id = d.id;

-- ============================================================
-- FIN DEL SCRIPT
-- Para importar: Abrir phpMyAdmin > Importar > seleccionar este .sql
-- ============================================================
