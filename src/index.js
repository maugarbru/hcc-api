require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const controllers = require('./api');
const config = require('../config.json');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

global.fbasedir = `${__dirname}/..`;

// app.use( ruta + '/games', require('./api/domain/games/index'))
app.post(config.ruta + '/files', controllers.getStoredFiles)
app.post(config.ruta + '/files/open', controllers.openStoredFile)
app.post(config.ruta + '/files/close', controllers.closeOpenedFile)

app.use(function (req, res, next) {
  res.status(404).send(
    {
      success: false,
      message: 'No encontrado'
    })

})

app.listen(config.puerto, () => {
  console.log(`Application running at: http://localhost:${config.puerto}`);
});