let q = `
SELECT
    trunc(block_timestamp, 'day') as date,    
    sum(amount_out) as withdrawed
FROM
    ethereum.core.ez_dex_swaps
where
    block_timestamp >= '2022-01-01'
    AND symbol_out like '%{symbol_out}%'
GROUP BY
    date
ORDER BY
    date
    `

module.exports = function(name){
    let symbol_out = ''
    switch (name) {
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
    z = q.replace('{symbol_out}', symbol_out)
    return z
}