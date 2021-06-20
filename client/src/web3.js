import Web3 from "web3";

// get the currenct provider of web3, which metamask imports onto the browser
const web3 = new Web3(window.web3.currentProvider);

export default web3;
