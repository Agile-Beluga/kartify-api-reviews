const express = require('express');
const app = express();
const parser = require('body-parser');

const PORT = process.env.port || 3000;

app.use(parser.json());

app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
