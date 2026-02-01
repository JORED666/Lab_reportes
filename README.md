# Tarea 6: Lab Reportes SQL con Next.js

Sistema de reportes con PostgreSQL Views, Next.js 14 y Docker Compose.

  
Matrícula: 243842  
Materia: Bases de Datos Avanzadas  
Fecha:31 Enero 2026

---

## Inicio Rápido
```bash
# UN SOLO COMANDO levanta todo:
docker compose up --build

# Esperar ~2 minutos
# Abrir: http://localhost:3000
```

Para desarrollo local:
```bash
docker compose up -d              # Solo DB
cd app
npm install
export DATABASE_URL="postgres://app_reports_reader:reports_pass_2026@localhost:5433/reportes"
npm run dev                       # App en modo dev
```

---

## 📊 Estructura del Proyecto
```
tarea6-reportes/
├── db/
│   ├── schema.sql           # Tablas base (5 tablas)
│   ├── seed.sql             # Datos de prueba
│   ├── reports_vw.sql       # 5 VIEWS con comentarios
│   ├── indexes.sql          # 3 índices optimizados
│   └── roles.sql            # Usuario con permisos mínimos
├── app/
│   ├── app/
│   │   ├── page.js          # Dashboard principal
│   │   ├── layout.js        # Layout global
│   │   └── reports/
│   │       ├── 1/page.js    # Ventas por Categoría
│   │       ├── 2/page.js    # Análisis de Clientes  FILTROS + PAGINACIÓN
│   │       ├── 3/page.js    # Productos Top  PAGINACIÓN
│   │       ├── 4/page.js    # Estado de Órdenes
│   │       └── 5/page.js    # Reporte Ejecutivo
│   ├── lib/
│   │   ├── db.js            # Conexión PostgreSQL
│   │   └── validations.js   #  Validación Zod
│   └── package.json
├── docker-compose.yml       
├── README.md
└── .gitignore
```

---

## 🗄️ VIEWS Creadas (5)

### 1️⃣ view_ventas_por_categoria
**Grain:** Una fila por categoría  
**Métricas:** Total ventas, órdenes, ticket promedio, ranking  
**Features SQL:**
- ✅ `SUM`, `COUNT`, `AVG` (agregaciones)
- ✅ `RANK() OVER` (Window Function)
- ✅ `CASE` (clasificación Excelente/Bueno/Regular)
- ✅ `GROUP BY` + `HAVING`
- ✅ Porcentajes del total

**VERIFY:**
```sql
SELECT COUNT(*) FROM view_ventas_por_categoria;
SELECT SUM(porcentaje_total_ventas) FROM view_ventas_por_categoria; -- ~100
```

### 2️⃣ view_analisis_clientes
**Grain:** Una fila por cliente activo  
**Métricas:** Total gastado, cantidad órdenes, segmento  
**Features SQL:**
- ✅ `CTE (WITH ordenes_completadas AS ...)`
- ✅ `ROW_NUMBER()` (Window Function)
- ✅ `COALESCE` (manejo de NULL)
- ✅ `CASE` (segmentación VIP/Regular/Activo/Nuevo)
- ✅ `GROUP BY`

**VERIFY:**
```sql
SELECT segmento_cliente, COUNT(*) FROM view_analisis_clientes GROUP BY segmento_cliente;
```

**⭐ EN LA APP:**
- Filtros por segmento (validados con Zod)
- Paginación server-side (limit/offset)

### 3️⃣ view_productos_top
**Grain:** Una fila por producto vendido  
**Métricas:** Unidades vendidas, ingresos, stock  
**Features SQL:**
- ✅ `RANK()` (Window Function)
- ✅ `CASE` (alertas: SIN STOCK/CRÍTICO/BAJO/NORMAL)
- ✅ `SUM`, `GROUP BY`, `HAVING`

**VERIFY:**
```sql
SELECT alerta_inventario, COUNT(*) FROM view_productos_top GROUP BY alerta_inventario;
```

**⭐ EN LA APP:**
- Paginación server-side validada con Zod

### 4️⃣ view_estado_ordenes
**Grain:** Una fila por status  
**Métricas:** Total órdenes, valor, promedios  
**Features SQL:**
- ✅ `SUM`, `AVG`, `MIN`, `MAX`
- ✅ Window Function para porcentajes
- ✅ `CASE` (prioridad ALTA/MEDIA/BAJA)
- ✅ `GROUP BY`, `HAVING`

