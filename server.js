const Express = require('express');
const app = Express();
const PORT = 4000;

const employeerouter = require('./api/employees.js');


app.use('/api/employees/', employeerouter);

app.listen(PORT || process.env.PORT, () => { console.log("Listening to Port " + PORT); });
