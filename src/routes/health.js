const express  = require('express');
const supabase = require('../db/supabase');
const router   = express.Router();

// GET /api/health
router.get('/', async (req, res) => {
  try {
    const { error } = await supabase.from('productos').select('id').limit(1);
    if (error) throw error;

    res.json({
      estado: 'ok',
      fecha: new Date().toISOString(),
      supabase: 'conectado'
    });
  } catch (err) {
    res.status(503).json({
      estado: 'error',
      mensaje: 'No se pudo conectar con Supabase',
      detalle: err.message
    });
  }
});

module.exports = router;
