// set up env
const dotenv = require('dotenv');
dotenv.config();

// set up express
const express = require('express');
const app = express()
const port = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
