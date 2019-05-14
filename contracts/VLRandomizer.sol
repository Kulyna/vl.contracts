//pragma solidity 0.5.2;
///*
//import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";
//import "./VLManaged.sol";
//import "./VLLottery.sol";
//
//
//contract VLRandomizer is VLManaged, usingOraclize {
//
//    uint256 public randomQueryID;
//    /* init gas for oraclize */
//    uint256 public gasForOraclize = 235000;
//
//    event LogInfo(string description);
//    event LogRandomUpdate(string number);
//
//    constructor(address _management) public VLManaged(_management) {
//        /* init gas price for callback (default 20 gwei)*/
//        oraclize_setCustomGasPrice(20000000000 wei);
//    }
//
//    function() public payable {
//        revert();
//    }
//
//    function random() public payable {
//        update();
//    }
//
//    function __callback(bytes32, string result) public {
//        uint256 randomInt = parseInt(result);
//        VLLottery lottery = VLLottery(management.contractRegistry(LOTTERY));
//        uint256 activeGameId = lottery.activeGameId();
//
//        require((randomInt > 0 && randomInt <= lottery.lotteries(activeGameId).ticketsIssued), WRONG_AMOUNT);
//        //require(msg.sender == oraclize_cbAddress());
//        require(true == lottery.setGameResult(randomInt), ACCESS_DENIED);
//
//        emit LogRandomUpdate(result);
//    }
//
//    /* set gas limit for oraclize query */
//    function ownerSetOraclizeSafeGas(uint32 newSafeGasToOraclize) public onlyOwner {
//        gasForOraclize = newSafeGasToOraclize;
//    }
//
//    /* set gas price for oraclize callback */
//    function ownerSetCallbackGasPrice(uint256 newCallbackGasPrice) public onlyOwner {
//        oraclize_setCustomGasPrice(newCallbackGasPrice);
//    }
//
//    function update() public payable {
//        // Check if we have enough remaining funds
//        if (oraclize_getPrice('URL') > address(this).balance) {
//            emit LogInfo('Oraclize query was NOT sent, please add some ETH to cover for the query fee');
//        } else {
//            emit LogInfo('Oraclize query was sent, standing by for the answer..');
//
//            randomQueryID += 1;
//            // Using XPath to to fetch the right element in the JSON response
//            string memory string1 = "[URL] ['json(https://api.random.org/json-rpc/1/invoke).result.random.data.0', '\\n{\"jsonrpc\":\"2.0\",\"method\":\"generateIntegers\",\"params\":{\"apiKey\":${[decrypt] BP/GT8fDh+lRNPRE4RWT/86Hcypys4kfapOzLwEHs56g4HrWhISOEKm+oKQy96i5rQnv2+mGbHNNTywqWslefgoRaYVFqXUB6cjEpKCK5XfZrDStmpftxmuO/Ekhqjj3cltH5BxYUO/PUIBzkpRECDTXP0ByjaM=},\"n\":1,\"min\":1,\"max\":";
//            string memory string2 = uint2str(management.maxTicketsAmount());
//            string memory string3 = ",\"replacement\":true,\"base\":10${[identity] \"}\"},\"id\":";
//            string memory query0 = strConcat(string1, string2, string3);
//            string memory string4 = uint2str(3);
//            string memory string5 = "${[identity] \"}\"}']";
//            string memory query = strConcat(query0, string4, string5);
//            bytes32 rngId = oraclize_query("nested", query, gasForOraclize);
//        }
//
//    }
//
//}
