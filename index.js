const express = require('express');
const cors = require('cors')
const Moralis = require("moralis").default;
const axios = require('axios');
const { EvmChain } = require("@moralisweb3/common-evm-utils");
require('./streams')();

const Protocol = require('./protocol.js');
const Chain = require('./chain.js');

// set up express
const app = express()
app.use(cors()) // to allow cross origin requests
app.use(express.json()); // to convert the request into JSON

const port = 3000;

//the rest of your express routes.
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

app.get('/test', async (req, res) => {
  let c = new Chain('ethereum');
  let result = await c.getUniqueUsers();
  res.json(result)
});

app.get('/getProtocols', (req, res) => {
  let p = new Protocol('all');
  let result = p.getProtocols();
  res.json(result)
})

app.get('/getChains', (req, res) => {
  let c = new Chain('all');
  let result = c.getChains();
  res.json(result)
})

app.get('/api/chains/:x/:dimension/:from/:to', async (req, res) => {
  // Log the request
  console.log("Received a request for the api/chains/" + req.params.x + '/' + req.params.dimension + '/' + req.params.from + '/' + req.params.to)

  // Init the chain class
  let c = new Chain(req.params.x.toLowerCase());

  // Simplify date variables
  let from = req.params.from;
  let to = req.params.to;

  // Determine dimension and appropiate action
  switch (req.params.dimension.toLowerCase()) {
    case "volume":
      let volume = await c.getVolume(from, to);
      res.json(volume);
      break;  
    case "uniqueusers":
      let uniqueUsers = await c.getUniqueUsers(from, to);
      res.json(uniqueUsers);
      break;
    case "transactions":
      let transactions = await c.getTransactions(from, to);
      res.json(transactions);
      break;
    default:
      res.json({ error: "Dimension not found"});
      break;
  }
})

app.get('/api/:protocol/:x/:dimension/:from/:to', async (req, res) => {
  console.log("Received a request for the api/protocol/" + req.params.x + '/' + req.params.dimension + '/' + req.params.from + '/' + req.params.to)
  // Log the request  

  // Init the chain class
  let c = new Protocol(req.params.x.toLowerCase());

  // Simplify date variables
  let from = req.params.from;
  let to = req.params.to;

  // Determine dimension and appropiate action
  switch (req.params.dimension.toLowerCase()) {
    case "buyers":
      let buyers = await c.getBuyers(from, to);
      res.json(buyers);
      break;  
    case "sellers":
      let sellers = await c.getSellers(from, to);
      res.json(sellers);
      break;    
    default:
      res.json({ error: "Dimension not found"});
      break;
  }
})

app.post('api/webhook', (req, res) => {
  // webhooks enter here  
  res.sendStatus(200);    
})