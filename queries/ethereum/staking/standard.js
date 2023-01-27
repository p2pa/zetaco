let q = `
    select
    DATE_TRUNC('day', block_timestamp) AS date,
    {column}
    from
        ethereum.core.ez_token_transfers
    where                                    
        block_timestamp >= '2022-01-01'
        AND contract_address = lower('{contract}') 
        AND from_address = '0x0000000000000000000000000000000000000000'
    group by
        1
    order by
        1
    `

module.exports = function(dimension, contract){
    switch(dimension){
        case 'deposited':
            column = 'sum(amount) as deposited';                
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
    z = q.replace('{column}', column)
    return z.replace('{contract}', contract)
}