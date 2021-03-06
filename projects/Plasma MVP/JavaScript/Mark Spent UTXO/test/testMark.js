let assert = require('assert');
const {web3, _testAccounts} = require('../web3Util.js');
const [operator, account1, account2] = _testAccounts;
const deploy = require('../deployPlasma.js');
const {abi} = require('../Plasma.json');
const {encodeUtxoId} = require('../utils.js');
const PlasmaChain = require('../plasmaChain.js');
const { Transaction, TransactionInput, TransactionOutput} = require('../plasmaObjects.js');
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

describe('mark spent utxo function', function() {
    let contract;
    let plasmaChain;
    let event;
    let block;
    let tx;
    let tx2;
    const ether = '1';
    beforeEach(async() => {
        contract = await deploy(operator.address);
        plasmaChain = new PlasmaChain(operator, contract.options.address, abi, web3);
        await plasmaChain.plasmaContract.methods.deposit().send({
            from: account1.address, 
            value: web3.utils.toWei(ether, 'ether')
        }); // Block 1
        await plasmaChain.plasmaContract.methods.deposit().send({
            from: account2.address, 
            value: web3.utils.toWei(ether, 'ether')
        }); // Block 2
        const transferAmount = '10000';
        const ogAmount = '1000000000000000000';
        const leftover = ogAmount - transferAmount;
        tx = new Transaction(
            new TransactionInput(1,0,0), 
            new TransactionInput(0,0,0), 
            new TransactionOutput(account2.address, transferAmount),
            new TransactionOutput(account1.address, leftover),
        ); // Block 1
        tx2 = new Transaction(
            new TransactionInput(1000, 0, 1),
            new TransactionInput(0, 0, 0),
            new TransactionOutput(account2.address, transferAmount),
            new TransactionOutput(account1.address, leftover - transferAmount),
        ); // Block 1000
    });

    it('should return a transaction within the current block', function () {
        const utxoId = encodeUtxoId(1000, 1, 0);
        plasmaChain.addTransaction(tx);
        plasmaChain.addTransaction(tx2);
        const transaction = plasmaChain.getTransaction(utxoId);
        assert.equal(transaction.input1.blockNumber, 1000, "blockNumber is not 1000 as expected");
        assert.equal(transaction.input1.transactionIndex, 0, "transactionIndex is not 0 as expected");
        assert.equal(transaction.input1.outputIndex, 1, "outputIndex is not 1 as expected");
    });

    it('should return a transaction within the plasma chain blocks', function () {
        const utxoId = encodeUtxoId(1,0,0);
        plasmaChain.addTransaction(tx);
        plasmaChain.addTransaction(tx2);
        const transaction = plasmaChain.getTransaction(utxoId);
        assert.equal(transaction.input1.blockNumber, 0, "blockNumber is not 0 as expected");
        assert.equal(transaction.input1.transactionIndex, 0, "transactionIndex is not 0 as expected");
        assert.equal(transaction.input1.outputIndex, 0, "outputIndex is not 0 as expected");
    });

    it('should not return a transaction if it does not exist', function () {
        const utxoId = encodeUtxoId(2000, 0, 0);
        plasmaChain.addTransaction(tx);
        plasmaChain.addTransaction(tx2);
        const transaction = plasmaChain.getTransaction(utxoId);
        assert.equal(transaction, null);
    });

    it('should mark the utxo as spent for an outputIndex of 0', function() {
        const utxoId = encodeUtxoId(1,0,0);
        plasmaChain.addTransaction(tx);
        plasmaChain.markUtxoSpent(utxoId);
        const transaction = plasmaChain.getTransaction(utxoId);
        assert.equal(transaction.output1.spent, true);
    });

    it('should mark the utxo as spent for an outputIndex of 1', function() {
        const utxoId = encodeUtxoId(1000,0,1);
        plasmaChain.addTransaction(tx);
        plasmaChain.addTransaction(tx2);
        plasmaChain.markUtxoSpent(utxoId);
        const transaction = plasmaChain.getTransaction(utxoId);
        assert.equal(transaction.output2.spent, true);
    });
});
