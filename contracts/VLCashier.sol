pragma solidity 0.5.2;

import "./VLManaged.sol";
import "./VLManagement.sol";


contract VLCashier is VLManaged {

    mapping(uint256 => uint256) public gameJP;

    event LotteryPurchased(address indexed contributor, uint256 gameId);
    event FeeCharged(address indexed contributor, uint256 value);
    event JPWithdrawn(address indexed winner, uint256 gameId, uint256 value);

    constructor(address _management) public VLManaged(_management) {}

    function recordPurchase(
        uint256 _gameId,
        address _contributor
    )
        public
        payable
        requirePermission(CAN_RECORD_PURCHASE)
        returns (uint256)
    {
        uint256 feeAmount = msg.value.mul(management.foundersRevenuePercentage()).div(100);
        gameJP[_gameId] = gameJP[_gameId].add(msg.value.sub(feeAmount));
        emit LotteryPurchased(_contributor, _gameId);

        emit FeeCharged(_contributor, feeAmount);
        management.foundersAddress().transfer(feeAmount);
    }

    function finishGame(
        uint256 _gameId,
        address payable _winner
    )
        public
//        requireRegisteredContract(RANDOMIZER)
        requirePermission(CAN_SEND_JP)
    {
        _winner.transfer(gameJP[_gameId]);
        emit JPWithdrawn(_winner, _gameId, gameJP[_gameId]);
    }

}