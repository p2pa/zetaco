let q = `
SELECT 
    DATE_TRUNC('day', block_timestamp) AS date,
    {column}
FROM 
    ethereum.core.ez_dex_swaps 
WHERE 
    platform IN ({platform})
    AND block_timestamp >= '2022-01-01'
    AND event_name = 'Swap'
GROUP BY 
1
ORDER BY
1;
    `

module.exports = function(dimension, name){
    let column = '';
    let platform = ''; 

    switch(dimension){
        case 'volume':
            column = 'ROUND(sum(AMOUNT_IN_USD)) as volume'
            break;        
        case 'transactions':
            column = 'count(distinct tx_hash) as transactions';
            break;
        case 'users':
            column = 'COUNT(DISTINCT origin_from_address) AS users'
            break;
    }

    switch(name){
        case 'uniswap':
            platform = "'uniswap-v2', 'uniswap-v3'"
            break;
        case 'sushiswap':
            platform = "'sushiswap'"
            break;
    }

    let z = q.replace('{column}', column)    
    z = z.replace('{platform}', platform)
    return z
}