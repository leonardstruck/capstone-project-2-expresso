const Express = require('express');
const app = Express();
const PORT = 4000 || process.env.PORT;
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());

//ROUTERS
const employeerouter = require('./api/employees.js');
const menurouter = require('./api/menu.js');


app.use('/api/employees', employeerouter);
app.use('/api/menus', menurouter);

app.listen(PORT, () => { console.log("Listening to Port " + PORT); });

module.exports = app;
