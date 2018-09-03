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

var checkIfValidEmployee = function(req, res, next) {
  if(req.body.employee.name && req.body.employee.position && req.body.employee.wage ) {
    next();
  } else {
    res.status(400).send();
  }
}

var checkIfValidTimesheet = function(req, res, next) {
  if (req.body.timesheet.hours && req.body.timesheet.rate && req.body.timesheet.date && req.params.id) {
    next();
  } else {
    res.status(400).send();
  }
}

var sendBackItem = function(res, table, id, resstatus) {
  db.get('SELECT * FROM ' + table + ' WHERE id = $id', {$id: id}, (err, row) => {
    if(table == "Employee") {
      res.status(resstatus).send({employee: row});
    } else if (table == "Timesheet") {
      res.status(resstatus).send({timesheet: row});
    }
  });
}

//GET ROUTES
employeerouter.get('/', (req, res) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, rows) => {
    res.status(200).send({employees: rows});
  });
});

employeerouter.get('/:id', checkIfEmployeeExists, (req, res) => {
  sendBackItem(res, 'Employee', req.params.id, 200);
});

employeerouter.get('/:id/timesheets', checkIfEmployeeExists, (req,res) => {
  db.all('SELECT * FROM Timesheet WHERE employee_id = $id', {$id: req.params.id}, (err, rows) => {
    res.status(200).send({timesheets: rows});
  });
});

//POST ROUTES
employeerouter.post('/', checkIfValidEmployee, (req, res) => {
  db.run('INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, 1)', {$name: req.body.employee.name, $position: req.body.employee.position, $wage: req.body.employee.wage}, function (err) {
    if(!err) {
      sendBackItem(res, 'Employee', this.lastID, 201);
    }
  });
});

employeerouter.post('/:id/timesheets', checkIfValidTimesheet, checkIfEmployeeExists, (req, res) => {
  db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)', {$hours: req.body.timesheet.hours, $rate: req.body.timesheet.rate, $date: req.body.timesheet.date, $employee_id: req.params.id}, function (err) {
    if(!err) {
      sendBackItem(res, 'Timesheet', this.lastID, 201);
    }
  })
})

//PUT ROUTES
employeerouter.put('/:id', checkIfEmployeeExists, checkIfValidEmployee, (req,res) => {
  db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $id', {$name: req.body.employee.name, $position: req.body.employee.position, $wage: req.body.employee.wage, $id: req.params.id}, function (err) {
    if(!err) {
      sendBackItem(res, 'Employee', req.params.id, 200);
    }
  });
});

//DELETE ROUTES
employeerouter.delete('/:id', checkIfEmployeeExists, (req, res) => {
  db.run('UPDATE Employee SET is_current_employee = 0 WHERE id = $id', {$id: req.params.id}, function (err) {
    sendBackItem(res, 'Employee', req.params.id, 200);
  });
});

module.exports = employeerouter;
