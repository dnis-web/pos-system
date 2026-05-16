-- ============================================================
-- Schema SQL para Supabase - Sistema POS
-- Ejecutar en: Supabase 
-- ============================================================

-- Roles del sistema
CREATE TABLE IF NOT EXISTS roles (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nombre)
VALUES ('Admin'), ('Cajero'), ('Bodeguero'), ('Gerente'), ('Contador')
ON CONFLICT DO NOTHING;

-- Configuracion del negocio (una sola fila)
CREATE TABLE IF NOT EXISTS configuracion (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_comercial VARCHAR(200) NOT NULL,
  nit              VARCHAR(20)  NOT NULL,
  direccion        TEXT,
  telefono         VARCHAR(20),
  correo           VARCHAR(100),
  actualizado_en   TIMESTAMPTZ  DEFAULT NOW()
);

-- Categorias de productos
CREATE TABLE IF NOT EXISTS categorias (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Clientes (cliente_id NULL en ventas = consumidor final)
CREATE TABLE IF NOT EXISTS clientes (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  nit    VARCHAR(20)  UNIQUE,
  correo VARCHAR(100)
);

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre   VARCHAR(150) NOT NULL,
  contacto VARCHAR(100)
);

-- Productos
CREATE TABLE IF NOT EXISTS productos (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  sku           VARCHAR(50)   NOT NULL UNIQUE,
  nombre        VARCHAR(200)  NOT NULL,
  categoria_id  UUID          REFERENCES categorias(id),
  precio_venta  NUMERIC(10,2) NOT NULL CHECK (precio_venta > 0),
  precio_compra NUMERIC(10,2),
  tasa_iva      NUMERIC(5,2)  DEFAULT 12.00,
  stock         INTEGER       DEFAULT 0 CHECK (stock >= 0),
  stock_minimo  INTEGER       DEFAULT 5,
  activo        BOOLEAN       DEFAULT TRUE,
  imagen_url    TEXT,
  creado_en     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_sku    ON productos(sku);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre);

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_venta  VARCHAR(20)   NOT NULL UNIQUE,
  cajero_id     UUID          NOT NULL,
  cliente_id    UUID          REFERENCES clientes(id),
  subtotal      NUMERIC(10,2) NOT NULL,
  descuento     NUMERIC(10,2) DEFAULT 0,
  iva           NUMERIC(10,2) NOT NULL,
  total         NUMERIC(10,2) NOT NULL,
  metodo_pago   VARCHAR(10)   NOT NULL CHECK (metodo_pago IN ('EFECTIVO','TARJETA')),
  estado        VARCHAR(20)   DEFAULT 'COMPLETADA',
  creado_en     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_cajero    ON ventas(cajero_id);
CREATE INDEX IF NOT EXISTS idx_ventas_creado_en ON ventas(creado_en);

-- Items de venta
CREATE TABLE IF NOT EXISTS items_venta (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id         UUID          NOT NULL REFERENCES ventas(id),
  producto_id      UUID          NOT NULL REFERENCES productos(id),
  cantidad         INTEGER       NOT NULL CHECK (cantidad > 0),
  precio_unitario  NUMERIC(10,2) NOT NULL,
  subtotal         NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_items_venta_id    ON items_venta(venta_id);
CREATE INDEX IF NOT EXISTS idx_items_producto_id ON items_venta(producto_id);

-- Documentos DTE (facturas electronicas simuladas)
CREATE TABLE IF NOT EXISTS documentos_dte (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id       UUID        NOT NULL UNIQUE REFERENCES ventas(id),
  tipo_dte       VARCHAR(10) DEFAULT 'FACT',
  numero         VARCHAR(20) NOT NULL,
  uuid_dte       UUID        NOT NULL UNIQUE,
  estado         VARCHAR(20) DEFAULT 'AUTORIZADO',
  respuesta_mock JSONB,
  emitido_en     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dte_uuid_dte ON documentos_dte(uuid_dte);
CREATE INDEX IF NOT EXISTS idx_dte_venta_id ON documentos_dte(venta_id);

-- Movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id     UUID        NOT NULL REFERENCES productos(id),
  proveedor_id    UUID        REFERENCES proveedores(id),
  usuario_id      UUID        NOT NULL,
  cantidad        INTEGER     NOT NULL CHECK (cantidad > 0),
  tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA','SALIDA','AJUSTE')),
  creado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Datos de prueba para desarrollo
-- ============================================================
INSERT INTO categorias (nombre)
VALUES ('Granos'), ('Aceites'), ('Abarrotes'), ('Lacteos')
ON CONFLICT DO NOTHING;

INSERT INTO productos (sku, nombre, precio_venta, precio_compra, stock, stock_minimo, categoria_id)
VALUES
  ('PROD-001', 'Arroz Diana 1lb',      12.50,  8.00, 48,  10, (SELECT id FROM categorias WHERE nombre = 'Granos')),
  ('PROD-002', 'Aceite Capullo 1L',    32.00, 22.00, 22,   8, (SELECT id FROM categorias WHERE nombre = 'Aceites')),
  ('PROD-003', 'Frijol Bonarco 1lb',    8.50,  5.50, 65,  12, (SELECT id FROM categorias WHERE nombre = 'Granos')),
  ('PROD-004', 'Azucar Pantaleón 2lb', 14.00,  9.00,  3,  15, (SELECT id FROM categorias WHERE nombre = 'Abarrotes')),
  ('PROD-005', 'Aceite Cocinero 1L',   28.50, 19.00,  2,  10, (SELECT id FROM categorias WHERE nombre = 'Aceites'))
ON CONFLICT DO NOTHING;
