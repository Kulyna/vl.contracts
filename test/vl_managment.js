const Cashier = artifacts.require("./VLCashier.sol");
const Lottery = artifacts.require("./VLLottery.sol");
const Management = artifacts.require("./VLManagement.sol");

const Utils = require("./utils");
const BigNumber = require("bignumber.js");

contract("VLManagement && VLManaged && VLConstants", function (accounts) {
    let lottery,
        cashier,
        management;

    beforeEach(async function () {
        management = await Management.new();
        lottery = await Lottery.new(management.address);
        cashier = await Cashier.new(management.address);
    });

    it("check state && registerContract && setPermission && setTicketPrice && setFoundersRevenuePercentage && setGameDuration && setFoundersAddress", async function () {
        await Utils.checkState({management, lottery}, {
            management: {
                ticketPrice: web3.utils.toWei('0.02', 'ether'),
                gameDuration: 604800,
                foundersRevenuePercentage: 30,
                foundersAddress: 0xb75037df93E6BBbbB80B0E5528acaA34511B1cD0,
            },
            lottery: {
                management: management.address,
            },
        });

        await management.registerContract(1, cashier.address, {from: accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
        await management.setPermission(lottery.address, 2, true, {from: accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await management.registerContract(1, cashier.address, {from: accounts[0]})
            .then(Utils.receiptShouldSucceed);
        await management.setPermission(lottery.address, 2, true, {from: accounts[0]})
            .then(Utils.receiptShouldSucceed);

        assert.equal(await management.contractRegistry.call(1), cashier.address, "contractRegistry is not equal");
        assert.equal(await management.permissions.call(lottery.address, 2), true, "contractRegistry is not equal");

        await management.registerContract(1, accounts[7], {from: accounts[0]})
            .then(Utils.receiptShouldSucceed);
        await management.setPermission(accounts[7], 2, true, {from: accounts[0]})
            .then(Utils.receiptShouldSucceed);

        assert.equal(await management.contractRegistry.call(1), accounts[7], "contractRegistry is not equal");
        assert.equal(await management.permissions.call(accounts[7], 2), true, "contractRegistry is not equal");

        await management.setTicketPrice(web3.utils.toWei('0.028', 'ether'), {from:accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
        await management.setFoundersRevenuePercentage(28, {from:accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
        await management.setGameDuration(604800, {from:accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
        await management.setFoundersAddress(accounts[8], {from:accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await management.setTicketPrice(web3.utils.toWei('0.028', 'ether'), {from:accounts[0]})
            .then(Utils.receiptShouldSucceed);
        await management.setFoundersRevenuePercentage(28, {from:accounts[0]})
            .then(Utils.receiptShouldSucceed);
        await management.setGameDuration(604800, {from:accounts[0]})
            .then(Utils.receiptShouldSucceed);
        await management.setFoundersAddress(accounts[8], {from:accounts[0]})
            .then(Utils.receiptShouldSucceed);

        await Utils.checkState({management}, {
            management: {
                ticketPrice: web3.utils.toWei('0.028', 'ether'),
                gameDuration: 604800,
                foundersRevenuePercentage: 28,
                foundersAddress: accounts[8],
            },
        });


    });

    it("check state VLManaged && VLConstants", async function () {

        await Utils.checkState({management, lottery}, {
            management: {
                ticketPrice: web3.utils.toWei('0.02', 'ether'),
                gameDuration: 604800,
                foundersRevenuePercentage: 30,
                foundersAddress: 0xb75037df93E6BBbbB80B0E5528acaA34511B1cD0,
                CAN_RECORD_PURCHASE: 0,
                CAN_RECORD_RESULT: 1,
                CAN_SEND_JP: 2,
                CASHIER: 1,
                LOTTERY: 2,
                ACCESS_DENIED: "ACCESS_DENIED",
                WRONG_AMOUNT: "WRONG_AMOUNT",
                NO_CONTRACT: "NO_CONTRACT",
                NOT_AVAILABLE: "NOT_AVAILABLE",
            },
            lottery: {
                management: management.address,
            },
        });

        await lottery.setManagementContract(accounts[3], {from:accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);
        await lottery.setManagementContract(accounts[3], {from:accounts[0]})
            .then(Utils.receiptShouldSucceed);

        await Utils.checkState({lottery}, {
            lottery: {
                management: accounts[3],
            },
        });

    });

});
