-- ============================================
-- VIEW 1: Ventas por Categoría
-- ============================================
-- Grain: Una fila por categoría
-- Métricas: total_ventas, total_ordenes, ticket_promedio, ranking, porcentaje
-- Usa GROUP BY para agrupar por categoría
-- Usa HAVING para filtrar categorías con ventas > 0
-- VERIFY:
--   SELECT COUNT(*) FROM view_ventas_por_categoria;
--   SELECT SUM(porcentaje_total_ventas) FROM view_ventas_por_categoria;

CREATE OR REPLACE VIEW view_ventas_por_categoria AS
SELECT 
    c.id AS categoria_id,
    c.nombre AS categoria,
    COUNT(DISTINCT o.id) AS total_ordenes,
    SUM(od.subtotal) AS total_ventas,
    ROUND(AVG(od.subtotal), 2) AS ticket_promedio,
    RANK() OVER (ORDER BY SUM(od.subtotal) DESC) AS ranking_ventas,
    ROUND(100.0 * SUM(od.subtotal) / SUM(SUM(od.subtotal)) OVER (), 2) AS porcentaje_total_ventas,
    CASE 
        WHEN SUM(od.subtotal) >= 1000 THEN 'Excelente'
        WHEN SUM(od.subtotal) >= 500 THEN 'Bueno'
        ELSE 'Regular'
    END AS performance_categoria
FROM categorias c
INNER JOIN productos p ON c.id = p.categoria_id
INNER JOIN orden_detalles od ON p.id = od.producto_id
INNER JOIN ordenes o ON od.orden_id = o.id
WHERE o.status != 'cancelado'
GROUP BY c.id, c.nombre
HAVING SUM(od.subtotal) > 0
ORDER BY total_ventas DESC;

-- ============================================
-- VIEW 2: Análisis de Clientes
-- ============================================
-- Grain: Una fila por cliente activo
-- Métricas: cantidad_ordenes, total_gastado, promedio_por_orden, segmento_cliente
-- Usa CTE para filtrar órdenes completadas
-- Usa GROUP BY para agrupar por cliente
-- VERIFY:
--   SELECT COUNT(*) FROM view_analisis_clientes;
--   SELECT segmento_cliente, COUNT(*) FROM view_analisis_clientes GROUP BY segmento_cliente;

CREATE OR REPLACE VIEW view_analisis_clientes AS
WITH ordenes_completadas AS (
    SELECT usuario_id, id, total, created_at
    FROM ordenes
    WHERE status IN ('pagado', 'enviado', 'entregado')
)
SELECT 
    u.id AS usuario_id,
    u.nombre,
    u.email,
    COUNT(oc.id) AS cantidad_ordenes,
    COALESCE(SUM(oc.total), 0) AS total_gastado,
    ROUND(COALESCE(AVG(oc.total), 0), 2) AS promedio_por_orden,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(oc.total), 0) DESC) AS orden_valor,
    CASE 
        WHEN COALESCE(SUM(oc.total), 0) >= 1000 THEN 'VIP'
        WHEN COUNT(oc.id) >= 2 THEN 'Regular'
        WHEN COUNT(oc.id) >= 1 THEN 'Activo'
        ELSE 'Nuevo'
    END AS segmento_cliente
FROM usuarios u
LEFT JOIN ordenes_completadas oc ON u.id = oc.usuario_id
WHERE u.activo = TRUE
GROUP BY u.id, u.nombre, u.email
HAVING COUNT(oc.id) > 0 OR COALESCE(SUM(oc.total), 0) >= 0
ORDER BY total_gastado DESC;

-- ============================================
-- VIEW 3: Productos Top
-- ============================================
-- Grain: Una fila por producto vendido
-- Métricas: unidades_vendidas, ingresos_totales, ranking, alerta_inventario
-- Usa GROUP BY para agrupar por producto
-- Usa HAVING para filtrar productos con ventas > 0
-- VERIFY:
--   SELECT COUNT(*) FROM view_productos_top;
--   SELECT alerta_inventario, COUNT(*) FROM view_productos_top GROUP BY alerta_inventario;

