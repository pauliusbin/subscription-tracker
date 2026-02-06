// Backend serveris el. laiškų siuntimui naudojant SendGrid API
// Paleisti: node server.js

const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

// ⚠️ SVARBU: Nustatykite Vercel Environment Variables
// SENDGRID_API_KEY - iš https://app.sendgrid.com/settings/api_keys
// FROM_EMAIL - patvirtintas el. paštas SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'pauliusbin@gmail.com';

// Supabase konfigūracija
const SUPABASE_URL = 'https://dofurbjeqymjblimxrwj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aRvwaIckjHw8VZli1EaEXQ_4HzEauHP'; // Naudosim anon key
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

if (!SENDGRID_API_KEY || SENDGRID_API_KEY.startsWith('PAKEISKITE')) {
    console.warn('⚠️  SENDGRID_API_KEY nenustatytas. El. laiškai nebus siunčiami.');
} else {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

// Middleware
app.use(cors());
app.use(express.json());

// ===================================
// MAGIC CODE VALDYMAS SU SUPABASE
// ===================================
const DEBUG_MODE = true; // Įjungti testui


function generateMagicCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function storeCode(email, code) {
    // Kodas galioja 15 minučių
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    try {
        // Pirma - ištrinti senuosius kodas
        await supabaseClient.from('magic_codes').delete().eq('email', email);
        
        // Tada - įterpti naują
        const { error } = await supabaseClient.from('magic_codes').insert([
            { email, code, expires_at: expiresAt }
        ]);
        
        if (error) throw error;
        if (DEBUG_MODE) console.log(`✅ Kodas saugomas Supabase: ${email} = ${code}`);
    } catch (err) {
        console.error(`❌ storeCode klaida:`, err.message);
        throw err;
    }
}

async function verifyCode(email, code) {
    if (DEBUG_MODE) console.log(`🔍 Tikrinamas: ${email} vs ${code}`);
    
    try {
        const { data, error } = await supabaseClient
            .from('magic_codes')
            .select('code, expires_at')
            .eq('email', email)
            .single();
        
        if (error || !data) {
            if (DEBUG_MODE) console.log(`❌ Nėra saugoto kodo ${email}`);
            return false;
        }
        
        if (new Date() > new Date(data.expires_at)) {
            if (DEBUG_MODE) console.log(`⏰ Kodas pasibaigęs`);
            await supabaseClient.from('magic_codes').delete().eq('email', email);
            return false;
        }
        
        if (data.code !== code) {
            if (DEBUG_MODE) console.log(`❌ Kodas nesutampa: ${data.code} vs ${code}`);
            return false;
        }
        
        if (DEBUG_MODE) console.log(`✅ Kodas patvirtintas!`);
        // Ištrinti jau naudotą kodą
        await supabaseClient.from('magic_codes').delete().eq('email', email);
        return true;
    } catch (err) {
        console.error(`❌ verifyCode klaida:`, err.message);
        return false;
    }
}

// Endpoint magic code siuntimui
app.post('/send-magic-code', async (req, res) => {
    try {
        const { email } = req.body;

        // Validacija
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Neteisingas el. pašto adresas' });
        }

        // Sugeneruoti magic code
        const magicCode = generateMagicCode();
        await storeCode(email, magicCode);
        
        console.log(`📧 Siuntimas: ${email}, kodas: ${magicCode}`);

        // Siųsti el. laišką per SendGrid
        await sgMail.send({
            from: FROM_EMAIL,
            to: email,
            subject: '🔐 Jūsų patvirtinimo kodas - Subscription Tracker',
            html: `
                <h2>🔐 Patvirtinimo kodas</h2>
                <p>Sveiki!</p>
                <p>Jūsų Subscription Tracker patvirtinimo kodas:</p>
                <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h1 style="letter-spacing: 5px; font-size: 32px; margin: 0;">${magicCode}</h1>
                </div>
                <p>Kodas galioja 15 minučių.</p>
                <p style="color: #999; font-size: 12px;">Jei neatsiuntėte šio prašymo, nepaisykite šio laiško.</p>
            `,
        });

        console.log('✅ Kodas nusiųstas:', email);
        
        // TESTAVIMUI: Grąžinti kodą
        res.json({ 
            success: true, 
            message: 'Kodas nusiųstas į el. paštą',
            testCode: magicCode,
            debug: {
                email: email,
                code: magicCode
            }
        });

    } catch (error) {
        const message = error?.response?.body?.errors?.[0]?.message || error.message;
        console.error('❌ SendGrid klaida:', message);
        res.status(500).json({ error: 'Nepavyko išsiųsti kodo: ' + message });
    }
});

