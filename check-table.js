#!/usr/bin/env node

/**
 * Šis skriptas naudoja Supabase SQL funkcijų
 * norėdamas sukurti magic_codes lentelę
 */

const https = require('https');

const SUPABASE_URL = 'dofurbjeqymjblimxrwj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aRvwaIckjHw8VZli1EaEXQ_4HzEauHP';

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Apikey': SUPABASE_KEY,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function createTable() {
  console.log('🔄 Bandoma sukurti magic_codes lentelę...\n');

  try {
    // Pirma - patikrinti ar lentelė egzistuoja
    const checkRes = await makeRequest('GET', '/rest/v1/magic_codes?select=id&limit=1');
    
    if (checkRes.statusCode === 200) {
      console.log('✅ magic_codes lentelė jau egzistuoja!');
      return true;
    }

    // Jei lentelė neegzistuoja, ji grąžins 404
    if (checkRes.statusCode !== 404) {
      console.log('⚠️  Nežinoma būsena:', checkRes.statusCode);
    }

    console.log('❌ magic_codes lentelė neegzistuoja');
    console.log('\n📝 Lentelę reikalinga sukurti per Supabase UI');
    
    const sqlQuery = `CREATE TABLE IF NOT EXISTS public.magic_codes (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_email_code UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_magic_codes_email ON public.magic_codes(email);
ALTER TABLE public.magic_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public access" ON public.magic_codes FOR ALL USING (true) WITH CHECK (true);`;

    console.log('\n📋 Instrukcijos:');
    console.log('1. Eikite į https://app.supabase.com/');
    console.log('2. Projektą: subscription-tracker');
    console.log('3. SQL Editor → New Query');
    console.log('4. Kopijuokite ir paleidžias:');
    console.log('\n' + sqlQuery + '\n');
    console.log('5. Paspaudykite "RUN"');
    console.log('\n✅ Kai lentelė bus sukurta, magic code autentifikacija veiks!\n');
    
    return false;
  } catch (err) {
    console.error('❌ Klaida:', err.message);
    return false;
  }
}

createTable().then(success => {
  process.exit(success ? 0 : 1);
});
