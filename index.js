const express = require('express');
const bodyParser = require("body-parser");
const config = require('./config');
const fs = require('fs');

const app = express();

var list = [];
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);

    fs.readFile('generated_words.txt', 'utf8', function (err, data) {
        if (err) throw err;
        list = data.split("\r\n");
    });

    app.get('/words', (req, res) => {
        res.json(list);
        fs.writeFileSync('logs/words.json', '[' + list + ']');
    });
    app.get('/words/count', (req, res) => {
        res.json(list.length);
        fs.writeFileSync('logs/words_count.json', "[" + list.length + "]");

    });

    app.get('/words/sortby/length', (req, res) => {
        list.sort((a, b) => {
            return a.length - b.length;
        });
        res.json(list);
        fs.writeFileSync('logs/words_sortedby_length.json', "[" + list + "]");

    });
    app.get('/words/groupby/length', (req, res) => {
        list.sort((a, b) => {
            return a.length - b.length;
        });
        var result = {};
        var minLength = list[0].length;
        var maxLength = list[list.length - 1].length;

        for (let length = minLength; length <= maxLength; length++) {
            result[length] = list.filter(word => word.length == length);
        }

        res.json(result);
        fs.writeFileSync('logs/words_groupeddby_length.json', JSON.stringify(result));

    });
});