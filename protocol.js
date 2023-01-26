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
        ticker: null,
        dimensions: ['Buyers', 'Sellers', 'Sales', 'Volume', 'Royalties', 'Users'],
        category: 'NFT',
    },{
        name: 'opensea',
        ticker: null,
        dimensions: ['Buyers', 'Sellers', 'Sales', 'Volume', 'Royalties', 'Revenue', 'Earnings', 'Users'],
        category: 'NFT'
    },{
        name: 'x2y2',
        ticker: 'X2Y2',
        cg_id: 'x2y2',
        max_supply: 1000000000,
        dimensions: ['Price', 'FDMC', 'MC', 'Buyers', 'Sellers', 'Sales', 'Volume', 'Royalties', 'Revenue', 'PF Ratio', 'Users'],
        category: 'NFT',
    },{
        name: 'looksrare',
        ticker: 'LOOKS',
        cg_id: 'looksrare',
        max_supply: 1000000000,
        dimensions: ['Price', 'FDMC', 'MC', 'Buyers', 'Sellers', 'Sales', 'Volume', 'Royalties', 'Revenue', 'PF Ratio', 'Users'],
        category: 'NFT',
    },{
        name: 'lido',
        ticker: 'LDO',
        cg_id: 'lido-dao',
        max_supply: 1000000000,
        contract: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        dimensions: ['Price', 'FDMC', 'MC', 'Deposited', 'Withdrawed', 'Transactions', 'Withdrawers', 'Depositors'],
        category: 'Staking'
    },{
        name: 'rocketpool',
        ticker: 'RPL',
        cg_id: 'rocket-pool',
        max_supply: 18970871,
        contract: '0xae78736Cd615f374D3085123A210448E74Fc6393',
        dimensions: ['Price', 'FDMC', 'MC', 'Deposited', 'Withdrawed', 'Transactions', 'Withdrawers', 'Depositors'],
        category: 'Staking'
    },{
        name: 'stakewise',
        ticker: 'SWISE',
        cg_id: 'stakewise',
        max_supply: 1000000000,
        contract: '0xFe2e637202056d30016725477c5da089Ab0A043A',
        dimensions: ['Price', 'FDMC', 'MC', 'Deposited', 'Withdrawed', 'Transactions', 'Withdrawers', 'Depositors'],
        category: 'Staking'
    },{
        name: 'ankr',
        ticker: 'ANKR',
        cg_id: 'ankr',
        max_supply: 10000000000,
        contract: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
        dimensions: ['Price', 'FDMC', 'MC', 'Deposited', 'Withdrawed', 'Transactions', 'Withdrawers', 'Depositors'],
        category: 'Staking'
    },{
        name: 'stafi',
        ticker: 'FIS',
        cg_id: 'stafi',
        max_supply: 114911733,
        contract: '0xef3a930e1ffffacd2fc13434ac81bd278b0ecc8d', 
        dimensions: ['Price', 'FDMC', 'MC', 'Deposited', 'Transactions', 'Withdrawers', 'Depositors'],
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
        let current = this.available[availableIndex];
        let category = current.category;
        let contract = current.contract;
        let ticker = current.ticker;
        let max_supply = current.max_supply;
        let cg_id = current.cg_id;

        switch (category) {
            case 'NFT':
                switch (dimension) {
                    case 'price':
                        alreadyRun = true;
                        data = await this.flipside.query.run({
                            sql: `select
                                    hour::date as date,
                                    avg(price) as price
                                from
                                    ethereum.core.fact_hourly_token_prices
                                where
                                    date >= '2022-01-01'
                                    AND symbol = '${ticker}'
                                group by
                                    date
                                order by
                                    date`,
                            ttlMinutes: 10
                        });
                        break;
                    case 'fdmc':
                        alreadyRun = true;
                        data = await this.flipside.query.run({
                            sql: `select
                                    hour::date as date,
                                    avg(price) * ${max_supply} as price
                                from
                                    ethereum.core.fact_hourly_token_prices
                                where
                                    date >= '2022-01-01'
                                    AND symbol = '${ticker}'
                                group by
                                    date
                                order by
                                    date`,
                            ttlMinutes: 10
                        });
                        break;
                    case 'mc':
                        alreadyRun = true;
                        let res = await this.coingecko.coins.fetch(cg_id, { market_data: true, community_data: false, developer_data: false, localization: false, sparkline: false });                            
                        if(res.error){
                            console.log(res.error)
                        }              
                        let circSupply = res.data.market_data.circulating_supply;                           
                        data = await this.flipside.query.run({
                            sql: `select
                                    hour::date as date,
                                    avg(price) * ${circSupply} as price
                                from
                                    ethereum.core.fact_hourly_token_prices
                                where
                                    date >= '2022-01-01'
                                    AND symbol = '${ticker}'
                                group by
                                    date
                                order by
                                    date`,
                            ttlMinutes: 10
                        });
                        break;
                    case 'buyers':
                        column = 'count(distinct buyer_address) as buyers';                
                        break;        
                    case 'sellers':
                        column = 'count(distinct seller_address) as sellers';
                        break;
                    case 'sales':
                        column = 'count(Distinct tx_hash) as sales';
                        break;
                    case 'volume':
                        column = 'ROUND(sum(PRICE_USD)) as volume';
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
            case 'Staking':
                switch (dimension) {
                    case 'price':
                        alreadyRun = true;
                        data = await this.flipside.query.run({
                            sql: `select
                                    hour::date as date,
                                    avg(price) as price
                                from
                                    ethereum.core.fact_hourly_token_prices
                                where
                                    date >= '2022-01-01'
                                    AND symbol = '${ticker}'
                                group by
                                    date
                                order by
                                    date`,
                            ttlMinutes: 10
                        });
                        break;
                    case 'fdmc':
                        alreadyRun = true;
                        data = await this.flipside.query.run({
                            sql: `select
                                    hour::date as date,
                                    avg(price) * ${max_supply} as price
                                from
                                    ethereum.core.fact_hourly_token_prices
                                where
                                    date >= '2022-01-01'
                                    AND symbol = '${ticker}'
                                group by
                                    date
                                order by
                                    date`,
                            ttlMinutes: 10
                        });
                        break;
                    case 'mc':
                        alreadyRun = true;
                        let res = await this.coingecko.coins.fetch(cg_id, { market_data: true, community_data: false, developer_data: false, localization: false, sparkline: false });                            
                        if(res.error){
                            console.log(res.error)
                        }              
                        let circSupply = res.data.market_data.circulating_supply;                           
                        data = await this.flipside.query.run({
                            sql: `select
                                    hour::date as date,
                                    avg(price) * ${circSupply} as price
                                from
                                    ethereum.core.fact_hourly_token_prices
                                where
                                    date >= '2022-01-01'
                                    AND symbol = '${ticker}'
                                group by
                                    date
                                order by
                                    date`,
                            ttlMinutes: 10
                        });
                        break;
                    case 'deposited':
                        column = 'sum(amount) as deposited';                
                        break; 
                    case 'withdrawed':
                        alreadyRun = true;
                        let symbol_out = '';
                        switch (this.chosen) {
                            case 'stakewise':
                                symbol_out = 'sETH2'
                                break;
                            case 'lido':
                                symbol_out = 'stETH'
                                break;
                            case 'rocketpool':
                                symbol_out = 'rETH'
                                break;
                            case 'ankr':
                                symbol_out = 'aETH'
                                break;
                            case 'cream':
                                symbol_out = 'crETH'
                                break;
                            case 'sharedstake':
                                symbol_out = 'vETH'
                                break;  
                        }

                        data = await this.flipside.query.run({
                            sql: `SELECT
                                        trunc(block_timestamp, 'day') as date,    
                                        sum(amount_out) as withdrawed
                                    FROM
                                        ethereum.core.ez_dex_swaps
                                    where
                                        block_timestamp >= '2022-01-01'
                                        AND symbol_out like '%${symbol_out}%'
                                    GROUP BY
                                        date
                                    ORDER BY
                                        date`,
                            ttlMinutes: 10
                        });
                        break;
                    case 'transactions':
                        column = 'count(distinct tx_hash) as transactions';
                        break;
                    case 'withdrawers':
                        column = 'count(distinct origin_to_address) as withdrawers';
                        break;
                    case 'depositors':
                        column = 'count(distinct origin_from_address) as depositors';
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