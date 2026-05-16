# POS Backend — API REST

## Stack
Node.js 20 + Express · Supabase (PostgreSQL + Auth) · Mock FEL

---

## Setup

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con las credenciales de Supabase
```

### 3. Crear tablas en Supabase
1. Ir a supabase.com → tu proyecto → SQL Editor
2. Pegar el contenido de `schema.sql`
3. Ejecutar (Run)

### 4. Correr en desarrollo
```bash
npm run dev
# Servidor en http://localhost:4000
```

### 5. Verificar
```
GET http://localhost:4000/api/health
→ { "estado": "ok", "supabase": "conectado" }
```

---

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/productos | Listar productos activos |
| GET | /api/productos/alertas | Productos con stock bajo |
| GET | /api/productos/:id | Detalle de un producto |
| POST | /api/productos | Crear producto |
| PUT | /api/productos/:id | Editar producto |
| DELETE | /api/productos/:id | Desactivar producto |
| POST | /api/ventas | Registrar venta + DTE |
| GET | /api/ventas | Listar ventas |
| GET | /api/ventas/resumen-hoy | Totales del dia |
| POST | /api/mock-fel | Simula certificador FEL |
| GET | /api/config | Configuracion del negocio |
| PUT | /api/config | Guardar configuracion |

## Autenticacion
Todos los endpoints excepto `/api/health` y `/api/mock-fel` requieren:
```
Authorization: Bearer <token_supabase>
```

## Tests
```bash
npm test
```
