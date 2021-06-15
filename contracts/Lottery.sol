// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.1;

contract Lottery {
    address public manager;

    address payable[] public players;

    constructor() {
        manager = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == manager, "Not authorised");
        _;
    }

    receive() external payable {
        require(
            msg.value >= 0.01 ether,
            "You need to provide atleast 0.01 ether"
        );

        players.push(payable(msg.sender));
    }

    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    function pickWinner() public onlyOwner {
        uint256 index = random() % players.length;
        players[index].transfer((address(this)).balance);

        // reset the players array
        players = new address payable[](0); // initial size is 0
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
}
