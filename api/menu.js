const Express = require('express');
const menurouter = Express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//MIDDLEWARE
var checkIfMenuExists = function(req, res, next) {
  db.all('SELECT * FROM Menu WHERE id = $id', {$id: req.params.id}, (err, rows) => {
    if (rows.length == 0) {
      res.status(404).send();
    } else {
      next();
    }
  });
}

var checkIfValidMenu = function(req, res, next) {
  if(req.body.menu.title) {
    next();
  } else {
    res.status(400).send();
  }
}

var sendBackItem = function(res, table, id, resstatus) {
  db.get('SELECT * FROM ' + table + ' WHERE id = $id', {$id: id}, (err, row) => {
    if(table == "Menu") {
      res.status(resstatus).send({menu: row});
    } else if (table == "Timesheet") {
      res.status(resstatus).send({timesheet: row});
    }
  });
}

var checkIfMenuHasRelatedItems = function(req, res, next) {
  db.all('SELECT * FROM MenuItem WHERE menu_id = $id', {$id: req.params.id}, (err, rows) => {
    if(rows.length == 0) {
      next();
    } else {
      res.status(400).send();
    }
  });
};

//GET ROUTES
menurouter.get('/', (req, res) => {
  db.all('SELECT * FROM Menu', (err, rows) => {
    res.status(200).send({menus: rows});
  });
});

menurouter.get('/:id', checkIfMenuExists, (req, res) => {
  sendBackItem(res, 'Menu', req.params.id, 200);
});

menurouter.get('/:id/menu-items', checkIfMenuExists, (req, res) => {
  db.all('SELECT * FROM MenuItem WHERE menu_id = $id', {$id: req.params.id}, (err, rows) => {
    res.status(200).send({menuItems: rows});
  });
});

//POST ROUTES
menurouter.post('/', checkIfValidMenu, (req, res) => {
  db.run('INSERT INTO Menu (title) VALUES ($title)', {$title: req.body.menu.title}, function (err) {
    if(!err) {
      sendBackItem(res, 'Menu', this.lastID, 201);
    }
  });
});

//PUT ROUTES
menurouter.put('/:id', checkIfValidMenu, (req, res) => {
  db.run('UPDATE Menu SET title = $title WHERE id = $id', {$title: req.body.menu.title, $id: req.params.id}, function (err) {
    if(!err) {
      sendBackItem(res, 'Menu', req.params.id, 200);
    }
  });
});

//DELETE ROUTES
menurouter.delete('/:id', checkIfMenuHasRelatedItems, (req,res) => {
  db.run('DELETE FROM Menu WHERE id = $id', {$id: req.params.id}, (err) => {
    if(!err) {
      res.status(204).send();
    }
  })
});

module.exports = menurouter;
