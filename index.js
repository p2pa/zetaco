// set up env
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors')
const Moralis = require("moralis").default;
const axios = require('axios');
const { EvmChain } = require("@moralisweb3/common-evm-utils");
require('./streams')();

// set up express
const app = express()
app.use(cors()) // to allow cross origin requests
app.use(express.json()); // to convert the request into JSON
dotenv.config();
const port = 3000;

//the rest of your express routes.
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

// init moralis
Moralis.start({
  apiKey: process.env.API_KEY,
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

// concepting here
// if 
// {coin/exchange/walletaddress/nft} 
// {event} 
// {chain} 
// {event specifications}
// notify me on
// {slack/twitter/telegram/email etc}

// let post = {
//   1: {
//     address: "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b",
//     type: "exchange"
//   },
//   2: {
//     type: "transaction"
//   },
//   3: {
//     chain: "eth"
//   },
//   4: {
//     type: "",
//     condition: "above",
//     currency: "usd",
//     value: 10000,
//   },
//   5: {
//     platform: "telegram",
//     username: "p2pasta"
//   },
//   lastBlock: 16221730
// }

// let posts = [post]

// async function main(){
//   posts.forEach(async (el) => {
//     // dissect post
//     let address = el[1].address;
//     // define lastblock
//     let fromBlock = el.lastBlock;
//     // chain
//     let chain = EvmChain.ETHEREUM;  
//     // conditions
    

//     // find all transactions since the last block
//     // const response = await Moralis.EvmApi.transaction.getWalletTransactions({
//     //   address,
//     //   chain,
//     //   fromBlock
//     // });  

//     // exchange / transaction / ethereum 
//     // to do: branch out in classes depending on the above variables
//     const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
//       address,
//       chain,
//       fromBlock
//     });
    
//     let totalFound = response.total;
//     let results = response.result;
//     let passed = [];
//     let highestBlock = 0;

//     results.forEach(async (tx) => {
//       // apply validation
//       // to do: find a different API for token price since rate limit on moralis
//       const tokenValue = tx.value * await Moralis.EvmApi.token.getTokenPrice({
//           address: tx.address,
//           toBlock: tx.blockNumber,
//           exchange: 'Uniswapv3',
//           chain
//       }).usdPrice; 

//       // apply highest block
//       highestBlock = tx.blockNumber > highestBlock ? tx.blockNumber : highestBlock;
      
//       let condition = el[4].condition == 'above' ? (tokenValue > el[4].value) : (tokenValue < el[4].value);
//       if(condition){
//         passed.push({
//           hash: tx.transactionHash,
//           block: tx.blockNumber,
//           from: tx.fromAddress,
//           to: tx.toAddress,
//           value: tokenValue
//         });
//       }
//     });    
    
//     console.log(passed);

//     // set last block variable for next iteration
//     el.lastBlock = highestBlock;
//   });
// }

// init();
// setInterval(main, 10*1000);

// create stream
//   const { id }  = await addStream({
//     networkType: 'evm',
//     webhookUrl: process.env.NGROK,
//     tag: '1', // user id
//     chains: ['0x1'],
//     description: 'test description'
//   })

// add address to stream
// await Moralis.Streams.addAddress({ address, id });