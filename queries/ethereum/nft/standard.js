let q = `
    select
        DATE_TRUNC('day', block_timestamp) AS date,
        {column}
    from
        ethereum.core.ez_nft_sales
    where
        platform_name = '{name}'
        and block_timestamp >= '2022-01-01'
        and PRICE_USD is not null
    group by
        1
    order by
        1
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