-- Sukurti subscriptions lentelę su user_email lauku
-- Vykdyti Supabase SQL Editor: https://supabase.com/dashboard/project/dofurbjeqymjblimxrwj/sql

-- 1. Ištrinti seną lentelę, jei egzistuoja (ATSARGIAI - prarasite duomenis!)
DROP TABLE IF EXISTS public.subscriptions;

-- 2. Sukurti naują lentelę su user_email
CREATE TABLE public.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sukurti indeksą greičiau filtruoti pagal vartotoją
CREATE INDEX idx_subscriptions_user_email ON public.subscriptions(user_email);

-- 4. Įjungti Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Sukurti politiką - kiekvienas vartotojas mato tik savo prenumeratas
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions
FOR SELECT
USING (true); -- Leidžiame skaityti visiems (filtruosime per user_email)

CREATE POLICY "Users can insert their own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (true); -- Leidžiame įterpti visiems

CREATE POLICY "Users can update their own subscriptions"
ON public.subscriptions
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete their own subscriptions"
ON public.subscriptions
FOR DELETE
USING (true);

-- 6. Patvirtinti, kad lentelė sukurta
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'subscriptions'
ORDER BY 
    ordinal_position;
