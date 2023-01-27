const dotenv = require('dotenv');
dotenv.config();

const protocols = require('./available.json')

// coingecko
const CoinGecko = require('coingecko-api');

// flipside
const api_1 = require("./api");
const integrations_1 = require("./flipside/integrations");
const { json } = require('express');

class Flipside {
  constructor(apiKey, apiBaseUrl = "https://api.flipsidecrypto.com") {
      // Setup API, which will be passed to integrations
      const api = new api_1.API(apiBaseUrl, "js", "1.1.1", apiKey);
      // declare integrations on Flipside client
      this.query = new integrations_1.QueryIntegration(api);
  }
}


// queries
const standard = require('./queries/ethereum/nft/standard.js')

module.exports = function(project){
    this.chosen = project;

    this.flipside = new Flipside(
        process.env.SHROOM_API_KEY,
        "https://node-api.flipsidecrypto.com"
    );

    this.coingecko = new CoinGecko();

    this.available = protocols;

    this.getProtocols = function(){
        return this.available.sort((a, b) => a.name.localeCompare(b.name))   
    }

    this.query = async function(sql){
        return await this.flipside.query.run({
            sql: sql,
            ttlMinutes: 10
        });
    }
    
    this.getData = async function(from, to, dimension){
        let column = ''
        let data = null;

        // variables needed
        let availableIndex = this.available.map(e => e.name).indexOf(this.chosen);       
        let current = this.available[availableIndex];
        let name = current.name;
        let chain = current.chain;
        let category = current.category;
        let contract = current.contract;
        let ticker = current.ticker;
        let max_supply = current.max_supply;
        let cg_id = current.cg_id;


        switch (category) {
            case 'NFT':
                switch (dimension) {
                    case 'price':
                        data = await this.query(require('./queries/ethereum/price.js')(ticker));                        
                        break;
                    case 'fdmc':
                        data = await this.query(require('./queries/ethereum/fdmc.js')(max_supply, ticker));                        
                        break;
                    case 'mc':
                        let res = await this.coingecko.coins.fetch(cg_id, { market_data: true, community_data: false, developer_data: false, localization: false, sparkline: false });                            
                        data = await this.query(require('./queries/ethereum/mc.js')(res.data.market_data.circulating_supply, ticker));  
                        break;
                    case 'users':
                        data = await this.query(require('./queries/ethereum/nft/users.js')(name));                        
                        break;
                    default:
                        data = await this.query(standard(dimension, name));
                        break;             
                }    
                break;
            case 'Staking':
                switch (dimension) {
                    case 'price':
                        data = await this.query(require('./queries/ethereum/price.js')(ticker));                        
                        break;
                    case 'fdmc':
                        data = await this.query(require('./queries/ethereum/fdmc.js')(max_supply, ticker));                           
                        break;
                    case 'mc':
                        let res = await this.coingecko.coins.fetch(cg_id, { market_data: true, community_data: false, developer_data: false, localization: false, sparkline: false });                            
                        data = await this.query(require('./queries/ethereum/mc.js')(res.data.market_data.circulating_supply, ticker));  
                        break;  
                    case 'withdrawed':
                        data = await this.query(require('./queries/ethereum/staking/withdrawed.js')(name));                        
                        break;
                    default:
                        data = await this.query(require('./queries/ethereum/staking/standard.js')(dimension, contract));      
                        break; 
                }
                break;
            case 'DEX':
                switch (dimension) {  
                    case 'price':
                        data = await this.query(require('./queries/ethereum/price.js')(ticker));                        
                        break;
                    case 'fdmc':
                        data = await this.query(require('./queries/ethereum/fdmc.js')(max_supply, ticker));                           
                        break;
                    case 'mc':
                        let res = await this.coingecko.coins.fetch(cg_id, { market_data: true, community_data: false, developer_data: false, localization: false, sparkline: false });                            
                        data = await this.query(require('./queries/ethereum/mc.js')(res.data.market_data.circulating_supply, ticker));  
                        break;
                    case 'tvl':
                        data = await this.query(require('./queries/ethereum/dex/tvl.js')(name));
                        break;
                    default:
                        data = await this.query(require('./queries/ethereum/dex/standard.js')(dimension, name));
                        break;       
                }                
                break;
        }       

        var finished = {
            columns: ["protocol", "date", dimension],
            rows: [],
        };      
        
        if(dimension == 'pfratio'){
            let res = await this.coingecko.coins.fetchMarketChart(this.chosen);        
            if(res.error){
                console.log(res.error)
            }
            marketcap = res.data.market_caps[0][1]
        }

        for (let i = 0; i <  data.rows.length; i++) {
            let el =  data.rows[i];
            let inUnix = this.convertToUnix(el[0]);            
            if(inUnix > from && inUnix < to){
                let difference = to - from;
                let days = Math.floor(difference / 60 / 60 / 24);

                if(i == 0){
                    if(data.rows.length < days){            
                        console.log("Data is incomplete")
                        let daysDifference = (days - data.rows.length);
                        for (let x = 1; x < daysDifference; x++) {           
                            finished.rows.push([this.chosen, this.convertToDate(parseInt(from) + (86400 * x)), 0])                
                        }
                    }
                }                
                if(dimension == 'pfratio'){
                    // annualized revenue  / market cap                                        
                    let pf = marketcap / (el[1] * 365);
                    finished.rows.push([this.chosen, el[0], pf])
                } else {
                    finished.rows.push([this.chosen, el[0], el[1]])
                }
            }            
        }
        return finished; 
    }
    
    this.convertToUnix = function(date){
        let newDate = parseInt((new Date(date).getTime() / 1000).toFixed(0));
        //console.log(date + ' becomes ' + newDate)
        return newDate;
    }

    this.convertToDate = function(unix){
        let newDate = new Date(unix * 1000);
        return newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate();
    }
}