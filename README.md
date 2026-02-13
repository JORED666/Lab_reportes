# Tarea 6: Lab Reportes SQL con Next.js

Sistema de reportes con PostgreSQL Views, Next.js 14 y Docker Compose.

  
Matrícula: 243842  
Materia: Bases de Datos Avanzadas  
Fecha:31 Enero 2026

---

## Inicio Rápido

**Requisito:** Crear archivo `.env` antes de levantar:
```bash
cp .env.example .env
# Editar .env y cambiar las contraseñas
```

Después:
```bash
# UN SOLO COMANDO levanta todo:
docker compose up --build

# Esperar ~2 minutos
# Abrir: http://localhost:3000
```

Para desarrollo local:
```bash
# 1. Copiar .env.example a .env Y CAMBIAR LAS CONTRASEÑAS
cp .env.example .env
# 2. Editar .env con credenciales seguras (generadas por ti)

# 3. Levantar solo la DB
docker compose up -d db

# 4. Instalar dependencias y ejecutar app
cd app
npm install
cd ..

# 5. Para desarrollo Next.js
cd app && npm run dev
```

⚠️ **IMPORTANTE:** 
- NUNCA subas `.env` al repositorio
- Las credenciales en `.env.example` son placeholders
- Cada usuario debe generar sus propias contraseñas

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

---

## 📊 Trade-offs (SQL vs Next.js)

Decisiones de dónde calcular cada métrica:

1. **Aggregaciones en SQL ✅**
   - `SUM`, `COUNT`, `AVG`, `MIN`, `MAX` → calculadas en PostgreSQL
   - Razón: Mejor performance (datos pre-agregados), usa índices, consume menos memoria
   - Ejemplo: `view_ventas_por_categoria` suma ventas en DB, no en Next.js

2. **Window Functions en SQL ✅**
   - `RANK()`, `ROW_NUMBER()` → calculadas en PostgreSQL
   - Razón: Lógica compleja, requiere orden global, más eficiente en DB
   - Ejemplo: `ranking_ventas` en view_ventas_por_categoria

3. **Lógica de Segmentación en SQL ✅**
   - `CASE` para clasificar clientes (VIP/Regular/Activo/Nuevo) → en PostgreSQL
   - Razón: Consistencia, reutilizable, filtrable en queries posteriores
   - Ejemplo: `CASE WHEN total >= 1000 THEN 'VIP'` en view_analisis_clientes

4. **Paginación en App (parametrizada) ✅**
   - `LIMIT/OFFSET` controlado por Next.js
   - Razón: UI maneja página actual, DB ejecuta query parametrizada
   - Ejemplo: `/reports/2?page=2` → `LIMIT 20 OFFSET 20`

5. **Formatos de Display en Next.js ✅**
   - Moneda (`$1,234.56`), porcentajes → formateados en React
   - Razón: SQL devuelve números, React los formatea para UI
   - Ejemplo: `Number(row.total).toLocaleString()`

---

## ⚡ Performance Evidence

### 1. EXPLAIN ANALYZE - View Ventas por Categoría

**Query:**
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM view_ventas_por_categoria;
```

**Resultado esperado:**
- Tipo: Plan incluye `Nested Loop` + `Hash Aggregate` + `Index Scan`
- Rows: ~5-10 categorías
- Buffers: ~10-20 buffers hit (muy eficiente)
- Planning Time: <1ms
- Execution Time: 5-15ms

**Análisis:**
- El índice `idx_productos_categoria` acelera los JOINs
- `Hash Aggregate` es óptimo para GROUP BY con pocas filas
- No hay `Seq Scan` completo (eficiente)

### 2. EXPLAIN ANALYZE - View Análisis de Clientes con Filtro

**Query:**
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM view_analisis_clientes 
WHERE segmento_cliente = 'VIP'
LIMIT 20;
```

**Resultado esperado:**
- Rows: ~10-20 clientes VIP
- Planning Time: <1ms
- Execution Time: 3-8ms
- Buffers: Hit ratio > 90%

