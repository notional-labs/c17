const { union } = require("../util");
const {
  getBalancesOfAccountSet,
  collectTokenTransactors,
} = require("./contracts");

function printStartupHeader(logger, config) {
  logger.log(
    "******************************************************************************"
  );
  logger.log(
    "START Process Binance scan success transactions service at " +
      new Date().toISOString()
  );
  logger.log("Block start: " + config.blockStart);
  const blockEnd = Math.max(config.blockStart + 1, config.blockStop);
  logger.log("Block stop: " + blockEnd);
  logger.log("Number of queues: " + config.numberOfQueues);
}

function printProcessEnd(logger, config) {
  logger.log(
    "******************************************************************************"
  );
  logger.log(
    "FINISHED Getting account balances at " + new Date().toISOString()
  );
  logger.log("Block start: " + config.blockStart);
  const blockEnd = Math.max(config.blockStart + 1, config.blockStop);
  logger.log("Block stop: " + blockEnd);
}

/**
 * Entry point
 * @param config a config object with shape like that in src/configs/index.js
 * @param logger a logger. you can pass in the console.
 * @param writers a writers object. Will be refactored for better options later.
 * @param getContract a function that returns a token contract, see interface in /src/srvices/contracts/index.js
 * @returns {Promise<void>} // will be refactored to return stats object.
 */
async function buildAddressBalanceList({
  config,
  logger,
  writers,
  getContract,
  proccessBlockSequence,
}) {
  printStartupHeader(logger, config);
  // 1. Load known accounts.
  const initialKnownAccounts = config.accounts;
  const bannedAccounts = config.banned;
  // 2. Scan for token transactions for the contract.
  const tokenUsingAccounts = await collectTokenTransactors(
    config,
    logger,
    getContract,
    proccessBlockSequence
  );
  // 3. Write discovered accounts who interacted with token contract to storage.
  await writers.writeAccounts(tokenUsingAccounts);
  // 4. Create a union of pre-known accounts and the discovered accounts.
  const allKnownAccounts = union(
    new Set(initialKnownAccounts),
    tokenUsingAccounts
  );
  // 5. Filter out banned accounts
  const validAccounts = new Set(
    [...allKnownAccounts].filter((account) => !bannedAccounts.has(account))
  );
  // 6. Check balances at end block for every known account.
  const tokenContractAtEndBlock = getContract(
    config.abi,
    config.tokenAddress,
    config.clients[0],
    config.blockStop
  );
  // 7. Collect token contract balances at the configured endblock.
  const balances = await getBalancesOfAccountSet(
    tokenContractAtEndBlock,
    validAccounts
  );
  // 8. Write balances to storage.
  const sortedBalances = [...balances].sort((a, b) => a.wallet > b.wallet);
  await writers.writeBalances(sortedBalances);
  // 9. Done.
  printProcessEnd(logger, config);
}

module.exports = buildAddressBalanceList;
