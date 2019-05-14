pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/utils/Address.sol";
import "./VLCashier.sol";
import "./VLManaged.sol";


contract VLLottery is VLManaged {

    using Address for address;

    uint256 public activeGameId;
    mapping(uint256 => uint256) public gameStartTimestamps;
    mapping(uint256 => Game) public lotteries;

    struct Game {
        uint256 collectedEthers;
        uint256 ticketsIssued;
        uint256 winner;
        bool finished;
        mapping(uint256 => address payable) tickets;
    }

    event WinnerLogged(uint256 gameId, uint256 ticketId);
    event TicketBought(uint256 gameId, uint256 ticketId);

    constructor(address _management) public VLManaged(_management) {
        gameStartTimestamps[0] = block.timestamp;
    }

    function() external payable requireRegisteredContract(CASHIER) {
        buy();
    }

    function setGameResult(
        uint256 _ticketId
    )
        public
        requireRegisteredContract(CASHIER)
        requirePermission(CAN_RECORD_RESULT)
        returns (bool)
    {
        require(gameStartTimestamps[activeGameId].add(management.gameDuration()) <= block.timestamp, ACCESS_DENIED);

        require(getSoldTicketsAmount(activeGameId) > 0, ACCESS_DENIED);

        Game storage lottery = lotteries[activeGameId];

        require(lottery.finished == false, ACCESS_DENIED);

        lottery.winner = _ticketId;
        lottery.finished = true;

        ++activeGameId;
        gameStartTimestamps[activeGameId] = block.timestamp;

        VLCashier(management.contractRegistry(CASHIER)).finishGame(activeGameId.sub(1), lottery.tickets[_ticketId]);
        emit WinnerLogged(activeGameId, _ticketId);
        return true;
    }

    function getSoldTicketsAmount(uint256 _id) public view returns (uint256) {
        return lotteries[_id].ticketsIssued;
    }

    function getCurrentGameStats()
        public
        view
        returns (
            uint256 jp,
            uint256 collectedEthers,
            uint256 startAt,
            uint256 price,
            uint256 winner,
            uint256 ticketsIssued,
            bool finished
    )
    {
        (
            jp,
            collectedEthers,
            startAt,
            price,
            winner,
            ticketsIssued,
            finished
        ) = getGameStatsById(activeGameId);
    }

    function getGameStatsById(uint256 _id)
        public
        view
        returns (
            uint256 jp,
            uint256 collectedEthers,
            uint256 startAt,
            uint256 price,
            uint256 winner,
            uint256 ticketsIssued,
            bool finished
        )
    {
        jp = VLCashier(management.contractRegistry(CASHIER)).gameJP(_id);
        collectedEthers = lotteries[_id].collectedEthers;
        startAt = gameStartTimestamps[_id];
        price = management.ticketPrice();
        winner = lotteries[_id].winner;
        ticketsIssued = lotteries[_id].ticketsIssued;
        finished = lotteries[_id].finished;
    }

    function buy() internal {
        address sender = msg.sender;

        require(!sender.isContract(), ACCESS_DENIED);

        uint256 ticketPrice = management.ticketPrice();
        require(msg.value >= ticketPrice, WRONG_AMOUNT);

        Game storage lottery = lotteries[activeGameId];

        uint256 ticketsAmount = msg.value.div(ticketPrice);
        uint256 usedAmount = ticketsAmount.mul(ticketPrice);

        lottery.collectedEthers = lottery.collectedEthers.add(usedAmount);

        for (uint256 i = 1; i <= ticketsAmount; i++) {
            uint256 ticketId = lottery.ticketsIssued.add(i);
            lottery.tickets[ticketId] = msg.sender;

            emit TicketBought(activeGameId, ticketId);
        }

        lottery.ticketsIssued = lottery.ticketsIssued.add(ticketsAmount);

        VLCashier(management.contractRegistry(CASHIER)).recordPurchase.value(usedAmount)(activeGameId, sender);

        if (usedAmount < msg.value) {
            msg.sender.transfer(msg.value.sub(usedAmount));
        }

    }

}