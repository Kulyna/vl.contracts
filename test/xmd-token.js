const BigNumber = require('bignumber.js');

const Utils = require("./utils")
const Token = artifacts.require('XMDToken.sol')

const precision = new BigNumber("1000000000000000000")

contract('XMDToken', accounts => {

    let token = null

    beforeEach(async () => {
        token = await Token.new()
    })

    describe('ERC20Detailed', () => {

        it('check state vars', async () => {
            await Utils.checkState({token}, {
                token: {
                    name: "XMOD Token",
                    symbol: "XMD",
                    decimals: 18,
                }
            })
        })

    })

    describe('ERC20Mintable', () => {

        it('deployer is a minter, add/remove minter', async () => {
            assert.equal(await token.isMinter.call(accounts[0]), true, "wrong value for isMinter");
            assert.equal(await token.isMinter.call(accounts[1]), false, "wrong value for isMinter");

            await token.addMinter(accounts[1], {from: accounts[2]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed)

            await token.addMinter(accounts[1], {from: accounts[0]})
                .then(Utils.receiptShouldSucceed)

            assert.equal(await token.isMinter.call(accounts[0]), true, "wrong value for isMinter");
            assert.equal(await token.isMinter.call(accounts[1]), true, "wrong value for isMinter");

            await token.renounceMinter({from: accounts[1]})
                .then(Utils.receiptShouldSucceed)

            assert.equal(await token.isMinter.call(accounts[0]), true, "wrong value for isMinter");
            assert.equal(await token.isMinter.call(accounts[1]), false, "wrong value for isMinter");
        })

        it('check mint / onlyMinter modifier / state vars changing', async () => {

            assert.equal(
                await token.balanceOf.call(accounts[1]),
                new BigNumber('0').multipliedBy(precision).valueOf(),
                "wrong value for balanceOf"
            );

            assert.equal(
                await token.totalSupply.call(),
                new BigNumber('0').multipliedBy(precision).valueOf(),
                "wrong value for totalSupply"
            );

            await token.mint(accounts[1], new BigNumber('28').multipliedBy(precision).valueOf(), {from: accounts[2]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed)

            await token.mint(accounts[1], new BigNumber('28').multipliedBy(precision).valueOf())
                .then(Utils.receiptShouldSucceed)

            assert.equal(
                await token.balanceOf.call(accounts[1]),
                new BigNumber('28').multipliedBy(precision).valueOf(),
                "wrong value for balanceOf"
            );
            assert.equal(
                await token.totalSupply.call(),
                new BigNumber('28').multipliedBy(precision).valueOf(),
                "wrong value for totalSupply"
            );

            await token.mint(accounts[1], new BigNumber('28').multipliedBy(precision).valueOf())
                .then(Utils.receiptShouldSucceed)

            assert.equal(
                await token.balanceOf.call(accounts[1]),
                new BigNumber('56').multipliedBy(precision).valueOf(),
                "wrong value for balanceOf"
            );
            assert.equal(
                await token.totalSupply.call(),
                new BigNumber('56').multipliedBy(precision).valueOf(),
                "wrong value for totalSupply"
            );

        })

    })

    describe('ERC20Burnable', () => {

        it('check burn function', async () => {

            assert.equal(
                await token.balanceOf.call(accounts[1]),
                new BigNumber('0').multipliedBy(precision).valueOf(),
                "wrong value for balanceOf"
            );

            assert.equal(
                await token.totalSupply.call(),
                new BigNumber('0').multipliedBy(precision).valueOf(),
                "wrong value for totalSupply"
            );

            await token.mint(accounts[1], new BigNumber('28').multipliedBy(precision).valueOf())
                .then(Utils.receiptShouldSucceed)

            assert.equal(
                await token.balanceOf.call(accounts[1]),
                new BigNumber('28').multipliedBy(precision).valueOf(),
                "wrong value for balanceOf"
            );
            assert.equal(
                await token.totalSupply.call(),
                new BigNumber('28').multipliedBy(precision).valueOf(),
                "wrong value for totalSupply"
            );

            await token.burn(new BigNumber('2.8').multipliedBy(precision).valueOf(), {from:accounts[0]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed)

            await token.burn(new BigNumber('2.8').multipliedBy(precision).valueOf(), {from:accounts[1]})
                .then(Utils.receiptShouldSucceed)

            assert.equal(
                await token.balanceOf.call(accounts[1]),
                new BigNumber('28').minus('2.8').multipliedBy(precision).valueOf(),
                "wrong value for balanceOf"
            );
            assert.equal(
                await token.totalSupply.call(),
                new BigNumber('28').minus('2.8').multipliedBy(precision).valueOf(),
                "wrong value for totalSupply"
            );

        })

        it('check _burnFrom function', async () => {

            assert.equal(
                await token.balanceOf.call(accounts[1]),
                new BigNumber('0').multipliedBy(precision).valueOf(),
                "wrong value for balanceOf"
            );

            assert.equal(
                await token.totalSupply.call(),
                new BigNumber('0').multipliedBy(precision).valueOf(),
                "wrong value for totalSupply"
            );

            await token.mint(accounts[1], new BigNumber('28').multipliedBy(precision).valueOf())
                .then(Utils.receiptShouldSucceed)

            assert.equal(
                await token.balanceOf.call(accounts[1]),
                new BigNumber('28').multipliedBy(precision).valueOf(),
                "wrong value for balanceOf"
            );
            assert.equal(
                await token.totalSupply.call(),
                new BigNumber('28').multipliedBy(precision).valueOf(),
                "wrong value for totalSupply"
            );

            await token.burnFrom(accounts[1], new BigNumber('2.8').multipliedBy(precision).valueOf(), {from:accounts[0]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed)

            await token.increaseAllowance(accounts[0], new BigNumber('3').multipliedBy(precision).valueOf(), {from: accounts[1]})

            await token.burnFrom(accounts[1], new BigNumber('2.8').multipliedBy(precision).valueOf(), {from:accounts[0]})
                .then(Utils.receiptShouldSucceed)

            assert.equal(
                await token.balanceOf.call(accounts[1]),
                new BigNumber('28').minus('2.8').multipliedBy(precision).valueOf(),
                "wrong value for balanceOf"
            );
            assert.equal(
                await token.totalSupply.call(),
                new BigNumber('28').minus('2.8').multipliedBy(precision).valueOf(),
                "wrong value for totalSupply"
            );

        })

    })
})