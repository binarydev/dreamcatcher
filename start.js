const app = require('./server.js');

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Dreamcatcher listening at http://%s:%s", host, port);
});