**VERIFY:**
```sql
SELECT SUM(porcentaje_ordenes) FROM view_estado_ordenes; -- ~100
```

### 5️⃣ view_reporte_ejecutivo
**Grain:** Una sola fila (resumen general)  
**Métricas:** KPIs consolidados del negocio  
**Features SQL:**
- ✅ **4 CTEs** (metricas_clientes, metricas_productos, metricas_ventas)
- ✅ `FILTER` (agregaciones condicionales)
- ✅ `COALESCE` + `NULLIF` (división segura)
- ✅ `CASE` (health score)

**VERIFY:**
```sql
SELECT * FROM view_reporte_ejecutivo; -- debe retornar 1 fila
```

---

## 📈 Índices Creados (3)

### 1. `idx_productos_categoria`
```sql
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
```
**Justificación:** Optimiza JOINs frecuentes entre `productos` y `categorias` en todas las VIEWS.

### 2. `idx_orden_detalles_producto`
```sql
CREATE INDEX idx_orden_detalles_producto ON orden_detalles(producto_id, cantidad, subtotal);
```
**Justificación:** Acelera agregaciones (`SUM`, `COUNT`) en `orden_detalles` usadas en múltiples VIEWS.

### 3. `idx_usuarios_activos`
```sql
CREATE INDEX idx_usuarios_activos ON usuarios(activo) WHERE activo = TRUE;
```
**Justificación:** Índice parcial para filtrar usuarios activos eficientemente en `view_analisis_clientes`.

---

## Seguridad Implentada

### Usuario con Permisos Mínimos
```sql
CREATE ROLE app_reports_reader WITH LOGIN PASSWORD 'reports_pass_2026';
GRANT CONNECT ON DATABASE reportes TO app_reports_reader;
GRANT USAGE ON SCHEMA public TO app_reports_reader;

-- Solo SELECT en VIEWS (NO en tablas)
GRANT SELECT ON view_ventas_por_categoria TO app_reports_reader;
GRANT SELECT ON view_analisis_clientes TO app_reports_reader;
GRANT SELECT ON view_productos_top TO app_reports_reader;
GRANT SELECT ON view_estado_ordenes TO app_reports_reader;
GRANT SELECT ON view_reporte_ejecutivo TO app_reports_reader;

### A) Base de Datos SQL
-  5 VIEWS con comentarios (grain, métricas, VERIFY)
-  Todas con funciones agregadas (SUM/COUNT/AVG/MIN/MAX)
-  Todas con GROUP BY
-  2+ con HAVING
-  2+ con CASE/COALESCE (todas las usan)
-  1+ con CTE (view_analisis_clientes tiene 1, view_reporte_ejecutivo tiene 4)
-  1+ con Window Function (RANK, ROW_NUMBER)
-  Sin SELECT * (todas listan columnas específicas)
-  3 índices justificados
-  Usuario con permisos mínimos

### B) Next.js App
-  App Router (/app)
-  Dashboard + 5 reportes
-  Server Components
-  Título + descripción + tabla + KPIs en cada reporte
-  NO expone credenciales
-  Queries parametrizadas


### C) Docker Compose
-  docker compose up --build
-  Inicialización automática de DB
-  Health checks
-  Un solo comando funcional

---

## Verificación del Sistema

### Verificar VIEWS
```bash
docker compose exec db psql -U postgres -d reportes
```
```sql
\dv                                          -- Listar VIEWS
SELECT * FROM view_ventas_por_categoria;     -- Probar VIEW 1
SELECT * FROM view_analisis_clientes LIMIT 5;
SELECT * FROM view_reporte_ejecutivo;
\q
```

### Verificar Índices
```bash
docker compose exec db psql -U postgres -d reportes -c "\di"
```

### Verificar Usuario
```bash
docker compose exec db psql -U postgres -d reportes -c "\du app_reports_reader"
docker compose exec db psql -U postgres -d reportes -c "\dp view_*"
```

---

## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Base de Datos | PostgreSQL | 16-alpine |
| Backend/Frontend | Next.js | 14.2.18 |
| Runtime | Node.js | 20-alpine |
| ORM | postgres.js | 3.4.5 |
| Validación | Zod | 3.23.8 |
| Contenedores | Docker Compose | - |




