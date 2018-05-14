
const routes = require('express').Router();
const rooms = require('./rooms');

routes.use('/rooms', rooms);


routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

module.exports = routes;