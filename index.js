const express = require('express');
const bodyParser = require("body-parser");
const config = require('./config');
const fs = require('fs');

const app = express();

var list = [];
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");


app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);

    fs.readFile('generated_words.txt', 'utf8', function (err, data) {
        if (err) throw err;
        list = data.split("\r\n");
    });

    
    const getSearchText = (req, res, next) => {
        if (req.method == "POST")
            res.set("search", req.body.search);
        next();

    };
    const renderIndex = (req, res) => {

        if (parseInt(req.query.index) <= 0) {
            return res.redirect("/");
        }
        else if (parseInt(req.query.index) >= list.length) {
            return res.redirect("/");
        }
        if (res.getHeader("search") && res.getHeader("search") != "undefined" && res.getHeader("search") != "null") {
            let text = res.getHeader("search").trim();
            let temp = list;
            return res.render('index', { list: temp.filter((e) => e.toLowerCase().includes(text.toLowerCase())), index: req.query.index || 0 });

        }
        return res.render('index', { list: list, index: req.query.index || 0 });
    };
    app.get('/',  renderIndex);
    app.post('/', getSearchText, renderIndex);
    app.get('/words', (req, res) => {
        res.json(list);
        fs.writeFileSync('logs/words.json', '[' + list + ']');
    });
    app.get('/words/count', (req, res) => {
        res.json(list.length);
        fs.writeFileSync('logs/words_count.json', "[" + list.length + "]");

    });

    app.get('/words/sortby/length', (req, res) => {
        let temp = list.flat();
        temp.sort((a, b) => {
            return a.length - b.length;
        });
        res.json(temp);
        fs.writeFileSync('logs/words_sortedby_length.json', "[" + temp + "]");

    });
    app.get('/words/groupby/length', (req, res) => {
        let temp = list.flat();
        temp.sort((a, b) => {
            return a.length - b.length;
        });
        var result = {};
        var minLength = temp[0].length;
        var maxLength = temp[temp.length - 1].length;

        for (let length = minLength; length <= maxLength; length++) {
            result[length] = temp.filter(word => word.length == length);
        }

        res.json(result);
        fs.writeFileSync('logs/words_groupeddby_length.json', JSON.stringify(result));

    });
});