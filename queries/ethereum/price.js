let q = `
select
    hour::date as date,
    avg(price) as price
from
    ethereum.core.fact_hourly_token_prices
where
    date >= '2022-01-01'
    AND symbol = '{ticker}'
group by
    date
order by
    date
`

module.exports = function(ticker){
    let z = q.replace('{ticker}', ticker)
    return z
}