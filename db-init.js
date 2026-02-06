// Automatinis magic_codes lentelės sukūrimas
// Naudojamas server.js pradžioje
const { Pool } = require('pg');

async function createMagicCodesTableIfNeeded(supabaseClient) {
  console.log('🔄 Patikrinimas magic_codes lentelės...');
  
  try {
    // Bandyti skaityti lentelę
    const { data, error } = await supabaseClient
      .from('magic_codes')
      .select('id')
      .limit(1);
    
    if (!error) {
      console.log('✅ magic_codes lentelė egzistuoja!');
      return true;
    }
    
    console.log('⚠️  magic_codes lentelė neegzistuoja.');
    console.log('📝 Reikalinga ją sukurti rankiniu būdu.');
    console.log('');
    console.log('Nuoroda: https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new');
    console.log('');
    console.log('SQL komanda:');
    console.log(`
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
CREATE POLICY "Allow public access" ON public.magic_codes FOR ALL USING (true) WITH CHECK (true);
    `);
    
    return false;
  } catch (err) {
    console.error('❌ Klaida patikrinant lentelę:', err.message);
    return false;
  }
}

module.exports = { createMagicCodesTableIfNeeded };
