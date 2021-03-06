pragma solidity ^0.5.0;

import "./RLPDecode.sol";

library PlasmaRLP {
    struct exitingTx {
        address exitor;
        uint256 amount;     
        uint256 inputCount;
    }

    /* Public Functions */

    function getUtxoPos(bytes memory challengingTxBytes, uint256 outputIndex)
        internal pure
        returns (uint256)
    {
        RLPDecode.RLPItem[] memory txList = RLPDecode.toList(RLPDecode.toRlpItem(challengingTxBytes));
        uint256 outputIndexShift = outputIndex * 3;
        return
            RLPDecode.toUint(txList[0 + outputIndexShift]) * 1000000000 +
            RLPDecode.toUint(txList[1 + outputIndexShift]) * 10000 +
            RLPDecode.toUint(txList[2 + outputIndexShift]);
    }

    function createExitingTx(bytes memory exitingTxBytes, uint256 oindex)
        internal pure
        returns (exitingTx memory)
    {
        RLPDecode.RLPItem[] memory txList = RLPDecode.toList(RLPDecode.toRlpItem(exitingTxBytes));
        return exitingTx(
            RLPDecode.toAddress(txList[6 + (2 * oindex)]),
            RLPDecode.toUint(txList[7 + 2 * oindex]),
            RLPDecode.toUint(txList[0]) * RLPDecode.toUint(txList[3])
        );
    }
}

            
