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
    this.prefix = "ethereum."    
    this.chosen = project;
    this.flipside = new Flipside(
        process.env.SHROOM_API_KEY,
        "https://node-api.flipsidecrypto.com"
    );
    
    this.available = [{
        name: 'ethereum',
        dimensions: ['Unique users', 'Volume']
    }]

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

    this.getUniqueUsers = async function(){        
        if(this.chosen == 'ethereum'){
            let query = {
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
               order by 1 desc`,           
                ttlMinutes: 10,
            };
            
            let result = await this.flipside.query.run(query);

            // error handling
            if(result.error !== null){
                console.warn(result.error)
            }

            return result
        } else {
             // get address for chosen
            let address = this.getContractAddress()

            // Create a query object for the `query.run` function to execute
            let query = {
                sql: `with main_stats AS (select 
                    distinct TX_HASH AS TX,
                    BLOCK_TIMESTAMP,
                    ORIGIN_FROM_ADDRESS AS depositer
                    from ethereum.core.fact_event_logs
                    where ORIGIN_TO_ADDRESS='${address}')
                select 
                Date(BLOCK_TIMESTAMP) AS DAY,
                count(distinct depositer) AS "unique users",
                    count(TX) AS "number of TX"
                from main_stats
                group by 1 `,           
                ttlMinutes: 10,
            };
            
            let result = await this.flipside.query.run(query);

            // error handling
            if(result.error !== null){
                console.warn(result.error)
            }

            return result
        }       
    }
}