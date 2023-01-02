const dotenv = require('dotenv');
dotenv.config();
const api_1 = require("./api");
const integrations_1 = require("./flipside/integrations");

class Flipside {
  constructor(apiKey, apiBaseUrl = "https://api.flipsidecrypto.com") {
      // Setup API, which will be passed to integrations
      const api = new api_1.API(apiBaseUrl, "js", "1.1.1", apiKey);
      // declare integrations on Flipside client
      this.query = new integrations_1.QueryIntegration(api);
  }
}

module.exports = function(project){
    this.chosen = project;
    this.data;

    this.flipside = new Flipside(
        process.env.SHROOM_API_KEY,
        "https://node-api.flipsidecrypto.com"
    );

    this.available = [{
        name: 'ethereum',
        dimensions: ['Unique users', 'Volume']
    },{
        name: 'optimism',
        dimensions: ['Transactions']
    },{
        name: 'arbitrum',
        dimensions: ['Transactions']
    },{
        name: 'polygon',
        dimensions: ['Transactions']
    }];

    this.getChains = function(){
        return this.available;
    }
    
    this.getTransactions = async function(from, to){

        switch (this.chosen) {
            case 'optimism':
                var data = await this.flipside.query.run({
                    sql: `SELECT		
                    DATE_TRUNC('day', block_timestamp) AS date, status, COUNT(tx_hash) AS txn_count
                        FROM		
                        optimism.core.fact_transactions
                        WHERE 		
                        status = 'SUCCESS' AND
                        block_timestamp >= '2022-01-01'
                        GROUP BY 	1, 2
                        order by 1 asc`,
                    ttlMinutes: 10
                });
                var finished = {
                    columns: ["blockchain", "date", "transactions"],
                    rows: [],
                };
        
                for (let i = 0; i <  data.rows.length; i++) {
                    let el =  data.rows[i];
                    //console.log(el)
                    let inUnix = this.convertToUnix(el[0]);
                    if(inUnix > from && inUnix < to){
                        //console.log("Pushed into finished array: " + el[1] + '/' + el[0] + '/' + el[4])
                        finished.rows.push([this.chosen, el[0], el[2]])
                    }            
                }
                return finished;
            case 'polygon':
                var data = await this.flipside.query.run({
                    sql: `SELECT		
                    DATE_TRUNC('day', block_timestamp) AS date, status, COUNT(tx_hash) AS txn_count
                        FROM		
                        polygon.core.fact_transactions
                        WHERE 		
                        status = 'SUCCESS' AND
                        block_timestamp >= '2022-01-01'
                        GROUP BY 	1, 2
                        order by 1 asc`,
                    ttlMinutes: 10
                });
                var finished = {
                    columns: ["blockchain", "date", "transactions"],
                    rows: [],
                };
        
                for (let i = 0; i <  data.rows.length; i++) {
                    let el =  data.rows[i];
                    //console.log(el)
                    let inUnix = this.convertToUnix(el[0]);
                    if(inUnix > from && inUnix < to){
                        //console.log("Pushed into finished array: " + el[1] + '/' + el[0] + '/' + el[4])
                        finished.rows.push([this.chosen, el[0], el[2]])
                    }            
                }
                return finished;
            case 'arbitrum':
                var data = await this.flipside.query.run({
                    sql: `SELECT		
                    DATE_TRUNC('day', block_timestamp) AS date, status, COUNT(tx_hash) AS txn_count
                        FROM		
                        arbitrum.core.fact_transactions
                        WHERE 		
                        status = 'SUCCESS' AND
                        block_timestamp >= '2022-01-01'
                        GROUP BY 	1, 2
                        order by 1 asc`,
                    ttlMinutes: 10
                });
                var finished = {
                    columns: ["blockchain", "date", "transactions"],
                    rows: [],
                };
        
                for (let i = 0; i <  data.rows.length; i++) {
                    let el =  data.rows[i];
                    //console.log(el)
                    let inUnix = this.convertToUnix(el[0]);
                    if(inUnix > from && inUnix < to){
                        //console.log("Pushed into finished array: " + el[1] + '/' + el[0] + '/' + el[4])
                        finished.rows.push([this.chosen, el[0], el[2]])
                    }            
                }
                return finished;
        }
       
      
    }
    

    this.getContractAddress = function(){
        let addr = ''
        for (let i = 0; i < this.available.length; i++) {
            let el = this.available[i];
            if(el.name == this.chosen){
                addr = el.contract
            }
        }
        return addr
    }

    this.getData = async function(){
        let data = await this.flipside.query.run({
            sql: `select
                    block_timestamp::date as date,
                       'Ethereum' as blockchain,
                     count(DISTINCT BUYER_ADDRESS) as unique_buyer , 
                     sum(unique_buyer) over (order by date asc) as cum_user, 
                     sum(PRICE_USD) as volume,
                     sum(volume) over (order by date) as cum_volume
                   from ethereum.core.ez_nft_sales
                   where block_timestamp::date >= '2022-01-01'
                   group by 1
                   order by 1 asc`,           
            ttlMinutes: 10,
        });
        return data;
    }

    this.getChains = function(){
        return this.available;
    }

    this.getUniqueUsers = async function(from,to){
        let data = await this.flipside.query.run({
            sql: `select
                    block_timestamp::date as date,
                       'Ethereum' as blockchain,
                     count(DISTINCT BUYER_ADDRESS) as unique_buyer , 
                     sum(unique_buyer) over (order by date asc) as cum_user, 
                     sum(PRICE_USD) as volume,
                     sum(volume) over (order by date) as cum_volume
                   from ethereum.core.ez_nft_sales
                   where block_timestamp::date >= '2022-01-01'
                   group by 1
                   order by 1 asc`,           
            ttlMinutes: 10,
        });
        let finished = {
            columns: ["blockchain", "date", "unique users"],
            rows: [],
        };

        for (let i = 0; i <  data.rows.length; i++) {
            let el =  data.rows[i];
            //console.log(el)
            let inUnix = this.convertToUnix(el[0]);
            if(inUnix > from && inUnix < to){
                //console.log("Pushed into finished array: " + el[1] + '/' + el[0] + '/' + el[4])
                finished.rows.push([el[1], el[0], el[2]])
            }            
        }
        return finished;
    }

    this.getVolume = async function(from, to){
        let data = await this.flipside.query.run({
            sql: `select
                    block_timestamp::date as date,
                       'Ethereum' as blockchain,
                     count(DISTINCT BUYER_ADDRESS) as unique_buyer , 
                     sum(unique_buyer) over (order by date asc) as cum_user, 
                     sum(PRICE_USD) as volume,
                     sum(volume) over (order by date) as cum_volume
                   from ethereum.core.ez_nft_sales
                   where block_timestamp::date >= '2022-01-01'
                   group by 1
                   order by 1 asc`,           
            ttlMinutes: 10,
        });
        let finished = {
            columns: ["blockchain", "date", "volume"],
            rows: [],
        };

        for (let i = 0; i <  data.rows.length; i++) {
            let el =  data.rows[i];
            //console.log(el)
            let inUnix = this.convertToUnix(el[0]);
            if(inUnix > from && inUnix < to){
                //console.log("Pushed into finished array: " + el[1] + '/' + el[0] + '/' + el[4])
                finished.rows.push([el[1], el[0], el[4]])
            }            
        }
        return finished;
    }


    this.convertToUnix = function(date){
        let newDate = parseInt((new Date(date).getTime() / 1000).toFixed(0));
        //console.log(date + ' becomes ' + newDate)
        return newDate;
    }

}