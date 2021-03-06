//to run this on testnet:
// $ npx hardhat run scripts/authorize.js

const fs = require('fs')
const path = require('path')
const hardhat = require('hardhat')
const whitelist = require('../data/whitelist.json')
const privateKey = process.env.privateKey;

function authorize(recipient, maxMint = 2) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      // ['string', 'address'],
      // ['mint', recipient]
      ['string', 'address', 'uint256'],
      ['mint', recipient, maxMint]
    ).slice(2),
    'hex'
  )
}
// function authorize(recipient) {
//   return Buffer.from(
//     ethers.utils.solidityKeccak256(
//       ['string', 'address'],
//       ['mint', recipient]
//     ).slice(2),
//     'hex'
//   )
// }

async function main() {
  //sign message wallet PK
  const wallet = "0x"+privateKey 
  const signer = new ethers.Wallet(wallet)

  console.log(signer);
  const authorized = {}

  //make a message
  for (let i = 0; i < whitelist.length; i++) {
    const message = authorize(whitelist[i])
    authorized[whitelist[i]] = await signer.signMessage(message)
  }

  fs.writeFileSync(
    path.resolve(__dirname, '../data/authorized.json'),
    JSON.stringify(authorized, null, 2)
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})