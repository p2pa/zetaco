let q = `
select
    hour::date as date,
    avg(price) * {max_supply} as price
from
    ethereum.core.fact_hourly_token_prices
where
    date >= '2022-01-01'
    AND symbol = '{ticker}'
group by
    date
order by
    date`

module.exports = function(max_supply, ticker){
    q = q.replace('{max_supply}', max_supply)
    return q.replace('{ticker}', ticker)
}