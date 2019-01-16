const Plasma = artifacts.require('Plasma');

contract('Plasma', (accounts) => {
    let contract;
    const owner = accounts[0];
    let root = web3.sha3(owner);
    let watcher;
    const ether = web3.toWei(1, 'ether');
    describe('Get Deposit Function', () => {
        beforeEach(async() => {
            contract = await Plasma.new({from: owner})
            watcher = contract.DepositCreated();
            await contract.deposit({from: accounts[1], value: ether})
            await contract.submitBlock(root, {from: owner})
        })

        it('should submit the correct current deposit block after a block is submitted', async() => {
            await contract.deposit({from: accounts[1], value: ether})
            let events = await watcher.get();
            const blkNum = events[0].args.blockNumber;
            assert.equal(blkNum.toNumber(), 1001);
        })

        it('should set the correct current deposit block', async() => {
            await contract.deposit({from: accounts[1], value: ether})
            const counter = await contract.currentDepositBlock.call();
            assert.equal(counter.toNumber(), 2);
        })

        it('should be an internal function', async() => {
            const fail = contract.getDepositBlock;
            assert.equal(fail, undefined);
        })
    })
})