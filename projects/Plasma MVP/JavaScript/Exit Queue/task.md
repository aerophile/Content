When exiting transactions from the Plasma chain, a queue is established to allow each exit a specified challenge period. We will later define this challenge period within the `addExitToQueue` function. 

Let's begin by importing the `ExitQueue.sol` contract into our `Plasma.sol` contract. 

1. Import the `ExitQueue.sol` contract into `Plasma.sol`

## Exit Setup

1. Define an `Exit` struct with an exitor `address`, token `address`, and `uint256` amount as it's arguments
2. Define an `exits` mapping where a UTXO position is mapped to an `Exit` struct
3. Define an `exitQueue` which is an instance of the `ExitQueue` contract.
4. Instantiate a `exitQueues[address(0)]` to the `address` of a new `PriorityQueue` within the constract constructor
5. Define an `ExitStarted` event with an `exitor` address, utxo position named `utxoPos`, `token` address, and `amount` to be exited as it's attributes.

## Add Exit to Queue

1. Define an `addExitToQueue` public function with a UTXO position, token address, exitor address, exit amount, and created at date as it's arguments.

This function should revert if:

a) the amount is equal to 0   
b) the exit already exits within the `exits` mapping. (Testable after function is complete)

An exit can be checked for existence by determining if the amount of that exit is 0, meaning that the exit was already paid out.

Before pushing an exit onto the queue, you will need to calculate an `exitableAt` date. The `exitableAt` date should be the sum of the `createdAt` plus `2 weeks`. 

> In practice, the exitable date could be anything. However, for testing purposes we have set `exitableAt` date as stated above.

Then create the `Exit` and map it to it's UTXO position.

Finally, emit the `ExitStarted` event.