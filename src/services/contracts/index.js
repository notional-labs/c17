const BigNumber = require("bignumber.js");
const { splitBlockSequenceIntoQueues } = require("../queues");
const {union} = require("../../util");

function getTokenContract(abi, tokenAddress, web3, defaultBlock, transactionConfirmationBlocks= 1) {
    web3.eth.defaultBlock = defaultBlock;
    const tokenContract = new web3.eth.Contract(abi, tokenAddress, {
        transactionConfirmationBlocks
    })
    return tokenContract;
}

async function collectTokenTransactors(config, logger, getContract, processor) {
    const blockEnd = Math.max(config.blockStart + 1, config.blockStop);
    const data = Array.from(
        { length: blockEnd - config.blockStart },
        (_, index) => index + config.blockStart
    );
    const blockQueues = splitBlockSequenceIntoQueues(data, config.numberOfQueues);
    // processed blocks will be a list of Set, with each Set being account addresses
    const processedBlocks = await Promise.all(
        config.clients.map((web3Client, index) => {
            const blocks = blockQueues[index];
            const tokenContract = getContract(
                config.abi,
                config.tokenAddress,
                web3Client,
                blocks[0]
            );
            return processor(blocks, tokenContract);
        })
    );
    const allAccountAddresses = union(...processedBlocks);
    return allAccountAddresses;
}


async function getBalancesOfAccountSet(tokenContract, accountSet) {
    const accountToBalanceMap = new Map();
    for (const wallet of accountSet) {
        await new Promise((r) => setTimeout(r, 10));
        let trail = 0;
        let promise = new Promise(async function () {
            while (true) {
                try {
                    trail++;
                    let balance = new BigNumber(
                        await tokenContract.methods.balanceOf(wallet).call({})
                    );
                    console.log(wallet + " ( " + balance.toFixed() + " )");
                    accountToBalanceMap.set(wallet, balance);
                    break;
                } catch (error) {
                    console.log(
                        "error---------------------------------------------------" + trail
                    );
                    if (trail == 5) {
                        break;
                    }
                }
            }
        });
        promise.then();
    }
    const sortedAccountToBalanceMap = new Map(
        [...accountToBalanceMap.entries()].sort()
    );
    return sortedAccountToBalanceMap;
}


module.exports = {
    collectTokenTransactors,
    getBalancesOfAccountSet,
    getTokenContract
}
