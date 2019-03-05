const { assert } = require('chai');
const { web3, _testAccounts } = require('../web3Util.js');
const [operator, account1, account2] = _testAccounts;
const deploy = require('../deployPlasma.js');
const { Transaction, UnsignedTransaction } = require('../plasmaObjects.js');
const { encodeUtxoId, NULL_ADDRESS } = require('../utils.js');
const PlasmaChain = require('../plasmaChain.js');
const {abi} = require('../Plasma.json');

// Apply Exit => Stage 15

describe('Apply Exit Function', () => {
    const ether = web3.utils.toWei('1', 'ether');
    let contract;
    let plasmaChain;
    let utxoPos;
    beforeEach(async () => {
        contract = await deploy(operator.address);
        plasmaChain = new PlasmaChain(operator.address, contract.options.address, abi);
        await plasmaChain.plasmaContract.methods.deposit().send({ from: account1.address, value: ether })

        const transferAmount = '10000';
        const ogAmount = '1000000000000000000';
        const leftover = ogAmount - transferAmount;

        const tx = new Transaction(1, 0, 0, 0, 0, 0,
            account2.address, transferAmount,
            account1.address, leftover,
            NULL_ADDRESS);

        const tx2 = new Transaction(1000, 0, 1, 0, 0, 0,
            account2.address, transferAmount,
            account1.address, leftover - transferAmount,
            NULL_ADDRESS);

        plasmaChain.addTransaction(tx);
        plasmaChain.addTransaction(tx2);
        await tx2.sign1(account1.privateKey);

        await plasmaChain.submitBlock(plasmaChain.currentBlock);

        utxoPos = encodeUtxoId(1000, 1, 0);
        const txBytes = "0x" + tx2.encoded().toString('hex');
        const merkle = plasmaChain.blocks[1000].merkle();
        const proof = merkle.getProof(merkle.leaves[1]);
        const proofBytes = "0x" + proof[0].data.toString('hex');

        const confirmationSig = tx2.confirm(merkle.getRoot(), account1.privateKey);
        const sigs = tx2.sig1 + tx2.sig2.slice(2) + confirmationSig;
        const bond = await plasmaChain.plasmaContract.methods.EXIT_BOND().call();

        await plasmaChain.plasmaContract.methods.startExit(utxoPos, txBytes, proofBytes, sigs).send({ from: account2.address, gas: 200000, value: bond });
    })

    it('should mark the UTXO as spent', function () {

        const tx = plasmaChain.getTransaction(utxoPos);
        assert.equal(tx.spent1, true);
    });
})
