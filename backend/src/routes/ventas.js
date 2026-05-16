const express  = require('express');
const supabase = require('../db/supabase');
const auth     = require('../middleware/auth');
const router   = express.Router();

// ── Calcula los totales de una venta ──────────────────────────────────────────
function calcularTotales(items, descuento_pct = 0) {
  const subtotal = items.reduce((suma, item) => {
    return suma + item.precio_unitario * item.cantidad;
  }, 0);

  const descuento = parseFloat(((subtotal * descuento_pct) / 100).toFixed(2));
  const base      = subtotal - descuento;
  const iva       = parseFloat((base * 0.12).toFixed(2));
  const total     = parseFloat((base + iva).toFixed(2));

  return { subtotal, descuento, iva, total };
}

module.exports._calcularTotales = calcularTotales;

// POST /api/ventas
// Body: { items: [{producto_id, cantidad, precio_unitario}], metodo_pago, descuento_pct, cliente_id }
router.post('/', auth, async (req, res) => {
  const { items, metodo_pago, descuento_pct = 0, cliente_id = null } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La venta debe tener al menos un item' });
  }
  if (!['EFECTIVO', 'TARJETA'].includes(metodo_pago)) {
    return res.status(400).json({ error: 'metodo_pago debe ser EFECTIVO o TARJETA' });
  }

  const { subtotal, descuento, iva, total } = calcularTotales(items, descuento_pct);

  try {
    // 1. Generar numero correlativo
    const { count } = await supabase
      .from('ventas')
      .select('*', { count: 'exact', head: true });

    const numero_venta = `VTA-${String((count || 0) + 1).padStart(5, '0')}`;

    // 2. Insertar la venta
    const { data: venta, error: errorVenta } = await supabase
      .from('ventas')
      .insert({
        numero_venta,
        cajero_id: req.usuario.id,
        cliente_id,
        subtotal,
        descuento,
        iva,
        total,
        metodo_pago,
        estado: 'COMPLETADA'
      })
      .select()
      .single();

    if (errorVenta) throw errorVenta;

    // 3. Insertar los items
    const registrosItems = items.map(item => ({
      venta_id:        venta.id,
      producto_id:     item.producto_id,
      cantidad:        item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal:        parseFloat((item.precio_unitario * item.cantidad).toFixed(2))
    }));

    const { error: errorItems } = await supabase
      .from('items_venta')
      .insert(registrosItems);

    if (errorItems) throw errorItems;

    // 4. Descontar stock de cada producto
    for (const item of items) {
      const { data: producto } = await supabase
        .from('productos')
        .select('stock')
        .eq('id', item.producto_id)
        .single();

      await supabase
        .from('productos')
        .update({ stock: producto.stock - item.cantidad })
        .eq('id', item.producto_id);
    }

    // 5. Generar DTE 
    const dte = await generarDTE(venta, total);

    res.status(201).json({
      venta,
      dte,
      mensaje: 'Venta registrada y DTE generado correctamente'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Llama al FEL y guarda el DTE en documentos_dte
async function generarDTE(venta, total) {
  try {
    const respuesta = await fetch(
      `http://localhost:${process.env.PORT || 4000}/api/mock-fel`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venta_id: venta.id,
          total,
          secret: process.env.MOCK_FEL_SECRET
        })
      }
    );

    const dte = await respuesta.json();

    const { data } = await supabase
      .from('documentos_dte')
      .insert({
        venta_id:       venta.id,
        tipo_dte:       'FACT',
        numero:         dte.numero,
        uuid_dte:       dte.uuid,
        estado:         'AUTORIZADO',
        respuesta_mock: dte
      })
      .select()
      .single();

    return data;
  } catch (err) {
    console.error('Error generando DTE:', err.message);
    return { error: 'DTE no generado, venta guardada correctamente' };
  }
}

// GET /api/ventas
// Query params: ?fecha_inicio=2026-04-01&fecha_fin=2026-04-30
router.get('/', auth, async (req, res) => {
  try {
    let consulta = supabase
      .from('ventas')
      .select('*, documentos_dte(numero, uuid_dte, estado)')
      .order('creado_en', { ascending: false })
      .limit(50);

    if (req.query.fecha_inicio) {
      consulta = consulta.gte('creado_en', req.query.fecha_inicio);
    }
    if (req.query.fecha_fin) {
      consulta = consulta.lte('creado_en', req.query.fecha_fin + 'T23:59:59');
    }

    const { data, error } = await consulta;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ventas/resumen-hoy
// Totales del dia para el dashboard
router.get('/resumen-hoy', auth, async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('ventas')
      .select('total, metodo_pago')
      .eq('estado', 'COMPLETADA')
      .gte('creado_en', `${hoy}T00:00:00`)
      .lte('creado_en', `${hoy}T23:59:59`);

    if (error) throw error;

    const total_ventas   = data.reduce((s, v) => s + v.total, 0);
    const transacciones  = data.length;
    const total_efectivo = data.filter(v => v.metodo_pago === 'EFECTIVO').reduce((s, v) => s + v.total, 0);
    const total_tarjeta  = data.filter(v => v.metodo_pago === 'TARJETA').reduce((s, v) => s + v.total, 0);

    res.json({
      total:        parseFloat(total_ventas.toFixed(2)),
      transacciones,
      efectivo:     parseFloat(total_efectivo.toFixed(2)),
      tarjeta:      parseFloat(total_tarjeta.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports._calcularTotales = calcularTotales;
