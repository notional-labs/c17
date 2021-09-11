require("dotenv").config();
const path = require("path");
const { buildConfiguration } = require("./buildConfig");
const { readStartingAccountSetFromCsvFile } = require("../services/reader");

module.exports = {
  config: buildConfiguration({
    getKnownAccounts: (config) => {
      return readStartingAccountSetFromCsvFile(
        path.join(__dirname, "../../" + config.ACCOUNTS_FILE)
      );
    },
    getBannedAccounts: (config) => {
      return new Set();
    },
    getAbi: (config) => {
      const abiPath = path.join(__dirname, "../../" + config.ABI);
      let abi;
      try {
        abi = require(abiPath);
      } catch (e) {
        throw new Error("Cannot find ABI Json file at: " + abiPath);
      }
      return abi;
    },
  }),
};