**Análisis:**
- CTE `ordenes_completadas` filtra órdenes relevantes
- `ROW_NUMBER()` rankea eficientemente
- `COALESCE` previene comparaciones con NULL
- Índice `idx_usuarios_activos` acelera WHERE u.activo = TRUE

**Justificación de Índices Usados:**
- `idx_productos_categoria`: Acelera JOINs en 3 views (1,3,5)
- `idx_orden_detalles_producto`: Acelera agregaciones en SUM/COUNT
- `idx_usuarios_activos`: Filtra usuarios activos sin Seq Scan

---

## 🔒 Threat Model - Medidas de Seguridad

### 1. ✅ SQL Injection Prevention
- **Implementación:** PostgreSQL driver `postgres.js` usa template literals parametrizados
- **Ejemplo:** `sql`SELECT * FROM view WHERE segmento = ${segmento}`
- **Por qué funciona:** Driver convierte ${} a prepared statements, NO concatena strings
- **Proof:** En `lib/db.js` ALL queries usan template literals (NO string concat)

### 2. ✅ Credenciales NO en Cliente
- **Implementación:** DATABASE_URL en `.env` (servidor), NO en cliente
- **Validación:** `lib/db.js` usa `process.env.DATABASE_URL` (solo en servidor)
- **No expuesto:** Ningún `.env` subido, `.env` en `.gitignore`
- **Cliente solo recibe:** JSON data (sin credenciales)

### 3. ✅ Permisos Mínimos (Role-Based Access)
- **Usuario de app:** `app_reports_reader` 
- **Lo que PUEDE:** SELECT en 5 VIEWS solamente
- **Lo que NO PUEDE:** UPDATE/DELETE/INSERT, acceso a tablas base, crear objetos
- **Base de datos:** NO se conecta como `postgres`
- **Proof:** `roles.sql` crea role con `GRANT SELECT ON view_*`

### 4. ✅ Validación de Entrada (Zod)
- **Reportes 2 y 3:** Usan schemas Zod para validar parámetros
- **Segmento:** Whitelist enum (`['VIP', 'Regular', 'Activo', 'Nuevo']`)
- **Paginación:** Valida `page >= 1`, `limit <= 100`
- **Fallback:** Si validación falla, devuelve defaults seguros

### 5. ✅ Read-Only VIEWS
- **App solo ve:** SELECT * FROM view_* (no en tablas)
- **Imposible:** Modificar datos base desde app
- **Granularidad:** Cada view retorna datos específicos (no toda la DB)

### 6. ✅ No Hardcodeadas (Variables de Entorno)
- **Variables usadas:** `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`, `${DATABASE_URL}`
- **`.env.example`:** Placeholders ('CHANGE_THIS'), no secretos reales
- **Inicialización:** Docker Compose lee `.env` en runtime

---

## 📝 Bitácora de IA (Uso y Validación)

### Prompts Clave Usados
1. ✅ "Diseña 5 views SQL con CTE, Window Functions, HAVING, CASE - grain y métricas"
2. ✅ "Crea Next.js app con Server Components, Zod validation, paginación parametrizada"
3. ✅ "Docker Compose con PostgreSQL healthcheck y init automático"
4. ✅ "Índices SQL para optimizar views - EXPLAIN ANALYZE"

### Qué Validé Manualmente
- ✅ **Cada VIEW:** Corrí VERIFY queries, chequeé grain/métricas
- ✅ **Seguridad:** Confirmé `postgres.js` usa parametrizadas, no concatenación
- ✅ **Datos:** Ejecuté `docker compose up`, verificué /reports/1-5
- ✅ **Docker:** Probé `docker compose down` + `docker compose up --build`
- ✅ **Roles:** Conecté como `app_reports_reader`, validé SELECT works/UPDATE fails

### Qué Corregí
- ❌ → ✅ Removí contraseña de rolls.sql (hardcodeada)
- ❌ → ✅ Moví DATABASE_URL a `.env` (no en código)
- ❌ → ✅ Agregué validación Zod en reportes 2 y 3
- ❌ → ✅ Ahora `.env` en `.gitignore`, `.env.example` como template
- ❌ → ✅ Validé que views devuelven datos correctos con pagination




