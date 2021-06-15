const assert = require("assert");
const ganache = require("ganache-core");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../compile");
const { bytecode } = evm || {};

let lotteryContractInstance;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lotteryContractInstance = await new web3.eth.Contract(abi)
    .deploy({
      data: bytecode.object,
    })
    .send({
      from: accounts[0],
      gas: "1000000",
    });
});

describe("lottery contract", () => {
  it("deploys a contract", () => {
    assert.ok(lotteryContractInstance.options.address);
  });

  it("allows one account to enter", async () => {
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: lotteryContractInstance._address,
      value: web3.utils.toWei("0.05", "ether"),
    });
    const players = await lotteryContractInstance.methods.getPlayers().call({
      from: accounts[0],
    });
    assert.strictEqual(accounts[0], players[0]);
    assert.strictEqual(1, players.length);
  });

  it("allows multiple accounts to enter", async () => {
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: lotteryContractInstance._address,
      value: web3.utils.toWei("1", "ether"),
    });
    await web3.eth.sendTransaction({
      from: accounts[1],
      to: lotteryContractInstance._address,
      value: web3.utils.toWei("1", "ether"),
    });
    await web3.eth.sendTransaction({
      from: accounts[2],
      to: lotteryContractInstance._address,
      value: web3.utils.toWei("1", "ether"),
    });

    const players = await lotteryContractInstance.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.strictEqual(accounts[0], players[0]);
    assert.strictEqual(accounts[1], players[1]);
    assert.strictEqual(accounts[2], players[2]);
    assert.strictEqual(3, players.length);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: lotteryContractInstance._address,
        value: web3.utils.toWei("1", "wei"),
      });
    } catch (err) {
      assert(err);
    }
  });

  it("only manager can call pickWinner", async () => {
    try {
      await lotteryContractInstance.methods.pickWinner().send({
        from: accounts[1],
      });
    } catch (err) {
      assert(err);
    }
  });

  it("sends money to the winner and resets the players array", async () => {
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: lotteryContractInstance._address,
      value: web3.utils.toWei("2", "ether"),
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);

    await lotteryContractInstance.methods.pickWinner().send({
      from: accounts[0],
    });

    const finalBalance = await web3.eth.getBalance(accounts[0]);

    const diffBal = finalBalance - initialBalance;
    assert(diffBal > web3.utils.toWei("1.8", "ether")); // some money is deducted on mining
  });
});
