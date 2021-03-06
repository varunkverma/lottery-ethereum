const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const { abi, evm } = require("./compile");
const { bytecode } = evm || {};

const provider = new HDWalletProvider({
  mnemonic: {
    phrase: process.env.MNEMONIC,
  },
  providerOrUrl: process.env.INFURA_ROPSTEN,
});

const web3 = new Web3(provider);

async function deploy() {
  const accounts = await web3.eth.getAccounts();
  const [deployerAccount] = accounts;
  console.log(`Attempting to deploy via account: ${deployerAccount}`);

  const contractInstance = await new web3.eth.Contract(abi)
    .deploy({
      data: bytecode.object,
    })
    .send({
      from: deployerAccount,
      gas: "1000000",
    });
  fs.writeFileSync(
    path.join(__dirname, "contracts", "Lottery.json"),
    JSON.stringify(abi),
    {
      encoding: "utf-8",
    }
  );
  console.log(`Contract deployed to ${contractInstance.options.address}`);
}

deploy();
