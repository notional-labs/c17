const fs = require('fs')

/*
* Pull the known accounts list from a csv file on disk.
* @param path
* @returns {Set<string>}
*/
function readStartingAccountSetFromCsvFile(path) {
    const accountSet = new Set();
    if (fs.existsSync(path)) {
        const filestream = fs.createReadStream(path);
        const file = fs.readFileSync(path, "utf-8");
        const lines = file.split("\n");
        for (const line of lines) {
            const data = line.split(",");
            accountSet.add(data[0]);
        }
        console.log("processedMap successfully");
    } else {
        throw new Error("Cannot read account list at: " + path);
    }
    return accountSet;
}

module.exports = {
   readStartingAccountSetFromCsvFile
}
