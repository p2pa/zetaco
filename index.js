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

app.get('/api/:protocol/:what/:from/:to', async (req, res) => {
  console.log("Received a request for the api/" + req.params.protocol + '/' + req.params.what + '/' + req.params.from + '/' + req.params.to)
  //let streams = await getStreams().result;  
  //res.render('streams', streams)
  let arr = []

  if(req.params.what == 'TVL'){
    await axios
    .get('https://api.llama.fi/protocol/' + req.params.protocol)
    .then(async (res) => {
      let data = res.data.tvl
      let item = {
        data: [],
        labels: [],
      }
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        if(element.date > req.params.from && element.date < req.params.to){
          // turn usd into eth
          // let eth = await axios.get('https://coins.llama.fi/prices/historical/' + element.date + '/coingecko:ethereum').then((res) => {
          //     return (element.totalLiquidityUSD / res.data.coins['coingecko:ethereum'].price)
          // }).catch(err => console.log(err))
          // item.data.push(eth)
          item.data.push(element.totalLiquidityUSD)
          item.labels.push(new Date(element.date * 1000))
        }        
      }      
      arr.push(item)
    })
  }  
  if(req.params.what == 'Revenue'){
    await axios
    .get('https://api.llama.fi/summary/fees/'+ req.params.protocol + '?dataType=dailyRevenue')
    .then(async (res) => {
      let tvl = res.data.totalDataChart
      let item = {
        data: [],
        labels: [],
      }
      for (let i = 0; i < tvl.length; i++) {
        const element = tvl[i];
        if(element[0] > req.params.from && element[0] < req.params.to){
          // turn usd into eth
          // let eth = await axios.get('https://coins.llama.fi/prices/historical/' + element.date + '/coingecko:ethereum').then((res) => {
          //     return (element.totalLiquidityUSD / res.data.coins['coingecko:ethereum'].price)
          // }).catch(err => console.log(err))
          // item.data.push(eth)
          //item.data.push(element[1])
          item.labels.push(new Date(element[0] * 1000))
        }        
      }      
      arr.push(item)
    })
  }  
  res.json(arr);
})

app.post('api/webhook', (req, res) => {
  // webhooks enter here  
  res.sendStatus(200);    
})