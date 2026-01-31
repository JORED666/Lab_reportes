-- ============================================
-- INDEXES.SQL - Índices para optimización
-- ============================================

-- Índice 1: Para JOINs productos-categorías (nuevo)
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);

-- Índice 2: Ya existe en schema.sql, skip

-- Índice 3: Para agregaciones en orden_detalles (nuevo)
CREATE INDEX IF NOT EXISTS idx_orden_detalles_producto ON orden_detalles(producto_id, cantidad, subtotal);

-- Índice 4: Para usuarios activos (nuevo)
CREATE INDEX IF NOT EXISTS idx_usuarios_activos ON usuarios(activo) WHERE activo = TRUE;
