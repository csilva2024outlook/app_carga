-- Migración: Agregar nuevos campos a la tabla users
-- Fecha: 12/01/2026

USE db_carga;

-- Agregar las nuevas columnas
ALTER TABLE users 
ADD COLUMN comments VARCHAR(100) NULL,
ADD COLUMN status_type INT NOT NULL DEFAULT 1,
ADD COLUMN request_date TIMESTAMP NULL,
ADD COLUMN saldo DECIMAL(18,2) NOT NULL DEFAULT 0.00;

-- Actualizar usuarios existentes con valores por defecto
UPDATE users 
SET status_type = 1, 
    saldo = 0.00 
WHERE status_type IS NULL OR saldo IS NULL;

-- Verificar la estructura de la tabla
DESCRIBE users;
