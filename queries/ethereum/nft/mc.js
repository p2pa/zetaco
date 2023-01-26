let q = `
select
hour::date as date,
avg(price) * {circSupply} as price
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

module.exports = function(circSupply, ticker){
    q = q.replace('{circSupply}', circSupply)
    return q.replace('{ticker}', ticker)
}