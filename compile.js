const path = require("path");
const fs = require("fs");
const solc = require("solc");

const inboxContractPath = path.resolve(__dirname, "contracts", "Lottery.sol");

const source = fs.readFileSync(inboxContractPath, "utf-8");

const input = {
  language: "Solidity",
  sources: {
    "Lottery.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

module.exports = output.contracts["Lottery.sol"]["Lottery"];
