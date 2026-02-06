// Skriptas kuris sukuria magic_codes lentelę Supabase
const { Client } = require('pg');

// Supabase PostgreSQL nustatymai
const dbConfig = {
  host: 'db.dofurbjeqymjblimxrwj.supabase.co',
  database: 'postgres',
  user: 'postgres',
  // ⚠️ SVARBU: Reikia iš .env failo arba Supabase Settings
  // Šiam skriptui naudojame tik check, todėl nereikia password
};

async function initDatabase() {
  console.log('🔄 Patikrinimas magic_codes lentelės...');
  
  // Bandom su Supabase API
  const { createClient } = require('@supabase/supabase-js');
  const SUPABASE_URL = 'https://dofurbjeqymjblimxrwj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_aRvwaIckjHw8VZli1EaEXQ_4HzEauHP';
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    const { data, error } = await supabase
      .from('magic_codes')
      .select('id')
      .limit(1);
    
    if (!error) {
      console.log('✅ magic_codes lentelė jau egzistuoja!');
      return true;
    }
  } catch (err) {
    // Tabel doesn't exist
  }
  
  console.log('❌ magic_codes lentelė neegzistuoja!');
  console.log('');
  console.log('📝 Reikalinga sukurti lentelę Supabase:');
  console.log('');
  console.log('Eikite į https://app.supabase.com/');
  console.log('Projektą: subscription-tracker');
  console.log('SQL Editor → New query');
  console.log('');
  console.log('Vykdykite šią komandą:');
  console.log('');
  
  const sqlQuery = `
CREATE TABLE IF NOT EXISTS public.magic_codes (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_email_code UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_magic_codes_email ON public.magic_codes(email);

ALTER TABLE public.magic_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON public.magic_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);
  `;
  
  console.log(sqlQuery);
  
  return false;
}

initDatabase().then(success => {
  if (!success) {
    console.log('');
    console.log('⚠️  Lentelės kūrimas atliekamas rankiniu būdu.');
    console.log('Kai sukūrsite lentelę, serveris veiks normaliai.');
  }
});
