# Magic Code Autentifikacijos Nustatymas

## 📋 Problema ir Sprendimas

Dėl Vercel serverless architektūros, kodai negali būti saugomi atmintyje (Map). **Reikalinga Supabase duomenų bazė** dėl kodų saugojimo.

## ✅ Tai jau padaryta:

- ✅ Supabase integracija į `server.js` 
- ✅ Magic code funkcijos atnaujintos naudoti Supabase
- ✅ `@supabase/supabase-js` biblioteka pridėta
- ✅ Diegimas į Vercel atliktas

## ⚠️ Kas dar reikalinga:

**Sukurti `magic_codes` lentelę Supabase duomenų bazėje**

### 1️⃣ Eikite į Supabase

https://app.supabase.com

### 2️⃣ Pasirinkite savo projektą

Projekto pavadinimas: **subscription-tracker**

### 3️⃣ Eikite į SQL Editor

Dešiniame šoniniame meniu: SQL Editor → New Query

### 4️⃣ Kopijuokite ir vykdykite šią komandą:

```sql
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
```

### 5️⃣ Paspaudykite "RUN"

### ✅ Gata!

Kai lentelė sukurta, magic code autentifikacija turėtų veikti!

## 🧪 Testavimas

1. Eikite į https://subscription-tracker-sigma-ten.vercel.app
2. Paspaudykite "Prisijungti su magic code"
3. Įveskite savo el. paštą
4. Turėtumėte gauti kodą el. paštą (ir konsolėje rodomas test kodas)
5. Įveskite kodą
6. El. paštas turėtų būti patvirtintas ✅

## 🐛 Jei vis tiek neworkuoja

1. Grįžkite į Supabase
2. Eikite į Table Editor
3. Patikrinkite ar `magic_codes` lentelė egzistuoja
4. Patikrinkite lentelės stulpeliai (email, code, expires_at)

## 📊 Lentelės nustatymas

| Stulpelis | Tipas | Pastabos |
|-----------|-------|---------|
| id | bigint | PRIMARY KEY, auto increment |
| email | text | NOT NULL, UNIQUE |
| code | text | NOT NULL |
| expires_at | timestamp | NOT NULL |
| created_at | timestamp | DEFAULT CURRENT_TIMESTAMP |

