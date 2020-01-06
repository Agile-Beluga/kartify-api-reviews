const express = require('express');
const app = express();
const parser = require('body-parser');
const PORT = process.env.port || 3000;
const db = require('./db');

app.use(parser.json());

setTimeout(() => db.connect(err => console.log(err || 'DB connected')), 6000);

app.get('/reviews/:product_id/list', (req, res) => {
  // db.query('SELECT * FROM characteristics LIMIT 20')
  //   .then(data => res.send(data))
  //   .catch(err => res.send(err));
  console.log('I ran');
});

app.listen(PORT, err => console.log(err || `Listening on port ${PORT}.`));
