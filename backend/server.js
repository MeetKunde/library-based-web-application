const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const hostname = 'localhost';
const port = 3232;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

app.get('/api/get-exercise', (req, res) => {
    const filePath = `examples/${req.query.path}.txt`;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) { return res.status(500).json({ error: 'Error reading exercise' }); }
        res.json({ exercise: data });
    });
});

app.post('/api/save-exercise', bodyParser.json(), (req, res) => {
    const filePath = `examples/${req.body.path}.txt`;
    const content = req.body.content; 

    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) { return res.status(500).json({ error: 'Error writing exercise' }); }
        res.json('Exercise written successfully');
    });
});

app.listen(port, hostname, function () {
    console.log(`Server running at http://${hostname}:${port}/`);
});
