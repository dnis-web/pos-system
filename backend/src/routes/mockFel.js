const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router  = express.Router();

// POST /api/mock-fel
// Simula el Certificador FEL

router.post('/', async (req, res) => {
  const { venta_id, total, secret } = req.body;

  if (secret !== process.env.MOCK_FEL_SECRET) {
    return res.status(403).json({ error: 'Token mock FEL invalido' });
  }

  if (!venta_id || !total) {
    return res.status(400).json({ error: 'venta_id y total son requeridos' });
  }

  // Simular latencia del certificador real (~300ms)
  await new Promise(r => setTimeout(r, 300));

  // Simular rechazo ocasional 5% de probabilidad
  if (Math.random() < 0.05) {
    return res.status(422).json({
      estado: 'RECHAZADO',
      codigo_error: 'FEL-001',
      mensaje: 'Datos incompletos para certificacion (simulado)'
    });
  }

  const uuid   = uuidv4();
  const numero = `FAC-${Date.now().toString().slice(-5)}`;

  res.json({
    estado:               'AUTORIZADO',
    uuid,
    numero,
    venta_id,
    total,
    fecha_certificacion:  new Date().toISOString(),
    certificador:         'MockFEL v1.0 (simulado)',
    mensaje:              'Documento tributario electronico autorizado'
  });
});

module.exports = router;
