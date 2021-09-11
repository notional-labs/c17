require('dotenv').config();
const path = require('path');
const buildAddressBalanceList = require('./services/getAddressBalanceList');
const {processBlockSequence} = require("./services/queues");
const config = require('./configs').config;
const writers = require('./services/writer').createCsvOutputWriters(config, path.join(__dirname, '../'))
const {getTokenContract} = require('./services/contracts')

buildAddressBalanceList({
    config: config,
    logger: console,
    writers,
    getContract: getTokenContract,
    proccessBlockSequence:processBlockSequence});
