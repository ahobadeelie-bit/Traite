const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static('public'));

function processCardData(input) {
    const order = [
        'A♠️','K♠️','Q♠️','J♠️','10♠️','9♠️','8♠️','7♠️','6♠️',
        'A♦️','K♦️','Q♦️','J♦️','10♦️','9♦️','8♦️','7♦️','6♦️',
        'A♣️','K♣️','Q♣️','J♣️','10♣️','9♣️','8♣️','7♣️','6♣️',
        'A♥️','K♥️','Q♥️','J♥️','10♥️','9♥️','8♥️','7♥️','6♥️'
    ];

    const lines = input.trim().split('\n').filter(line => line.trim());

    const hands = lines.map(line => {
        const clean = line.split(')')[0] + ')';
        const match = clean.match(/#N?(\d+)\.(\d+) $([^)]+)$/i);
        if (!match) return null;

        const num = match[1];
        const total = match[2];
        const cards = match[3];

        let keyIndex = Infinity;
        for (let i = 0; i < order.length; i++) {
            if (cards.includes(order[i])) {
                keyIndex = i;
                break;
            }
        }

        return {
            key: order[keyIndex],
            line: `#N${num}.${total}(${cards})`
        };
    }).filter(Boolean);

    hands.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

    const grouped = [];
    let lastKey = null;
    for (const h of hands) {
        if (h.key !== lastKey) {
            grouped.push({ key: h.key, lines: [] });
            lastKey = h.key;
        }
        grouped[grouped.length - 1].lines.push(h.line);
    }

    const output = [];
    for (const g of grouped) {
        output.push(g.key);
        output.push(...g.lines);
    }

    return output.join('\n');
}

app.post('/process', (req, res) => {
    try {
        const { data } = req.body;
        const result = processCardData(data);
        res.json({ success: true, result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
