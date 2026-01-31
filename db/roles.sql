-- ============================================
-- ROLES.SQL - Usuario con permisos mínimos
-- ============================================

-- Crear usuario para la app (solo lectura en views)
CREATE ROLE app_reports_reader WITH LOGIN PASSWORD 'reports_pass_2026';

-- Permisos básicos
GRANT CONNECT ON DATABASE reportes TO app_reports_reader;
GRANT USAGE ON SCHEMA public TO app_reports_reader;

-- Solo SELECT en las VIEWS (no en tablas)
GRANT SELECT ON view_ventas_por_categoria TO app_reports_reader;
GRANT SELECT ON view_analisis_clientes TO app_reports_reader;
GRANT SELECT ON view_productos_top TO app_reports_reader;
GRANT SELECT ON view_estado_ordenes TO app_reports_reader;
GRANT SELECT ON view_reporte_ejecutivo TO app_reports_reader;
