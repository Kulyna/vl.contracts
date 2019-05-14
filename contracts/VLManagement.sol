pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./VLConstants.sol";

contract VLManagement is Ownable, VLConstants {

    uint256 public ticketPrice = 0.02 ether;

    uint256 public gameDuration = 1 weeks;

    uint256 public foundersRevenuePercentage = 30;

    address payable public foundersAddress = 0xb75037df93E6BBbbB80B0E5528acaA34511B1cD0;
    // Contract Registry
    mapping(uint256 => address) public contractRegistry;
    // Permissions
    mapping(address => mapping(uint256 => bool)) public permissions;

    event PermissionsSet(address subject, uint256 permission, bool value);

    event ContractRegistered(uint256 key, address target);

    event GameSettingUpdated(string name, uint256 newValue);

    event FoundersAddressUpdated(address newValue);

    function setPermission(address _address, uint256 _permission, bool _value) public onlyOwner {
        permissions[_address][_permission] = _value;

        emit PermissionsSet(_address, _permission, _value);
    }

    function registerContract(uint256 _key, address _target) public onlyOwner {
        contractRegistry[_key] = _target;

        emit ContractRegistered(_key, _target);
    }

    function setTicketPrice(uint256 _newVal) public onlyOwner {
        ticketPrice = _newVal;

        emit GameSettingUpdated('ticketPrice', _newVal);
    }

    function setFoundersRevenuePercentage(uint256 _newVal) public onlyOwner {
        foundersRevenuePercentage = _newVal;

        emit GameSettingUpdated('foundersRevenuePercentage', _newVal);
    }

    function setGameDuration(uint256 _newVal) public onlyOwner {
        gameDuration = _newVal;

        emit GameSettingUpdated('gameDuration', _newVal);
    }

    function setFoundersAddress(address payable _newVal) public onlyOwner {
        foundersAddress = _newVal;

        emit FoundersAddressUpdated(_newVal);
    }

}