CREATE OR REPLACE VIEW view_productos_top AS
SELECT 
    p.id AS producto_id,
    p.codigo,
    p.nombre AS producto,
    c.nombre AS categoria,
    p.precio AS precio_actual,
    p.stock AS stock_actual,
    SUM(od.cantidad) AS unidades_vendidas,
    SUM(od.subtotal) AS ingresos_totales,
    RANK() OVER (ORDER BY SUM(od.cantidad) DESC) AS ranking_ventas,
    CASE 
        WHEN p.stock = 0 THEN 'SIN STOCK'
        WHEN p.stock < SUM(od.cantidad) / 2 THEN 'CRÍTICO'
        WHEN p.stock < SUM(od.cantidad) THEN 'BAJO'
        ELSE 'NORMAL'
    END AS alerta_inventario
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id
INNER JOIN orden_detalles od ON p.id = od.producto_id
INNER JOIN ordenes o ON od.orden_id = o.id
WHERE p.activo = TRUE AND o.status != 'cancelado'
GROUP BY p.id, p.codigo, p.nombre, p.precio, p.stock, c.nombre
HAVING SUM(od.cantidad) > 0
ORDER BY unidades_vendidas DESC;

-- ============================================
-- VIEW 4: Estado de Órdenes
-- ============================================
-- Grain: Una fila por status de orden
-- Métricas: total_ordenes, valor_total, valor_promedio, porcentaje, prioridad
-- Usa GROUP BY para agrupar por status
-- Usa HAVING para filtrar status con valor > 0
-- VERIFY:
--   SELECT SUM(porcentaje_ordenes) FROM view_estado_ordenes;
--   SELECT status, total_ordenes FROM view_estado_ordenes;

CREATE OR REPLACE VIEW view_estado_ordenes AS
SELECT 
    status,
    COUNT(*) AS total_ordenes,
    SUM(total) AS valor_total,
    ROUND(AVG(total), 2) AS valor_promedio,
    MIN(total) AS valor_minimo,
    MAX(total) AS valor_maximo,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS porcentaje_ordenes,
    CASE 
        WHEN status = 'pendiente' THEN 'ALTA'
        WHEN status = 'pagado' THEN 'MEDIA'
        ELSE 'BAJA'
    END AS prioridad_atencion
FROM ordenes
GROUP BY status
HAVING SUM(total) > 0
ORDER BY 
    CASE status
        WHEN 'pendiente' THEN 1
        WHEN 'pagado' THEN 2
        WHEN 'enviado' THEN 3
        WHEN 'entregado' THEN 4
        ELSE 5
    END;

-- ============================================
-- VIEW 5: Reporte Ejecutivo
-- ============================================
-- Grain: Una sola fila con métricas consolidadas
-- Métricas: KPIs del negocio (clientes, productos, ventas, health score)
-- Usa 4 CTEs para organizar métricas
-- VERIFY:
--   SELECT * FROM view_reporte_ejecutivo;
--   SELECT health_score_negocio FROM view_reporte_ejecutivo;

CREATE OR REPLACE VIEW view_reporte_ejecutivo AS
WITH metricas_clientes AS (
    SELECT 
        COUNT(*) FILTER (WHERE activo = TRUE) AS clientes_activos,
        COUNT(*) AS total_clientes
    FROM usuarios
),
metricas_productos AS (
    SELECT 
        COUNT(*) AS total_productos,
        SUM(stock) AS unidades_inventario,
        ROUND(AVG(precio), 2) AS precio_promedio
    FROM productos
),
metricas_ventas AS (
    SELECT 
        COUNT(*) AS total_ordenes,
        COUNT(*) FILTER (WHERE status IN ('pagado', 'enviado', 'entregado')) AS ordenes_exitosas,
        SUM(total) AS ingresos_totales,
        ROUND(AVG(total), 2) AS ticket_promedio
    FROM ordenes
)
SELECT 
    mc.clientes_activos,
    mc.total_clientes,
    mp.total_productos,
    mp.unidades_inventario,
    mp.precio_promedio,
    mv.total_ordenes,
    mv.ordenes_exitosas,
    ROUND(mv.ingresos_totales::numeric, 2) AS ingresos_totales,
    mv.ticket_promedio,
    ROUND(COALESCE(100.0 * mv.ordenes_exitosas / NULLIF(mv.total_ordenes, 0), 0), 2) AS tasa_exito_ordenes,
    CASE 
        WHEN mv.ordenes_exitosas::float / NULLIF(mv.total_ordenes, 0) >= 0.8 THEN 'Excelente'
        WHEN mv.ordenes_exitosas::float / NULLIF(mv.total_ordenes, 0) >= 0.6 THEN 'Bueno'
        ELSE 'Regular'
    END AS health_score_negocio
FROM metricas_clientes mc
CROSS JOIN metricas_productos mp
CROSS JOIN metricas_ventas mv;
