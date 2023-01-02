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
        dimensions: ['Buyers', 'Sellers']
    },{
        name: 'opensea',
        dimensions: ['Buyers', 'Sellers']
    },{
        name: 'x2y2',
        dimensions: ['Buyers', 'Sellers']
    }]    

    this.getProtocols = function(){
        return this.available;
    }

    this.getBuyers = async function(from, to){
        switch (this.chosen) {
            case 'blur':
                var data = await this.flipside.query.run({
                    sql: `select
                            block_timestamp::date as day,
                            count(distinct buyer_address)
                        from
                            ethereum.core.ez_nft_sales
                        where
                            platform_name = 'blur'
                            and PRICE_USD is not null
                        group by
                            1
                        order by
                            1`,
                    ttlMinutes: 10
                });
                var finished = {
                    columns: ["blockchain", "date", "buyers"],
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
            case 'opensea':
                var data = await this.flipside.query.run({
                    sql: `select
                            block_timestamp::date as day,
                            count(distinct buyer_address)
                        from
                            ethereum.core.ez_nft_sales
                        where
                            platform_name = 'opensea'
                            and PRICE_USD is not null
                        group by
                            1
                        order by
                            1`,
                    ttlMinutes: 10
                });
                var finished = {
                    columns: ["blockchain", "date", "buyers"],
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
            case 'x2y2':
                var data = await this.flipside.query.run({
                    sql: `select
                            block_timestamp::date as day,
                            count(distinct buyer_address)
                        from
                            ethereum.core.ez_nft_sales
                        where
                            platform_name = 'x2y2'
                            and PRICE_USD is not null
                        group by
                            1
                        order by
                            1`,
                    ttlMinutes: 10
                });
                var finished = {
                    columns: ["blockchain", "date", "buyers"],
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

    this.getSellers = async function(from, to){
        switch (this.chosen) {
            case 'blur':
                var data = await this.flipside.query.run({
                    sql: `select
                            block_timestamp::date as day,
                            count(distinct seller_address)
                        from
                            ethereum.core.ez_nft_sales
                        where
                            platform_name = 'blur'
                            and PRICE_USD is not null
                        group by
                            1
                        order by
                            1`,
                    ttlMinutes: 10
                });
                var finished = {
                    columns: ["blockchain", "date", "buyers"],
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
            case 'opensea':
                var data = await this.flipside.query.run({
                    sql: `select
                            block_timestamp::date as day,
                            count(distinct seller_address)
                        from
                            ethereum.core.ez_nft_sales
                        where
                            platform_name = 'opensea'
                            and PRICE_USD is not null
                        group by
                            1
                        order by
                            1`,
                    ttlMinutes: 10
                });
                var finished = {
                    columns: ["blockchain", "date", "buyers"],
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
            case 'x2y2':
                var data = await this.flipside.query.run({
                    sql: `select
                            block_timestamp::date as day,
                            count(distinct seller_address)
                        from
                            ethereum.core.ez_nft_sales
                        where
                            platform_name = 'x2y2'
                            and PRICE_USD is not null
                        group by
                            1
                        order by
                            1`,
                    ttlMinutes: 10
                });
                var finished = {
                    columns: ["blockchain", "date", "buyers"],
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
    
}