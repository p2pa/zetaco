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

    this.flipside = new Flipside(
        process.env.SHROOM_API_KEY,
        "https://node-api.flipsidecrypto.com"
    );

    this.available = [{
        name: 'blur',
        dimensions: ['Buyers', 'Sellers', 'Sales count']
    },{
        name: 'opensea',
        dimensions: ['Buyers', 'Sellers', 'Sales count']
    },{
        name: 'x2y2',
        dimensions: ['Buyers', 'Sellers', 'Sales count']
    }]    

    this.getProtocols = function(){
        return this.available;
    }
    
    this.getData = async function(from, to, protocol, dimension){
        if(dimension == 'buyer' || dimension == 'seller'){
            var data = await this.flipside.query.run({
                sql: `select
                        DATE_TRUNC('day', block_timestamp) AS date,
                        count(distinct ${dimension == 'buyers' ? 'buyer_address' : dimension == 'sellers' ? 'seller_address' : ''})
                    from
                        ethereum.core.ez_nft_sales
                    where
                        platform_name = '${protocol}'
                        and block_timestamp >= '2022-01-01'
                        and PRICE_USD is not null
                    group by
                        1
                    order by
                        1`,
                ttlMinutes: 10
            });
    
            var finished = {
                columns: ["blockchain", "date", dimension],
                rows: [],
            };
    
            for (let i = 0; i <  data.rows.length; i++) {
                let el =  data.rows[i];
                //console.log(el)
                let inUnix = this.convertToUnix(el[0]);
                if(inUnix > from && inUnix < to){
                    //console.log("Pushed into finished array: " + el[1] + '/' + el[0] + '/' + el[4])
                    finished.rows.push([this.chosen, el[0], el[1]])
                }            
            }
            return finished; 
        }    
        if(dimension == 'sales'){
            var data = await this.flipside.query.run({
                sql: `select
                        DATE_TRUNC('day', block_timestamp) AS date,
                        count(Distinct tx_hash) as sales
                    from
                        ethereum.core.ez_nft_sales
                    where
                        platform_name = '${protocol}'
                        and date >= '2022-01-01'
                    group by
                        1
                    order by
                        1`,
                ttlMinutes: 10
            });
    
            var finished = {
                columns: ["blockchain", "date", dimension],
                rows: [],
            };
    
            for (let i = 0; i <  data.rows.length; i++) {
                let el =  data.rows[i];
                //console.log(el)
                let inUnix = this.convertToUnix(el[0]);
                if(inUnix > from && inUnix < to){
                    //console.log("Pushed into finished array: " + el[1] + '/' + el[0] + '/' + el[4])
                    finished.rows.push([this.chosen, el[0], el[1]])
                }            
            }
            return finished; 
        }    
    }

    this.getBuyers = async function(from, to){
        return this.getData(from, to, this.chosen, 'buyers');        
    }

    this.getSellers = async function(from, to){
        return this.getData(from, to, this.chosen, 'sellers');        
    }

    this.getSales = async function(from, to){
        return this.getData(from, to, this.chosen, 'sales');        
    }
    
    this.convertToUnix = function(date){
        let newDate = parseInt((new Date(date).getTime() / 1000).toFixed(0));
        //console.log(date + ' becomes ' + newDate)
        return newDate;
    }
}