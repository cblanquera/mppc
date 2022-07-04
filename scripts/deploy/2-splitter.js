//to run this on testnet:
// $ npx hardhat run scripts/deploy/2-splitter.js

const hardhat = require('hardhat')

async function deploy(name, ...params) {
  //deploy the contract
  const ContractFactory = await hardhat.ethers.getContractFactory(name);
  const contract = await ContractFactory.deploy(...params);
  await contract.deployed();

  return contract;
}

//config
const shares = [
  665,
  100,
  75,
  50,
  25,
  25,
  20,
  5,
  5,
  5,
  5,
  20
]
const recipients = [
  '0x0730C279ED140ad9eF2D6CE922dBa76d871198F1', // MPPC
  '0x5EdaA1e39c7961b123a8b79E9606B64777E65A90', // Ss
  '0x3F36609690f5AD6182B6668D987a1FCBb7bb2A2F', // Co
  '0xD7D190cdC6A7053CD5Ee76E966a1b9056dbA4774', // Bw
  '0x3a9653e6cA8cf0dF140510eb9edbe4B5B7a6Af54', // Ry
  '0xFe154CC6B0E52a2C5ED04ee4d754B91b44fbd0c7', // Mk
  '0x45f83EebE0e68340a9c1e5Ed3feFe7a49AD5DC71', // Jz
  '0x7070D5CE6e6656aEE0c453CF20791fc27cEFaCa4', // Va
  '0x9AA719eA0FFbc30FDcea19384e5457B80A929695', // Vn
  '0x353DC704F62Cb600EA170E8032B21199160c4979', // Sx
  '0x447C9058bE5c164e0c4aae380381e7A5215052D4', // Ma
  '0xE40F08489FC0Bd35733F79a927f837c45058347e', // Ne
]

async function main() {
  console.log('Deploying PaymentSplitter 2...')
  const splitter = await deploy('PaymentSplitter', recipients, shares)
  console.log('')
  console.log('-----------------------------------')
  console.log('PaymentSplitter 2 deployed to:', splitter.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});