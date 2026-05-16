const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en el archivo .env');
}

const supabase = createClient(url, key);

module.exports = supabase;
