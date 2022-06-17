// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//----------------------------------------------------------------------
//     __  _______  ____  ______
//    /  |/  / __ \/ __ \/ ____/
//   / /|_/ / /_/ / /_/ / /     
//  / /  / / ____/ ____/ /___   
// /_/  /_/_/   /_/    \____/   
//
// Manila Pool Party Club is an Exclusive NFT Club and the First & Only 
// NFT project that showcases the Philippines as a world class tourist 
// destination.
//
// https://linktr.ee/mppcnft
//
//----------------------------------------------------------------------

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract RoyaltySplitter is PaymentSplitter {
  constructor(
    address[] memory payees, 
    uint256[] memory shares_
  ) payable PaymentSplitter(payees, shares_){}
}