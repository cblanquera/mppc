//to run this on testnet:
// $ npx hardhat run scripts/deploy.js

const hardhat = require('hardhat')

async function deploy(name, ...params) {
  //deploy the contract
  const ContractFactory = await hardhat.ethers.getContractFactory(name);
  const contract = await ContractFactory.deploy(...params);
  await contract.deployed();

  return contract;
}

function getRole(name) {
  if (!name || name === 'DEFAULT_ADMIN_ROLE') {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  return '0x' + Buffer.from(
    hardhat.ethers.utils.solidityKeccak256(['string'], [name]).slice(2)
    , 'hex'
  ).toString('hex');
}

//config
const preview = ''
const shares = []
const recipients = []

async function main() {
  //get network and admin
  const network = hardhat.config.networks[hardhat.config.defaultNetwork]
  const admin = new ethers.Wallet(network.accounts[0])

  console.log('Deploying PaymentSplitter ...')
  const splitter = await deploy('PaymentSplitter', recipients, shares)
  console.log('')
  console.log('-----------------------------------')
  console.log('PaymentSplitter deployed to:', splitter.address)

  console.log('Deploying MPPC ...')
  const nft = await deploy('MPPC', preview, admin.address)

  console.log('')
  console.log('-----------------------------------')
  console.log('MPPC deployed to:', nft.address)
  console.log('')
  console.log('Roles: MINTER_ROLE, CURATOR_ROLE, APPROVED_ROLE')
  console.log('')
  console.log(
    'npx hardhat verify --show-stack-traces --network',
    hardhat.config.defaultNetwork,
    nft.address,
    `"${preview}"`,
    `"${admin.address}"`
  )
  console.log('')
  console.log('-----------------------------------')
  console.log('Next Steps:')
  console.log('In MPPC contract, grant MINTER_ROLE, CURATOR_ROLE to admin (choose another wallet)')
  console.log(` - ${network.scanner}/address/${nft.address}#writeContract`)
  console.log(` - grantRole( ${getRole('MINTER_ROLE')}, ${admin.address} )`)
  console.log(` - grantRole( ${getRole('CURATOR_ROLE')}, ${admin.address} )`)
  console.log('')
  console.log('In MPPC contract, set treasury')
  console.log(` - ${network.scanner}/address/${nft.address}#writeContract`)
  console.log(` - setTreasury( ${splitter.address} )`)
  console.log('')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});