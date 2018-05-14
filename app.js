// Bring in our dependencies
const app = require('express')();
const hotels = require('./hotels');
const PORT = process.env.PORT || 3000;

//  Connect all our routes to our application
app.use(app.router);
routes.initialize(app);

// Turn on that server!
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
