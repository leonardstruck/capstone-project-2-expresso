const Express = require('express');
const employeerouter = Express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//MIDDLEWARE
var checkIfEmployeeExists = function(req, res, next) {
  db.all('SELECT * FROM Employee WHERE id = $id', {$id: req.params.id}, (err, rows) => {
    if (rows.length == 0) {
      res.status(404).send();
    } else {
      next();
    }
  });
}

var checkIfValidValues = function(req, res, next) {
  if(req.body.employee.name && req.body.employee.position && req.body.employee.wage ) {
    next();
  } else {
    res.status(400).send();
  }
}

var sendBackEmployee = function(res, id, resstatus) {
  db.get('SELECT * FROM Employee WHERE id = $id', {$id: id}, (err, row) => {
    res.status(resstatus).send({employee: row});
  });
}

//GET ROUTES
employeerouter.get('/', (req, res) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, rows) => {
    res.status(200).send({employees: rows});
  });
});

employeerouter.get('/:id', checkIfEmployeeExists, (req, res) => {
  sendBackEmployee(res, req.params.id, 200);
});

employeerouter.get('/:id/timesheets', checkIfEmployeeExists, (req,res) => {
  db.all('SELECT * FROM Timesheet WHERE employee_id = $id', {$id: req.params.id}, (err, rows) => {
    res.status(200).send({timesheets: rows});
  });
});

//POST ROUTES
employeerouter.post('/', checkIfValidValues, (req, res) => {
  db.run('INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, 1)', {$name: req.body.employee.name, $position: req.body.employee.position, $wage: req.body.employee.wage}, function (err) {
    if(!err) {
      sendBackEmployee(res, this.lastID, 201);
    }
  });
});

//PUT ROUTES
employeerouter.put('/:id', checkIfEmployeeExists, checkIfValidValues, (req,res) => {
  db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $id', {$name: req.body.employee.name, $position: req.body.employee.position, $wage: req.body.employee.wage, $id: req.params.id}, function (err) {
    if(!err) {
      sendBackEmployee(res, req.params.id, 200);
    }
  });
});

//DELETE ROUTES
employeerouter.delete('/:id', checkIfEmployeeExists, (req, res) => {
  db.run('UPDATE Employee SET is_current_employee = 0 WHERE id = $id', {$id: req.params.id}, function (err) {
    sendBackEmployee(res, req.params.id, 200);
  });
});

module.exports = employeerouter;
