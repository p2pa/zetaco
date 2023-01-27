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
    let z = q.replace('{circSupply}', circSupply)
    z = z.replace('{ticker}', ticker)
    return z
}