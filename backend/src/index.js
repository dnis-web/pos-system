require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const rutaHealth    = require('./routes/health');
const rutaProductos = require('./routes/productos');
const rutaVentas    = require('./routes/ventas');
const rutaMockFel   = require('./routes/mockFel');
const rutaConfig    = require('./routes/config');

const app    = express();
const PUERTO = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

app.use('/api/health',    rutaHealth);
app.use('/api/productos', rutaProductos);
app.use('/api/ventas',    rutaVentas);
app.use('/api/mock-fel',  rutaMockFel);
app.use('/api/config',    rutaConfig);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PUERTO, () => {
  console.log(`Servidor POS corriendo en http://localhost:${PUERTO}`);
});

module.exports = app;
