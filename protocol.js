const dotenv = require('dotenv');
dotenv.config();

// coingecko
const CoinGecko = require('coingecko-api');


// flipside
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

    this.coingecko = new CoinGecko();

    this.available = [{
        name: 'blur',
        dimensions: ['Buyers', 'Sellers', 'Sales count', 'Sales', 'Royalties', 'Users'],
        category: 'NFT',
    },{
        name: 'opensea',
        dimensions: ['Buyers', 'Sellers', 'Sales count', 'Sales', 'Royalties', 'Revenue', 'Earnings', 'Users'],
        category: 'NFT'
    },{
        name: 'x2y2',
        ticker: 'x2y2',
        dimensions: ['Buyers', 'Sellers', 'Sales count', 'Sales', 'Royalties', 'Revenue', 'PF Ratio', 'Users'],
        category: 'NFT',
    },{
        name: 'looksrare',
        ticker: 'looksrare',
        dimensions: ['Buyers', 'Sellers', 'Sales count', 'Sales', 'Royalties', 'Revenue', 'PF Ratio', 'Users'],
        category: 'NFT',
    },{
        name: 'lido',
        contract: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        dimensions: ['ETH deposited', 'Transactions', 'Withdrawal count'],
        category: 'Staking'
    },{
        name: 'rocketpool',
        contract: '0xae78736Cd615f374D3085123A210448E74Fc6393',
        dimensions: ['ETH deposited', 'Transactions', 'Withdrawal count'],
        category: 'Staking'
    },{
        name: 'stakewise',
        contract: '0xFe2e637202056d30016725477c5da089Ab0A043A',
        dimensions: ['ETH deposited', 'Transactions', 'Withdrawal count'],
        category: 'Staking'
    }]    

    this.getProtocols = function(){
        return this.available.sort((a, b) => a.name.localeCompare(b.name))   
    }
    
    this.getData = async function(from, to, dimension){
        let column = ''
        let data = null;
        let alreadyRun = false;

        // check category
        let availableIndex = this.available.map(e => e.name).indexOf(this.chosen);
        let category = this.available[availableIndex].category;
        let contract = this.available[availableIndex].contract;
        let ticker = this.available[availableIndex].ticker;

        switch (category) {
            case 'NFT Exchange':
                switch (dimension) {
                    case 'buyers':
                        column = 'count(distinct buyer_address) as buyers';                
                        break;        
                    case 'sellers':
                        column = 'count(distinct seller_address) as sellers';
                        break;
                    case 'salescount':
                        column = 'count(Distinct tx_hash) as sales_count';
                        break;
                    case 'sales':
                        column = 'ROUND(sum(PRICE_USD)) as sales';
                        break;
                    case 'royalties':
                        column = 'Round(Sum(creator_fee_usd)) as royalties';
                        break;
                    case 'revenue':
                        column = `sum(platform_fee_usd) as revenue`;
                        break;
                    case 'pfratio':
                        column = `sum(platform_fee_usd) as revenue`;
                        break;
                    case 'earnings':
                        column = 'sum(platform_fee_usd) as earnings';
                        break;
                    case 'users':
                        alreadyRun = true;
                        data = await this.flipside.query.run({
                            sql: `SELECT
                                    day,
                                    count(distinct addresses) AS users
                                FROM
                                    (
                                    SELECT
                                        block_timestamp::Date as day,
                                        buyer_address as addresses
                                    FROM
                                        ethereum.core.ez_nft_sales
                                    WHERE
                                        platform_name = '${this.chosen}'
                                        and price_usd > 0
                                    UNION ALL
                                    SELECT
                                        block_timestamp::Date as day,
                                        seller_address as addresses
                                    FROM
                                        ethereum.core.ez_nft_sales
                                    WHERE
                                        platform_name = '${this.chosen}'
                                        and price_usd > 0
                                    )
                                GROUP BY
                                    1
                                ORDER BY
                                    1`,
                            ttlMinutes: 10
                        });
                        break;
                }        
                if(!alreadyRun){
                    data = await this.flipside.query.run({
                        sql: `select
                                DATE_TRUNC('day', block_timestamp) AS date,
                                ${column}
                            from
                                ethereum.core.ez_nft_sales
                            where
                                platform_name = '${this.chosen}'
                                and block_timestamp >= '2022-01-01'
                                and PRICE_USD is not null
                            group by
                                1
                            order by
                                1`,
                        ttlMinutes: 10
                    });
                }        
                break;
            case 'Liquid Staking Derivatives':
                switch (dimension) {
                    case 'ethdeposited':
                        column = 'sum(amount) as stake_volume';                
                        break; 
                    case 'transactions':
                        column = 'count(distinct tx_hash) as transactions';
                        break;
                    case 'withdrawalcount':
                        column = 'count(distinct origin_to_address) as withdrawal_count';
                        break;
                }
        
                if(!alreadyRun){
                    data = await this.flipside.query.run({
                        sql: `select
                                DATE_TRUNC('day', block_timestamp) AS date,
                                ${column}
                                from
                                    ethereum.core.ez_token_transfers
                                where                                    
                                    block_timestamp >= '2022-01-01'
                                    AND contract_address = lower('${contract}') 
                                    AND from_address = '0x0000000000000000000000000000000000000000'
                                group by
                                    1
                                order by
                                    1`,
                        ttlMinutes: 10
                    });
                }        
                break;
        }       

        var finished = {
            columns: ["blockchain", "date", dimension],
            rows: [],
        };      
        
        let res = await this.coingecko.coins.fetchMarketChart(ticker);        
        if(res.error){
            console.log(res.error)
        }
        let marketcap = res.data.market_caps[0][1]

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
                //console.log("Pushed into finished array: " + el[1] + '/' + el[0] + '/' + el[4])
                if(dimension == 'pfratio'){
                    // annualized revenue  / market cap                                        
                    let pf = marketcap / (el[1] * 365);
                    finished.rows.push([this.chosen, el[0], pf])
                } else {
                    finished.rows.push([this.chosen, el[0], el[1]])
                }
            }            
        }
        // console.log("Length before data incompletion: " + data.rows.length)
        // console.log("Finished rows length is now: " + finished.rows.length)
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