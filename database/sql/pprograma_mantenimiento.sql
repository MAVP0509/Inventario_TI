-- Script para crear/actualizar el procedimiento pprograma_mantenimiento
-- No incluye una sentencia USE; ejecútalo en la base de datos correspondiente
DROP PROCEDURE IF EXISTS pprograma_mantenimiento;
DELIMITER $$
CREATE PROCEDURE pprograma_mantenimiento(
    IN p_tipos TEXT,
    IN p_orden TEXT,
    IN p_region VARCHAR(100)
)
BEGIN
    DECLARE sql_text TEXT DEFAULT '';

    SET sql_text = CONCAT(
        'SELECT\n',
        '  its.id AS id_equipo,\n',
        '  its.fk_tipo AS equipo,\n',
        '  ct.tipo AS tipo,\n',
        '  cu.nombre AS nombre,\n',
        '  its.ubicacion AS ubicacion,\n',
        '  its.modelo AS modelo,\n',
        '  its.num_serie AS num_serie\n',
        'FROM inventario_ti_sur its\n',
        'JOIN cat_tipo ct ON ct.id = its.fk_tipo\n',
        'JOIN cat_usuarios cu ON cu.id = its.fk_usuario\n',
        'WHERE its.fk_tipo IN (', p_tipos, ')\n',
        '  AND its.estatus <> "Baja"'
    );

    IF (p_region IS NOT NULL AND TRIM(p_region) <> '') THEN
        SET sql_text = CONCAT(sql_text, ' AND cu.region = ', QUOTE(p_region));
    END IF;

    SET sql_text = CONCAT(sql_text, '\nORDER BY FIELD(its.fk_tipo, ', p_orden, ')');

    PREPARE stmt FROM sql_text;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$
DELIMITER ;
