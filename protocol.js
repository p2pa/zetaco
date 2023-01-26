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
        let alreadyRun = false;

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
                        data = await this.query(require('./queries/ethereum/nft/price.js')(ticker));                        
                        break;
                    case 'fdmc':
                        data = await this.query(require('./queries/ethereum/nft/fdmc.js')(max_supply, ticker));                        
                        break;
                    case 'mc':
                        let res = await this.coingecko.coins.fetch(cg_id, { market_data: true, community_data: false, developer_data: false, localization: false, sparkline: false });                            
                        data = await this.query(require('./queries/ethereum/nft/mc.js')(res.data.market_data.circulating_supply, ticker));  
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
            case 'DEX':
                switch (dimension) {
                    case 'transactions':
                        column = 'count(distinct tx_hash) as transactions';
                        break;
                    case 'volume':
                        alreadyRun = true;
                        data = await this.flipside.query.run({
                            sql: `with token_prices_table as (
                                select 
                                hour::date as date,
                                symbol,
                                decimals,
                                avg(price) as price
                                from ethereum.core.fact_hourly_token_prices
                                where (symbol in ('USDC','MIM','LINK','USDT','WETH','WBTC','DAI','FRAX')
                                  or token_address in ('0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'))
                                group by date,symbol,decimals
                                ),
                                gains_table as (
                                select 
                                block_timestamp::date as date ,
                                sum (event_inputs:value/pow(10,18)) as volume
                                from polygon.core.fact_event_logs
                                where origin_to_address in (lower('0xd8d177efc926a18ee455da6f5f6a6cfcee5f8f58'),lower('0x65187fec6ecc4774c1f632c7503466d5b4353db1'),lower('0xf8a140db8b05bec52c7e86d0d40d72f8e54fe559'))
                                and event_name = 'Transfer'
                                and event_inputs:from = origin_from_address
                                and contract_address like lower('0x8f3cf7ad23cd3cadbd9735aff958023239c6a063')
                                and tx_status like 'SUCCESS'
                                and date >=CURRENT_DATE - 90
                                group by date
                                order by date
                                )
                                select * from gains_table`,
                            ttlMinutes: 10
                        });
                        break;    
                    case 'users':
                        alreadyRun = true;
                        data = await this.flipside.query.run({
                            sql: `
                                    with
                                    token_prices_table as (
                                    select
                                        hour::date as date,
                                        symbol,
                                        decimals,
                                        avg(price) as price
                                    from
                                        ethereum.core.fact_hourly_token_prices
                                    where
                                        (
                                        symbol in (
                                            'USDC',
                                            'MIM',
                                            'LINK',
                                            'USDT',
                                            'WETH',
                                            'WBTC',
                                            'DAI',
                                            'FRAX'
                                        )
                                        or token_address in ('0x1f9840a85d5af5bf1d1762f925bdaddc4201f984')
                                        )
                                    group by
                                        date,
                                        symbol,
                                        decimals
                                    ),
                                    gmx_table1 as (
                                    select
                                        block_timestamp,
                                        tx_hash,
                                        origin_from_address,
                                        event_inputs:value as amount,
                                        case
                                        when contract_address = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8' then 'USDC'
                                        when contract_address = '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a' then 'MIM'
                                        when contract_address = '0xf97f4df75117a78c1a5a0dbb814af92458539fb4' then 'LINK'
                                        when contract_address = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1' then 'WETH'
                                        when contract_address = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f' then 'WBTC'
                                        when contract_address = '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0' then 'UNI'
                                        when contract_address = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1' then 'DAI'
                                        when contract_address = '0x17fc002b466eec40dae837fc4be5c67993ddbd6f' then 'FRAX'
                                        when contract_address = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9' then 'USDT'
                                        else contract_address
                                        end as token_symbol
                                    from
                                        arbitrum.core.fact_event_logs
                                    where
                                        origin_to_address in (
                                        lower('0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064'),
                                        lower('0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868'),
                                        lower('0x3D6bA331e3D9702C5e8A8d254e5d8a285F223aba')
                                        )
                                        and tx_status = 'SUCCESS'
                                        and event_name = 'Transfer'
                                        and event_inputs:value is not null
                                    ),
                                    gmx_table2 as (
                                    select
                                        gmx.*,
                                        (gmx.amount / pow(10, p.decimals)) * p.price as usd_amount
                                    from
                                        gmx_table1 gmx
                                        join token_prices_table p on gmx.block_timestamp::date = p.date
                                        and gmx.token_symbol = p.symbol
                                    where
                                        usd_amount > 1
                                    ),
                                    gmx_table3 as (
                                    select
                                        block_timestamp::date as date,
                                        count(DISTINCT origin_from_address) as users
                                    from
                                        gmx_table2
                                    where
                                        date >= CURRENT_DATE -90
                                    group by
                                        date
                                    order by
                                        date
                                    )
                                select
                                    *
                                from
                                    gmx_table3
                            `,
                            ttlMinutes: 10
                        });
                        break; 
                    case 'newusers':
                        alreadyRun = true;
                        data = await this.flipside.query.run({
                            sql: `
                                with
                                gmx_table1 as (
                                select
                                    min(block_timestamp::date) as min_date,
                                    origin_from_address
                                from
                                    arbitrum.core.fact_event_logs
                                where
                                    origin_to_address in (
                                    lower('0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064'),
                                    lower('0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868'),
                                    lower('0x3D6bA331e3D9702C5e8A8d254e5d8a285F223aba')
                                    )
                                    and tx_status = 'SUCCESS'
                                    and event_name = 'Transfer'
                                    and event_inputs:value is not null
                                group by
                                    origin_from_address
                                )
                            select
                                min_date,
                                count(origin_from_address) as new_users
                            from
                                gmx_table1
                            group by
                                1
                            order by
                                1
                            `,
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
                                    ${chain}.core.fact_event_logs
                                where
                                    contract_address = lower('${contract}')
                                    and block_timestamp >= '2022-01-01'  
                                    and event_name = 'Transfer'
                                    and tx_status = 'SUCCESS'
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