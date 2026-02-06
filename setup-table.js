#!/usr/bin/env node

/**
 * Šis skriptas sukuria magic_codes lentelę Supabase
 * 
 * Naudojimas:
 *   SUPABASE_SERVICE_KEY=your_key node setup-table.js
 * 
 * Jei neturite SERVICE KEY, kurkite per Supabase console
 * Settings → API → Service role key
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dofurbjeqymjblimxrwj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_aRvwaIckjHw8VZli1EaEXQ_4HzEauHP';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

CREATE POLICY IF NOT EXISTS "Allow public access" ON public.magic_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);
`;

async function setupTable() {
  console.log('🔄 Patikrinimas magic_codes lentelės...\n');
  
  try {
    // Patikrinti ar lentelė egzistuoja
    const { data, error } = await supabase
      .from('magic_codes')
      .select('id')
      .limit(1);
    
    if (!error) {
      console.log('✅ magic_codes lentelė JI Jexits!');
      return true;
    }
    
    console.log('❌ magic_codes lentelė neegzistuoja');
    console.log('\n📝 Lentelę reikalinga sukurti per Supabase SQL Editor:');
    console.log('\n1. Eikite į: https://app.supabase.com/');
    console.log('2. Projektą: subscription-tracker');
    console.log('3. Meniu: SQL Editor → New Query');
    console.log('4. Kopijuokite ir vykdykite:\n');
    console.log('─'.repeat(60));
    console.log(sqlQuery);
    console.log('─'.repeat(60));
    console.log('\n5. Paspaudykite "RUN"');
    console.log('\n✅ Kai lentelė sukurta, magic code autentifikacija veiks!\n');
    
    return false;
  } catch (err) {
    console.error('❌ Klaida:', err.message);
    return false;
  }
}

// Paleisti
setupTable().then(success => {
  process.exit(success ? 0 : 1);
});
