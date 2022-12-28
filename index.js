const express = require('express');
const cors = require('cors')
const Moralis = require("moralis").default;
const axios = require('axios');
const { EvmChain } = require("@moralisweb3/common-evm-utils");
require('./streams')();
const Protocol = require('./protocol.js');

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
  let p = new Protocol('ethereum');
  let result = await p.getUniqueUsers();
  res.json(result)

  // // res.json(queryResults);
  // let flipside = new Flipside(
  //   process.env.SHROOM_API_KEY,
  //   "https://node-api.flipsidecrypto.com"
  // );
  
  // // Parameters can be passed into SQL statements via simple & native string interpolation
  // let myAddress = "0x009C6979E15443e521389dd998ceABb91369DcC9";

  // // Create a query object for the `query.run` function to execute
  // let query = {
  //   sql: `select nft_address, mint_price_eth, mint_price_usd from ethereum.core.ez_nft_mints where nft_to_address = LOWER('${myAddress}')`,
  //   ttlMinutes: 10,
  // };
  
  // let result = await flipside.query.run(query);

  // // error handling
  // if(result.error == null){
  //   console.warn(result.error)
  // }
  // res.json(result)
});

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