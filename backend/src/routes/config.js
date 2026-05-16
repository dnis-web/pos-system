const express  = require('express');
const supabase = require('../db/supabase');
const auth     = require('../middleware/auth');
const router   = express.Router();

// GET /api/config
router.get('/', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json(data || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/config
// Body: { nombre_comercial, nit, direccion, telefono, correo }
router.put('/', auth, async (req, res) => {
  const { nombre_comercial, nit, direccion, telefono, correo } = req.body;

  if (!nombre_comercial || !nit) {
    return res.status(400).json({ error: 'nombre_comercial y nit son requeridos' });
  }

  try {
    const { data: existente } = await supabase
      .from('configuracion')
      .select('id')
      .single();

    let resultado;

    if (existente) {
      const { data, error } = await supabase
        .from('configuracion')
        .update({ nombre_comercial, nit, direccion, telefono, correo, actualizado_en: new Date().toISOString() })
        .eq('id', existente.id)
        .select()
        .single();
      if (error) throw error;
      resultado = data;
    } else {
      const { data, error } = await supabase
        .from('configuracion')
        .insert({ nombre_comercial, nit, direccion, telefono, correo })
        .select()
        .single();
      if (error) throw error;
      resultado = data;
    }

    res.json({ mensaje: 'Configuracion guardada', config: resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
