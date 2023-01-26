let q = `
SELECT
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
    platform_name = '{name}'
    and price_usd > 0
UNION ALL
SELECT
    block_timestamp::Date as day,
    seller_address as addresses
FROM
    ethereum.core.ez_nft_sales
WHERE
    platform_name = '{name}'
    and price_usd > 0
)
GROUP BY
1
ORDER BY
1`

module.exports = function(name){
    return q.replace('{name}', name)
}