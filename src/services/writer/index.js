const {createObjectCsvWriter} = require("csv-writer");
const path = require('path');
const createCsvOutputWriters = (config, root) => {
    const balanceCsvWriter = createObjectCsvWriter({
        path: path.join(root + `/${config.prefix}_token_balances_from_${config.blockStart}_to_${config.blockStop}${config.writeDate ? `_on_${config.runtime}` : ''}.csv`),
        header: [{id: 'wallet', title: 'wallet'}, {id: 'balance', title: 'balance'}],
        alwaysQuote: false,
        append: true
    })

    const observedAccountsCsvWriter = createObjectCsvWriter({
        path: path.join(root + `/${config.prefix}_observed_accounts_from_${config.blockStart}_to_${config.blockStop}${config.writeDate ? `_on_${config.runtime}` : ''}.csv`),
        header: [{id: 'wallet', title: 'wallet'}],
        alwaysQuote: false,
        append: true
    })

    return {
        writeBalance: async (wallet_address, balance_amount) => {
            let row = [{wallet: wallet_address, balance: balance_amount}];
            await balanceCsvWriter.writeRecords(row);
        },
        writeAccount: async (wallet_address) => {
            let row =[{wallet: wallet_address}];
            await observedAccountsCsvWriter.writeRecords(row)
        },
        writeBalances: async (balances) => {
            const balancesArray = [...balances];
            for (const [wallet, balance] of balancesArray) {
                let row = [{wallet, balance}];
                await balanceCsvWriter.writeRecords(row);
            }
        },
        writeAccounts: async (wallets) => {
            const walletsArray = [...wallets];
            for (const wallet of walletsArray) {
                let row =[{wallet}];
                await observedAccountsCsvWriter.writeRecords(row);
            }
        }
    }

}

module.exports = {
    createCsvOutputWriters
}
