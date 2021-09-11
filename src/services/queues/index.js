const {retry} = require('../../util');
const retry3 = retry(3);
const MAX_QUERY_SIZE = 10000; // Limited by web3 servers

function spliceIntoChunks(originalArray, maxChunkSize) {
    const data = [].concat(originalArray);
    const chunks = [];
    while (data.length > 0) {
        const chunk = data.splice(0, maxChunkSize);
        chunks.push(chunk);
    }
    return chunks
}


function splitBlocksIntoQueues(blockNumbers, numberOfQueues) {
    const blockQueues = {}
    const avgDataLength = blockNumbers.length / numberOfQueues
    Array.from({ length: numberOfQueues }).forEach((_, index) => {
        blockQueues[index] = blockNumbers.slice(Math.floor(index * avgDataLength), Math.floor((index + 1) * avgDataLength))
    })

    blockQueues[numberOfQueues - 1][blockQueues[numberOfQueues - 1].length - 1] = blockNumbers[blockNumbers.length - 1];
    return blockQueues
}

async function evaluateBlockSequenceEvents(blockSequence, tokenContract) {
    const accountSet = new Set();
    const blockSequenceChunks = spliceIntoChunks(blockSequence, MAX_QUERY_SIZE);
    console.log('\tScan from ', blockSequence[0], ' to ', blockSequence[blockSequence.length - 1])
    let pastEvents = [];
    for(const chunkindex in blockSequenceChunks) {
        const chunk = blockSequenceChunks[chunkindex];
        const fromBlock = chunk[0];
        const toBlock = chunk[chunk.length - 1];
        const events = await tokenContract.getPastEvents('allEvents', {
            fromBlock,
            toBlock
        });
        pastEvents = pastEvents.concat(events)
        if (pastEvents == null || pastEvents.length == 0) {
            console.log('\tNo contract events from ', chunk[0], ' to ', chunk[chunk.length - 1])
        }
    }
    for (const pastEvent of pastEvents) {
        let account = pastEvent.returnValues.from;
        if(account) accountSet.add(account);
        //break;
    }
    return accountSet;
}

async function processBlockSequence(blocks, tokenContract) {
    return await retry3(evaluateBlockSequenceEvents, blocks, tokenContract);
}

module.exports = {
    splitBlockSequenceIntoQueues:splitBlocksIntoQueues,
    spliceIntoChunks,
    processBlockSequence
}
