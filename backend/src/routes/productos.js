const express  = require('express');
const supabase = require('../db/supabase');
const auth     = require('../middleware/auth');
const router   = express.Router();

// GET /api/productos
// Query params opcionales: ?buscar=arroz  ?bajo_stock=true
router.get('/', auth, async (req, res) => {
  try {
    let consulta = supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (req.query.buscar) {
      consulta = consulta.or(
        `nombre.ilike.%${req.query.buscar}%,sku.ilike.%${req.query.buscar}%`
      );
    }

    const { data, error } = await consulta;
    if (error) throw error;

    // Filtrar bajo stock en JS (Supabase no soporta comparar dos columnas directamente)
    const resultado = req.query.bajo_stock === 'true'
      ? data.filter(p => p.stock < p.stock_minimo)
      : data;

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos/alertas
// Devuelve productos con stock por debajo del minimo.
// Usado por el badge rojo del sidebar.
router.get('/alertas', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, sku, stock, stock_minimo')
      .eq('activo', true);

    if (error) throw error;

    const criticos = data.filter(p => p.stock < p.stock_minimo);

    res.json({ total: criticos.length, productos: criticos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/productos
router.post('/', auth, async (req, res) => {
  const { sku, nombre, precio_venta, precio_compra, tasa_iva, stock, stock_minimo, categoria_id } = req.body;

  if (!sku || !nombre || !precio_venta) {
    return res.status(400).json({ error: 'sku, nombre y precio_venta son requeridos' });
  }

  try {
    const { data, error } = await supabase
      .from('productos')
      .insert({
        sku,
        nombre,
        precio_venta,
        precio_compra,
        tasa_iva: tasa_iva || 12,
        stock: stock || 0,
        stock_minimo: stock_minimo || 5,
        categoria_id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/productos/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/productos/:id  (desactiva, no borra)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ mensaje: 'Producto desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
