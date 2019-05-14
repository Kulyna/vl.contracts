pragma solidity 0.5.2;


contract VLConstants {
    // Permissions bit constants
    uint8 public constant CAN_RECORD_PURCHASE = 0;
    uint8 public constant CAN_RECORD_RESULT = 1;
    uint8 public constant CAN_SEND_JP = 2;

    // Contract Registry keys
    uint256 public constant CASHIER = 1;
    uint256 public constant LOTTERY = 2;
//    uint256 public constant RANDOMIZER = 3;

    string public constant ACCESS_DENIED = "ACCESS_DENIED";
    string public constant WRONG_AMOUNT = "WRONG_AMOUNT";
    string public constant NO_CONTRACT = "NO_CONTRACT";
//    string public constant NO_ACTIVE_LOTTERY = "NO_ACTIVE_LOTTERY";
    string public constant NOT_AVAILABLE = "NOT_AVAILABLE";

}