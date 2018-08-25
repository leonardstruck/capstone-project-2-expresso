const Express = require('express');
const employeerouter = Express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeerouter.get('/', (req, res) => {
  db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, rows) => {
    res.status(200).send({employees:rows});
  });
});

module.exports = employeerouter;
