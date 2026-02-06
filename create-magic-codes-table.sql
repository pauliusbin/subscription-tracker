-- SQL skriptas kuris sukuria magic_codes lentelę Supabase
-- Vykdykite šią komandą Supabase SQL Editor'iuje: https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new

CREATE TABLE IF NOT EXISTS public.magic_codes (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_email_code UNIQUE(email)
);

-- Sukurti indeksą dėl greičio
CREATE INDEX IF NOT EXISTS idx_magic_codes_email ON public.magic_codes(email);

-- Nustatyti RLS (Row Level Security) jei reikalinga
ALTER TABLE public.magic_codes ENABLE ROW LEVEL SECURITY;

-- Leidžiama be autentifikacijos skaityti ir keisti (testavimui)
CREATE POLICY "Allow public access" ON public.magic_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);
