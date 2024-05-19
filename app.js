var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

db.run('CREATE TABLE IF NOT EXISTS ticket (id INTEGER PRIMARY KEY AUTOINCREMENT, destination TEXT, price INT, date TEXT) ');

app.post('/api', (req, res) => {
    // 从请求体中获取 ticket 或 date 参数
    let destination = req.body.destination;
    let date = req.body.date;
    let price = req.body.price;
    // 根据请求参数构建 SQL 查询语句
    let query;
    let params;

    if (destination && date){
        query = 'SELECT * FROM ticket WHERE destination = ? AND date = ?';
        params = [destination, date];
    } else if (destination) {
        query = 'SELECT * FROM ticket WHERE destination = ?';
        params = [destination];
    } else if (date) {
        query = `SELECT * FROM ticket WHERE date = ?`;
        params = [date];
    } else if(price) {
        query = `SELECT * FROM ticket WHERE price = ?`;
        params = [price];
    } else {
        return res.status(400).send('Bad request: Missing ticket or date parameter');
    }

    // 执行查询
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database query error:', err.message);
            res.status(500).send('Internal server error');
            return;
        }
        res.send(rows);
    });
});

