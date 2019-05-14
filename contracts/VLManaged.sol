pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./VLConstants.sol";
import "./VLManagement.sol";


contract VLManaged is Ownable, VLConstants {

    using SafeMath for uint256;

    VLManagement public management;

    modifier requirePermission(uint8 _permissionBit) {
        require(hasPermission(msg.sender, _permissionBit), ACCESS_DENIED);
        _;
    }

    modifier onlyRegistered(uint256 _key) {
        require(msg.sender == management.contractRegistry(_key), ACCESS_DENIED);
        _;
    }

    modifier requireRegisteredContract(uint256 _key) {
        require(management.contractRegistry(_key) != address(0), NO_CONTRACT);
        _;
    }

    constructor(address _managementAddress) public {
        management = VLManagement(_managementAddress);
    }

    function setManagementContract(address _management) public onlyOwner {
        require(address(0) != _management);

        management = VLManagement(_management);
    }

    function hasPermission(address _subject, uint256 _permissionBit) internal view returns (bool) {
        return management.permissions(_subject, _permissionBit);
    }

}