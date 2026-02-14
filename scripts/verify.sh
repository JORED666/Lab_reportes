#!/bin/bash
set -e

echo "=========================================="
echo "🔍 Verificando Sistema de Reportes"
echo "=========================================="
echo ""

# Verificar que Docker Compose está corriendo
echo "1️⃣ Verificando contenedores..."
docker compose ps

echo ""
echo "2️⃣ Verificando VIEWS en PostgreSQL..."
docker compose exec -T db psql -U postgres -d reportes -c "\dv"

echo ""
echo "3️⃣ Probando VIEW 1: Ventas por Categoría"
docker compose exec -T db psql -U postgres -d reportes -c "SELECT * FROM view_ventas_por_categoria LIMIT 3;"

echo ""
echo "4️⃣ Probando VIEW 2: Análisis de Clientes"
docker compose exec -T db psql -U postgres -d reportes -c "SELECT * FROM view_analisis_clientes LIMIT 3;"

echo ""
echo "5️⃣ Probando VIEW 3: Productos Top"
docker compose exec -T db psql -U postgres -d reportes -c "SELECT * FROM view_productos_top LIMIT 3;"

echo ""
echo "6️⃣ Probando VIEW 4: Estado de Órdenes"
docker compose exec -T db psql -U postgres -d reportes -c "SELECT * FROM view_estado_ordenes;"

echo ""
echo "7️⃣ Probando VIEW 5: Reporte Ejecutivo"
docker compose exec -T db psql -U postgres -d reportes -c "SELECT * FROM view_reporte_ejecutivo;"

echo ""
echo "8️⃣ Verificando índices..."
docker compose exec -T db psql -U postgres -d reportes -c "\di"

echo ""
echo "9️⃣ Verificando usuario app_reports_reader..."
docker compose exec -T db psql -U postgres -d reportes -c "\du app_reports_reader"

echo ""
echo "🔟 Verificando permisos en VIEWS..."
docker compose exec -T db psql -U postgres -d reportes -c "\dp view_*"

echo ""
echo "=========================================="
echo "✅ Verificación completada"
echo "=========================================="
echo ""
echo "Abrir http://localhost:3000 para ver la aplicación"
