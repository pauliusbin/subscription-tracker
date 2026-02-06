# Backend Serverio Nustatymas

Šis backend serveris naudoja Resend API el. laiškų siuntimui.

## Instaliacija

1. Įdiekite priklausomybes:
```bash
npm install
```

## Konfigūracija

1. **Gaukite Resend API raktą:**
   - Eikite į https://resend.com/api-keys
   - Sukurkite naują API raktą
   - Nukopijuokite jį

2. **Atidarykite `server.js` failą ir pakeiskite:**
   - `RESEND_API_KEY` - įrašykite savo Resend API raktą
   - `FROM_EMAIL` - įrašykite el. paštą, iš kurio siunčiate
     - Testavimui galite naudoti: `onboarding@resend.dev`
     - Produkcijai reikia patvirtinto domeno

3. **Atidarykite `index.html` failą ir pakeiskite:**
   - Eilutėje su `BACKEND_URL` įrašykite savo backend URL
   - Jei naudojate lokalų serverį: `http://localhost:3000/send-email`
   - Jei naudojate produkcinį serverį: `https://your-domain.com/send-email`

## Paleidimas

```bash
npm start
```

Arba su automatinio perkrovimo funkcija:
```bash
npm run dev
```

Serveris paleidžiamas: http://localhost:3000

## Testavimas

1. Atidarykite `index.html` naršyklėje
2. Įrašykite el. pašto adresą
3. Paspaudžiate "Siųsti priminimą"
4. Patikrinkite el. pašto dėžutę

## Pastabos

- Resend nemokamai leidžia siųsti iki 100 el. laiškų per dieną
- Testavimui naudokite `onboarding@resend.dev` kaip FROM_EMAIL
- Produkcijai reikia patvirtinto domeno
