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
    switch(dimension){
        case 'buyers':
            column = 'count(distinct buyer_address) as buyers'
            break;
        case 'sellers':
            column = 'count(distinct seller_address) as sellers'
            break;
        case 'sales':
            column = 'count(Distinct tx_hash) as sales'
            break;
        case 'volume':
            column = 'ROUND(sum(PRICE_USD)) as volume'
            break;
        case 'royalties':
            column = 'Round(Sum(creator_fee_usd)) as royalties';
            break;
        case 'revenue':
            column = 'sum(platform_fee_usd) as revenue';
            break;
        case 'pfratio':
            column = 'sum(platform_fee_usd) as revenue';
            break;
        case 'earnings':
            column = 'sum(platform_fee_usd) as earnings';
            break;
    }
    z = q.replace('{column}', column)
    return z.replace('{name}', name)
}