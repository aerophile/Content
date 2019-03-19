## Collect the Blocks! 

We've kept a history of the blocks in our Plasma Contract on the blockchain, now it's time to keep a record on our operator as well! 

You'll want to create a `blocks` class member that can map a `blockNumber` to a `Block` (definition in `PlasmaObjects.js`).

1. Define this `blocks` member variable.

## Deposit Listener

OK, now it's time to listen to the deposit event from our Solidity Contract! 

Our event was called `DepositCreated` and recall that it returned an `amount`, an `owner` and a `blockNumber`. 

1. Write a subscriber that will listen for the `DepositCreated` event to fire on the Plasma contract instance. 
2. In the callback for the `DepositCreated` event, take the `blockNumber` from the `returnValues` and use it to create a new `Block` with an empty transaction set.

You can learn more about events and how to subscribe to them in web3.js [here](https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#contract-events). Assume all events will be emitted after the constructor is called, so there is no need to look for past events. 

> If you're having trouble finding the `returnValues` in the event callback, use `console.log` to log the event to the test output! 