// Endpoint magic code patvirtinimui
app.post('/verify-magic-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validacija
        if (!email || !code) {
            return res.status(400).json({ error: 'El. paštas ir kodas privalomi' });
        }

        console.log(`🔍 Tikrinimas: email=${email}, code=${code}`);

        // Patikrinti kodą iš Supabase
        const verified = await verifyCode(email, code);
        
        if (verified) {
            console.log('✅ Kodas patvirtintas!');
            res.json({ 
                success: true, 
                message: 'El. paštas patvirtintas',
                email: email
            });
        } else {
            console.log('❌ Kodas neteisingas arba pasibaigęs');
            return res.status(401).json({ 
                error: 'Neteisingas arba pasibaigęs kodas. Pabandykite iš naujo arba pradėkite nuo pradžios.'
            });
        }

    } catch (error) {
        console.error('❌ Serverio klaida:', error);
        res.status(500).json({ error: 'Serverio klaida: ' + error.message });
    }
});

// Endpoint el. laiškų siuntimui
app.post('/send-email', async (req, res) => {
    try {
        const { email, totalAmount, subscriptionCount, subscriptions } = req.body;

        // Validacija
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Neteisingas el. pašto adresas' });
        }

        if (!totalAmount && subscriptionCount === 0) {
            return res.status(400).json({ error: 'Nėra duomenų siųsti' });
        }

        // Sukurti el. laiško turinį
        let emailContent = `
            <h2>📱 Prenumeratų priminimas</h2>
            <p>Sveiki!</p>
            <p>Šis mėnuo jūsų prenumeratų suvestinė:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Bendra mėnesio kaina: <strong>€${totalAmount}</strong></h3>
                <p>Prenumeratų skaičius: <strong>${subscriptionCount}</strong></p>
            </div>
        `;

        // Pridėti prenumeratų sąrašą, jei yra
        if (subscriptions && subscriptions.length > 0) {
            emailContent += `
                <h3>Jūsų prenumeratos:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background: #667eea; color: white;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Pavadinimas</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Kaina</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Periodas</th>
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Mėnesio kaina</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            subscriptions.forEach(sub => {
                const monthlyPrice = sub.period === 'yearly' 
                    ? (sub.price / 12).toFixed(2) 
                    : sub.price.toFixed(2);
                const periodText = sub.period === 'monthly' ? 'Mėnesinis' : 'Metinis';
                
                emailContent += `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${sub.name}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">€${sub.price.toFixed(2)}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${periodText}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">€${monthlyPrice}</td>
                    </tr>
                `;
            });

            emailContent += `
                    </tbody>
                </table>
            `;
        }

        emailContent += `
            <p style="margin-top: 20px;">Su pagarba,<br>Subscription Tracker</p>
        `;

        // Siųsti el. laišką per SendGrid
        await sgMail.send({
            from: FROM_EMAIL,
            to: email,
            subject: `📱 Prenumeratų priminimas - €${totalAmount}/mėn`,
            html: emailContent,
        });

        console.log('El. laiškas sėkmingai išsiųstas:', email);
        res.json({ 
            success: true, 
            message: 'El. laiškas sėkmingai išsiųstas'
        });

    } catch (error) {
        const message = error?.response?.body?.errors?.[0]?.message || error.message;
        console.error('SendGrid klaida:', message);
        res.status(500).json({ error: 'Nepavyko išsiųsti el. laiško: ' + message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Serveris veikia' });
});

// Paleisti serverį
app.listen(PORT, async () => {
    console.log(`🚀 Serveris veikia: http://localhost:${PORT}`);
    console.log(`🔐 Magic code endpoint: http://localhost:${PORT}/send-magic-code`);
    console.log(`✅ Magic code verify: http://localhost:${PORT}/verify-magic-code`);
    console.log(`📧 El. laiškų endpoint: http://localhost:${PORT}/send-email`);
    console.log(`⚠️  Nepamirškite nustatyti SENDGRID_API_KEY ir FROM_EMAIL!`);
    
    // Patikrinti magic_codes lentelę
    try {
        const { data, error } = await supabaseClient.from('magic_codes').select('id').limit(1);
        if (!error) {
            console.log('✅ magic_codes lentelė egzistuoja!');
        } else {
            console.log('⚠️  magic_codes lentelė neegzistuoja!');
            console.log('📝 Pradžiai, jei reikia, kurkite per Supabase console.');
        }
    } catch (err) {
        console.log('⚠️  Nepavyko patikrinti lentelės:', err.message);
    }
});
