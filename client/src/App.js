import { useState, useEffect } from "react";

import "./App.css";
import web3 from "./web3";
import lotteryContractInstance from "./lottery";

function App() {
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState("");

  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      // since we are making use of the web3 provider, provided by metamask, we don't need to provide info of who is calling this contract method when using call
      const lotteryManager = await lotteryContractInstance.methods
        .manager()
        .call();
      if (lotteryManager) {
        setManager(lotteryManager);
      }

      const lotteryPlayers = await lotteryContractInstance.methods
        .getPlayers()
        .call();
      if (lotteryPlayers && lotteryPlayers.length) {
        setPlayers(lotteryPlayers);
      }

      // lotteryBalance is of Big Number
      const lotteryBalance = await web3.eth.getBalance(
        lotteryContractInstance._address
      );
      if (lotteryBalance) {
        setBalance(lotteryBalance);
      }
    })();
  }, []);

  function handleValueChange(e) {
    setValue(e.target.value);
  }
  async function handleSubmit(e) {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();

    setMessage("Waiting on transaction to complete...");
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: lotteryContractInstance._address,
      value: web3.utils.toWei(value, "ether"),
    });

    setMessage("You have been entered into the lottery. All the best!");
  }

  async function handlePickWinner() {
    const accounts = await web3.eth.getAccounts();

    setMessage("Picking a winner...");

    await lotteryContractInstance.methods.pickWinner().send({
      from: accounts[0],
    });

    setMessage("A winner has been picked!");
  }

  return (
    <div>
      <h2>lottery Contract</h2>
      {manager && <p>This contract is managed by: {manager}</p>}
      <p>
        There are currently {players.length} people entered, competing to win{" "}
        {web3.utils.fromWei(balance, "ether")} ethers!
      </p>
      <hr />
      <form onSubmit={handleSubmit}>
        <h4>Wanna try your luck?</h4>
        <div>
          <label>Amount of ether to enter</label>
          <input value={value} onChange={handleValueChange} />
        </div>
        <div>
          <button>Enter</button>
        </div>
      </form>

      <hr />
      <h4>Ready to pick a winner?</h4>
      <button onClick={handlePickWinner}>Pick a winner!</button>
      <hr />
      <h2>{message}</h2>
    </div>
  );
}

export default App;
