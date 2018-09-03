const Express = require('express');
const menurouter = Express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menurouter.get('/', (req, res) => {
  db.all('SELECT * FROM Menu', (err, rows) => {
    res.status(200).send({menus: rows});
  });
});

module.exports = menurouter;
