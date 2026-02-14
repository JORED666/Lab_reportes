# Tarea 6: Lab Reportes SQL con Next.js

Sistema de reportes con PostgreSQL Views, Next.js 14 y Docker Compose.

Matrícula: 243842  
Materia: Bases de Datos Avanzadas  
Grupo: 5-C
Fecha: 31 Enero 2026
---

## Inicio Rápido

**Requisito:** Crear archivo `.env` antes de levantar:
```bash
cp .env.example .env
# Editar .env y cambiar las contraseñas
```

Después:
```bash

# Instalar dependencias
cd app
npm install
cd ..

# Comando para levantar contenedor
docker compose up --build

---

## 📊 Estructura del Proyecto
```
Lab_reportes/
├── db/
│   ├── schema.sql              # Tablas base (5 tablas)
│   ├── seed.sql                # Datos de prueba
│   ├── reports_vw.sql          # 5 VIEWS con comentarios
│   ├── indexes.sql             # 3 índices optimizados
│   ├── roles.sql               # Usuario con permisos mínimos
│   └── set_app_password.sh     # Script para password segura
├── app/
│   ├── app/
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── layout.tsx          # Layout global
│   │   └── reports/
│   │       ├── 1/page.tsx      # Ventas por Categoría
│   │       ├── 2/page.tsx      # Análisis de Clientes (FILTROS + PAGINACIÓN)
│   │       ├── 3/page.tsx      # Productos Top (PAGINACIÓN)
│   │       ├── 4/page.tsx      # Estado de Órdenes
│   │       └── 5/page.tsx      # Reporte Ejecutivo
│   ├── lib/
│   │   ├── db.ts               # Conexión PostgreSQL
│   │   ├── types.ts            # Interfaces TypeScript
│   │   └── validations.ts      # Validación Zod
│   └── package.json
├── scripts/
│   └── verify.sh               # Script de verificación
├── docker-compose.yml       
├── .env.example                # Template de variables
├── .gitignore
└── README.md
```

---
## Checklist de Requisitos

### A) Base de Datos SQL
- 5 VIEWS con comentarios (grain, métricas, VERIFY)
- Todas con funciones agregadas (SUM/COUNT/AVG/MIN/MAX)
- Todas con GROUP BY
- 4/5 con HAVING
- 5/5 con CASE/COALESCE
- 2 views con CTE (view_analisis_clientes: 1, view_reporte_ejecutivo: 4)
- 3 views con Window Function (RANK, ROW_NUMBER)
- Sin SELECT * (todas listan columnas específicas)
- 3 índices justificados
- Usuario con permisos mínimos

### B) Next.js App
- App Router (/app)
- Dashboard + 5 reportes
- Server Components (async/await)
- NO expone credenciales (DATABASE_URL en .env)
- Queries parametrizadas (postgres.js template literals)
- 2 reportes con filtros validados (Zod)
- 2 reportes con paginación server-side

### C) Docker Compose
- docker compose up --build
- Inicialización automática de DB (6 scripts SQL)
- Health checks implementados

---
## Evidencia de Base de Datos

### Lista de Views Creadas
```bash
docker compose exec db psql -U postgres -d reportes -c "\dv"
```
```
                  List of relations
 Schema |           Name            | Type |  Owner   
--------+---------------------------+------+----------
 public | view_analisis_clientes    | view | postgres
 public | view_estado_ordenes       | view | postgres
 public | view_productos_top        | view | postgres
 public | view_reporte_ejecutivo    | view | postgres
 public | view_ventas_por_categoria | view | postgres
(5 rows)
```

**Todas las 5 views creadas correctamente**

---

## Verificación del Sistema

### Verificar VIEWS
```bash
docker compose exec db psql -U postgres -d reportes
```
```sql
\dv                                          
SELECT * FROM view_ventas_por_categoria;     
SELECT * FROM view_analisis_clientes LIMIT 5;
SELECT * FROM view_reporte_ejecutivo;
```

### Verificar Índices
```bash
docker compose exec db psql -U postgres -d reportes -c "\di"
```

### Verificar Usuario y Permisos
```bash
# Ver role creado
docker compose exec db psql -U postgres -d reportes -c "\du app_reports_reader"

# Ver permisos en views
docker compose exec db psql -U postgres -d reportes -c "\dp view_*"

# Probar conexión con role de app
docker compose exec db psql -U app_reports_reader -d reportes -c "SELECT * FROM view_reporte_ejecutivo;"
```

---

## 📝 Bitácora de IA (Uso y Validación)

### Herramientas de IA Utilizadas
- Claude - Para revisión de código, correcciones de seguridad y optimización

### Prompts Clave Usados

1. Diseño Inicial de Views SQL
   - Prompt: "Diseña 5 views SQL con CTE, Window Functions, HAVING, CASE - cada una con grain, métricas y queries de verificación"
   - Resultado: Estructura base de las 5 views con features SQL avanzadas

2. Configuración de Next.js con TypeScript
   - Prompt: "Crea Next.js app con Server Components, TypeScript, Zod validation, paginación parametrizada"
   - Resultado: Estructura de carpetas /app con tipos y validaciones

3. Docker Compose con Seguridad
   - Prompt: "Docker Compose con PostgreSQL healthcheck, init automático y manejo seguro de passwords"
   - Resultado: Configuración de contenedores con variables de entorno

4. Revisión de Seguridad
   - Prompt: "Revisa mi proyecto contra errores comunes: passwords hardcodeadas, .env en Git, separación Front/Back"
   - Resultado: Identificación de 3 problemas críticos de seguridad


