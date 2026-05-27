# Sistema POS con Inventario y Facturación Electrónica

Proyecto de Ingeniería de Software — Universidad Mariano Gálvez de Guatemala  
Denis Rogelio Gómez 
Diego Arriola 

## Descripción

Sistema de Punto de Venta web para PYMEs guatemaltecas que centraliza ventas, inventario y facturación electrónica FEL.

## URLs de Producción

- **Frontend:** https://pos-system-six-khaki.vercel.app
- **Backend:** https://pos-system-production-ac75.up.railway.app
- **API Health:** https://pos-system-production-ac75.up.railway.app/api/health

## Stack Tecnológico

- **Frontend:** React 19 + Vite 8 + Supabase Auth
- **Backend:** Node.js 20 + Express
- **Base de datos:** Supabase (PostgreSQL)
- **Deploy frontend:** Vercel
- **Deploy backend:** Railway
- **CI/CD:** GitHub Actions

## Módulos del Sistema

- **Login** — Autenticación real con Supabase Auth 
- **Productos** — Listado de productos con SKU, stock y precios
- **Inventario** — Control de stock con alertas de productos bajo mínimo
- **Ventas** — Registro de ventas con búsqueda de productos y cálculo de IVA
- **Facturación** — Emisión de DTE simulando

## Roles


Admin: Todo el sistema 
Cajero: Ventas y Facturación 
Bodeguero: Productos e Inventario 

## Correr localmente

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Variables de entorno

**Backend (.env):**

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
MOCK_FEL_SECRET=
FRONTEND_URL=
PORT=4000

**Frontend (.env):**
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=