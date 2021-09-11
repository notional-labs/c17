const bscWeb3 = require("./blockchain/web3");

function buildConfiguration(
  { getBannedAccounts, getKnownAccounts, getAbi },
  config = process.env
) {
  if (!config.LIVE_NET) {
    throw new Error("Please specify LIVE_NET");
  }
  if (!config.BLOCK_START) {
    throw new Error("Please set BLOCK_START");
  }
  if (!(config.BLOCK_STOP || config.BLOCK_END)) {
    throw new Error("Please set BLOCK_START");
  }
  if (!config.STAKING_CONTRACT_ADDRESS) {
    throw new Error("Please set STAKING_CONTRACT_ADDRESS");
  }
  if (!config.TOKEN_CONTRACT_ADDRESS) {
    throw new Error("Please set TOKEN_CONTRACT_ADDRESS");
  }
  if (!config.WEB3) {
    throw new Error("Please set a web3 url in WEB3");
  }
  if (!config.OUTPUT_FILE) {
    console.log(
      "WARNING: specify output file.  Defaulting to wallet_output.csv"
    );
  }
  const prefix = config.TOKEN_NAME || "YOUR_TOKEN";
  const clients = [].concat(bscWeb3[config.LIVE_NET]);
  const runtime = new Date().toISOString();
  return Object.freeze({
    blockStart: parseInt(config.BLOCK_START),
    blockStop: parseInt(config.BLOCK_STOP || config.BLOCK_END),
    web3: config.WEB3,
    clients,
    abi: getAbi(config),
    prefix,
    runtime,
    accounts: getKnownAccounts(config),
    banned: getBannedAccounts(config),
    network: config.LIVE_NET,
    stakingAddress: config.STAKING_CONTRACT_ADDRESS,
    tokenAddress: config.TOKEN_CONTRACT_ADDRESS,
    numberOfQueues: clients.length,
  });
}

module.exports = {
  buildConfiguration,
};
