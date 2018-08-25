const Express = require('express');
const employeerouter = Express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//GET ROUTES
employeerouter.get('/', (req, res) => {
  db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, rows) => {
    if(!err) {
      res.status(200).send({employees:rows});
    }
  });
});

employeerouter.get('/:id', (req, res) => {
  db.serialize(function() {
    db.all("SELECT * FROM Employee WHERE id = $id", {$id: req.params.id}, (err, rows) => {
      if(rows.length == 0) {
        res.status(404).send();
      }
    });
    db.get("SELECT * FROM Employee WHERE id = $id", {$id: req.params.id}, (err, row) => {
      if(!err) {
        res.status(200).send({employee:row});
      }
    });
  });
});

module.exports = employeerouter;
