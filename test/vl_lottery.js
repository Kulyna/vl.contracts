
const Lottery = artifacts.require("./VLLottery.sol");
const Cashier = artifacts.require('./VLCashier.sol');
const Management = artifacts.require("./VLManagement.sol");

const Utils = require("./utils");
const BigNumber = require('bignumber.js');
const precision = new BigNumber('1000000000000000000').valueOf();

contract('VLLottery && VLCashier', function (accounts) {
    let lottery,
        cashier,
        management;

    let startAt;

    beforeEach(async function () {
        management = await Management.new();
        startAt = parseInt(new Date().getTime() / 1000);
        lottery = await Lottery.new(management.address);
        cashier = await Cashier.new(management.address);
    });

    it("check state && buy && getCurrentGameStats && getGameStatsById && recordPurchase && getSoldTicketsAmount", async function () {
        let activeGame = 0;
        assert.equal(await lottery.activeGameId.call(), activeGame, "activeGameId is not equal");
        await management.setFoundersAddress(accounts[8], {from:accounts[0]})
            .then(Utils.receiptShouldSucceed);

        await lottery.sendTransaction({value: new BigNumber('0.02').multipliedBy(precision).valueOf(), from: accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await management.registerContract(1, cashier.address);

        let gameStats = await lottery.getCurrentGameStats.call();
        console.log(new BigNumber(await lottery.gameStartTimestamps.call(activeGame)).valueOf(), 'g start something near: ' + startAt);
        assert.equal(gameStats.jp, new BigNumber('0').valueOf(), "jp is not equal");
        assert.equal(gameStats.collectedEthers, new BigNumber('0').valueOf(), "collectedEthers is not equal");
        assert.equal(gameStats.price, web3.utils.toWei('0.02', 'ether'), "price is not equal");
        assert.equal(gameStats.ticketsIssued, new BigNumber('0').valueOf(), "ticketsIssued is not equal");
        assert.equal(gameStats.finished, false, "finished is not equal");

        await lottery.sendTransaction({value: new BigNumber('0.01999999').multipliedBy(precision).valueOf(), from: accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await lottery.sendTransaction({value: new BigNumber('0.048').multipliedBy(precision).valueOf(), from: accounts[1]})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await management.setPermission(lottery.address, 0, true);

        let acc1InitialBalance = await Utils.getEtherBalance(accounts[1]);
        let foundersBalance = await Utils.getEtherBalance(accounts[8]);

        await lottery.sendTransaction({value: new BigNumber('0.048').multipliedBy(precision).valueOf(), from: accounts[1]})
            .then(Utils.receiptShouldSucceed);

        assert.equal(await lottery.activeGameId.call(), activeGame, "activeGameId is not equal");

        gameStats = await lottery.getCurrentGameStats.call();
        //2 tickets 0.02 - 30%
        //0.02 * 2 * 70 / 100 = 0.028
        assert.equal(gameStats.jp, web3.utils.toWei('0.028', 'ether'), "jp is not equal");
        assert.equal(gameStats.collectedEthers, web3.utils.toWei('0.04', 'ether'), "collectedEthers is not equal");
        console.log(new BigNumber(await lottery.gameStartTimestamps.call(activeGame)).valueOf(), 'g start something near: ' + startAt);
        assert.equal(gameStats.price, web3.utils.toWei('0.02', 'ether'), "price is not equal");
        assert.equal(gameStats.ticketsIssued, new BigNumber('2').valueOf(), "ticketsIssued is not equal");
        assert.equal(gameStats.finished, false, "finished is not equal");

        assert.equal(await Utils.getEtherBalance(accounts[8]), new BigNumber(foundersBalance).plus(web3.utils.toWei('0.012', 'ether')), "getEtherBalance is not equal");
        assert.equal(await lottery.getSoldTicketsAmount.call(activeGame), 2, "getSoldTicketsAmount is not equal");

        console.log('account 1 ether initial balance        ', new BigNumber(acc1InitialBalance).dividedBy(precision).valueOf());
        console.log('account 1 ether current balance        ', new BigNumber(await Utils.getEtherBalance(accounts[1])).dividedBy(precision).valueOf());
        console.log('account 1 ether should be - gas balance', new BigNumber(acc1InitialBalance).minus(web3.utils.toWei('0.04', 'ether')).dividedBy(precision).valueOf());

    });

    it("check setGameResult && finishGame", async function () {
        let winnerId = 3,
            permittedForResult = accounts[5],
            winnerAccount = accounts[2];

        await lottery.setGameResult(winnerId, {from: permittedForResult})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await management.registerContract(1, cashier.address);

        let gameStats = await lottery.getCurrentGameStats.call();
        assert.equal(gameStats.jp, new BigNumber('0').valueOf(), "jp is not equal");
        assert.equal(gameStats.collectedEthers, new BigNumber('0').valueOf(), "collectedEthers is not equal");
        assert.equal(gameStats.price, web3.utils.toWei('0.02', 'ether'), "price is not equal");
        assert.equal(gameStats.ticketsIssued, new BigNumber('0').valueOf(), "ticketsIssued is not equal");
        assert.equal(gameStats.finished, false, "finished is not equal");

        await management.setPermission(lottery.address, 0, true);

        await lottery.setGameResult(winnerId, {from: permittedForResult})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await management.setPermission(permittedForResult, 1, true);

        await lottery.setGameResult(winnerId, {from: permittedForResult})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await management.setGameDuration(1)
            .then(Utils.receiptShouldSucceed);

        await lottery.sendTransaction({value: new BigNumber('0.048').multipliedBy(precision).valueOf(), from: accounts[1]})
            .then(Utils.receiptShouldSucceed);
        await lottery.sendTransaction({value: new BigNumber('0.02').multipliedBy(precision).valueOf(), from: winnerAccount})
            .then(Utils.receiptShouldSucceed);
        await lottery.sendTransaction({value: new BigNumber('0.06').multipliedBy(precision).valueOf(), from: accounts[3]})
            .then(Utils.receiptShouldSucceed);

        let winnerAccountBalance = await Utils.getEtherBalance(winnerAccount);

        gameStats = await lottery.getCurrentGameStats.call();
        //0.02 * 6 * 70 / 100 = 0.028
        assert.equal(gameStats.jp, web3.utils.toWei('0.084', 'ether'), "jp is not equal");
        assert.equal(gameStats.collectedEthers, web3.utils.toWei('0.12', 'ether'), "collectedEthers is not equal");
        assert.equal(gameStats.price, web3.utils.toWei('0.02', 'ether'), "price is not equal");
        assert.equal(gameStats.winner, 0, "winner is not equal");
        assert.equal(gameStats.ticketsIssued, new BigNumber('6').valueOf(), "ticketsIssued is not equal");
        assert.equal(gameStats.finished, false, "finished is not equal");

        await lottery.setGameResult(winnerId, {from: permittedForResult})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await management.setPermission(lottery.address, 2, true);

        await lottery.setGameResult(winnerId, {from: permittedForResult})
            .then(Utils.receiptShouldSucceed);

        await lottery.setGameResult(winnerId, {from: permittedForResult})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed);

        await lottery.sendTransaction({value: new BigNumber('0.02').multipliedBy(precision).valueOf(), from: accounts[3]})
            .then(Utils.receiptShouldSucceed);

        gameStats = await lottery.getCurrentGameStats.call();
        //0.02 * 1 * 70 / 100 = 0.014
        assert.equal(gameStats.jp, web3.utils.toWei('0.014', 'ether'), "jp is not equal");
        assert.equal(gameStats.collectedEthers, web3.utils.toWei('0.02', 'ether'), "collectedEthers is not equal");
        assert.equal(gameStats.price, web3.utils.toWei('0.02', 'ether'), "price is not equal");
        assert.equal(gameStats.winner, 0, "winner is not equal");
        assert.equal(gameStats.ticketsIssued, new BigNumber('1').valueOf(), "ticketsIssued is not equal");
        assert.equal(gameStats.finished, false, "finished is not equal");

        assert.equal(await lottery.activeGameId.call(), 1, "activeGameId is not equal");

        gameStats = await lottery.getGameStatsById.call(0);

        assert.equal(gameStats.jp, web3.utils.toWei('0.084', 'ether'), "jp is not equal");
        assert.equal(gameStats.collectedEthers, web3.utils.toWei('0.12', 'ether'), "collectedEthers is not equal");
        assert.equal(gameStats.price, web3.utils.toWei('0.02', 'ether'), "price is not equal");
        assert.equal(gameStats.winner, 3, "winner is not equal");
        assert.equal(gameStats.ticketsIssued, new BigNumber('6').valueOf(), "ticketsIssued is not equal");
        assert.equal(gameStats.finished, true, "finished is not equal");

        assert.equal(await Utils.getEtherBalance(winnerAccount), new BigNumber(winnerAccountBalance).plus(web3.utils.toWei('0.084', 'ether')).valueOf(), "winnerAccountBalance is not equal");

    });

})
