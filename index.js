// set up env
const dotenv = require('dotenv');
dotenv.config();

// set up express
const express = require('express');
const app = express()
const port = process.env.PORT;

// set up moralis
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");

// concepting here
// if 
// {coin/exchange/walletaddress/nft} 
// {event} 
// {chain} 
// {event specifications}
// notify me on
// {slack/twitter/telegram/email etc}

let post = {
  1: {
    address: "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b",
    type: "exchange"
  },
  2: {
    type: "transaction"
  },
  3: {
    chain: "eth"
  },
  4: {
    type: "",
    condition: "above",
    currency: "usd",
    value: 10000,
  },
  5: {
    platform: "telegram",
    username: "p2pasta"
  },
  lastBlock: 16221730
}

let posts = [post]

async function init(){
  // init moralis
  await Moralis.start({
    apiKey: process.env.API_KEY,
  });
  main();
}

async function main(){
  posts.forEach(async (el) => {
    // dissect post
    let address = el[1].address;
    // define lastblock
    let fromBlock = el.lastBlock;
    // chain
    let chain = EvmChain.ETHEREUM;  
    // conditions
    

    // find all transactions since the last block
    // const response = await Moralis.EvmApi.transaction.getWalletTransactions({
    //   address,
    //   chain,
    //   fromBlock
    // });  

    // exchange / transaction / ethereum 
    const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
      address,
      chain,
      fromBlock
    });
    
    let totalFound = response.total;
    let results = response.result;
    let passed = [];
    let highestBlock = 0;

    results.forEach(async (tx) => {
      // apply validation
      const tokenValue = tx.value * await Moralis.EvmApi.token.getTokenPrice({
          address: tx.address,
          toBlock: tx.blockNumber,
          exchange: 'Uniswapv3',
          chain
      }).usdPrice; 

      // apply highest block
      highestBlock = tx.blockNumber > highestBlock ? tx.blockNumber : highestBlock;
      
      let condition = el[4].condition == 'above' ? (tokenValue > el[4].value) : (tokenValue < el[4].value);
      if(condition){
        passed.push({
          hash: tx.transactionHash,
          block: tx.blockNumber,
          from: tx.fromAddress,
          to: tx.toAddress,
          value: tokenValue
        });
      }
    });    
    
    console.log(passed);

    // set last block variable for next iteration
    el.lastBlock = highestBlock;
  });
}

init();
setInterval(main, 10*1000);

// app.get('/', async (req, res) => {
//   const address = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

//   const chain = EvmChain.ETHEREUM;

//   const response = await Moralis.EvmApi.transaction.getWalletTransactions({
//     address,
//     chain,
//   });
  
//   console.log(response.toJSON());
// })

app.listen(port, async () => {
  
  console.log(`Example app listening on port ${port}`)
})

