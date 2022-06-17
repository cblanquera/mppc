const { expect } = require('chai');
require('dotenv').config()

if (process.env.BLOCKCHAIN_NETWORK != 'hardhat') {
  console.error('Exited testing with network:', process.env.BLOCKCHAIN_NETWORK)
  process.exit(1);
}

async function deploy(name, ...params) {
  //deploy the contract
  const ContractFactory = await ethers.getContractFactory(name);
  const contract = await ContractFactory.deploy(...params);
  await contract.deployed();

  return contract;
}

async function bindContract(key, name, contract, signers) {
  //attach contracts
  for (let i = 0; i < signers.length; i++) {
    const Contract = await ethers.getContractFactory(name, signers[i]);
    signers[i][key] = await Contract.attach(contract.address);
  }

  return signers;
}

function getRole(name) {
  if (!name || name === 'DEFAULT_ADMIN_ROLE') {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  return '0x' + Buffer.from(ethers.utils.solidityKeccak256(['string'], [name]).slice(2), 'hex').toString('hex');
}

function authorize(recipient) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address'],
      ['mint', recipient]
    ).slice(2),
    'hex'
  )
}

describe('MPPC Tests', function () {
  before(async function() {
    const signers = await ethers.getSigners();
    this.base = 'https://ipfs.io/ipfs/Qm123abc/'
    this.preview = 'https://ipfs.io/ipfs/Qm123abc/preview.json'

    const nft = await deploy('MPPC', this.preview, signers[0].address)
    await bindContract('withNFT', 'MPPC', nft, signers)

    //fix minting overrides
    //['mint(uint256,{})']
    //['mint(address,uint256)']
    //['mint(uint256,bytes,{})']
    for (let i = 0; i < signers.length; i++) {
      signers[i].withNFT.mint = function(...args) {
        if (args.length === 2) {
          if (typeof args[0] === 'number') {
            return signers[i].withNFT['mint(uint256)'](...args)
          }
          return signers[i].withNFT['mint(address,uint256)'](...args)
        }

        if (args.length === 3) {
          return signers[i].withNFT['mint(uint256,bytes)'](...args)
        }
      }
    }
    
    const [
      admin,
      tokenOwner0, 
      tokenOwner1, 
      tokenOwner2, 
      tokenOwner3, 
      tokenOwner4,
      recipient1,
      recipient2
    ] = signers

    //make admin MINTER_ROLE, FUNDEE_ROLE, CURATOR_ROLE
    await admin.withNFT.grantRole(getRole('MINTER_ROLE'), admin.address)
    await admin.withNFT.grantRole(getRole('CURATOR_ROLE'), admin.address)

    const splitter = await deploy('PaymentSplitter', [recipient1.address, recipient2.address], [25, 75])
    await bindContract('withSplitter', 'PaymentSplitter', splitter, signers)
    
    this.signers = { 
      admin,
      tokenOwner0, 
      tokenOwner1, 
      tokenOwner2, 
      tokenOwner3, 
      tokenOwner4,
      recipient1,
      recipient2
    }
  })
  
  it('Should not mint', async function () {
    const { tokenOwner0 } = this.signers
    await expect(//sale not started
      tokenOwner0.withNFT.mint(3, { value: 0 })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//sale not started
      tokenOwner0.withNFT.mint(8, { value: ethers.utils.parseEther('0.015') })
    ).to.be.revertedWith('InvalidCall()')
  })
  
  it('Should error when getting token URI', async function () {
    const { admin } = this.signers
    await expect(//token does not exist
      admin.withNFT.tokenURI(1)
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should whitelist mint', async function () {
    const { admin, tokenOwner0, tokenOwner1 } = this.signers
  
    await tokenOwner0.withNFT.mint(2, await admin.signMessage(
      authorize(tokenOwner0.address)
    ), { value: ethers.utils.parseEther('0.06') })
    expect(await admin.withNFT.ownerOf(1)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(2)).to.equal(tokenOwner0.address)
  
    await tokenOwner0.withNFT.mint(2, await admin.signMessage(
      authorize(tokenOwner0.address)
    ), { value: ethers.utils.parseEther('0.06') })
    expect(await admin.withNFT.ownerOf(3)).to.equal(tokenOwner0.address)
    expect(await admin.withNFT.ownerOf(4)).to.equal(tokenOwner0.address)
  })

  it('Should not whitelist mint', async function () {
    const { admin, tokenOwner0, tokenOwner1 } = this.signers
    await expect(//minted > max mint
      tokenOwner0.withNFT.mint(2, await admin.signMessage(
        authorize(tokenOwner0.address)
      ), { value: ethers.utils.parseEther('0.06') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//quantity > max mint
      tokenOwner1.withNFT.mint(6, await admin.signMessage(
        authorize(tokenOwner1.address)
      ), { value: ethers.utils.parseEther('0.18') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//wrong amount
      tokenOwner1.withNFT.mint(1, await admin.signMessage(
        authorize(tokenOwner1.address)
      ), { value: ethers.utils.parseEther('0.02') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//using another persons proof
      tokenOwner0.withNFT.mint(1, await admin.signMessage(
        authorize(tokenOwner1.address)
      ), { value: ethers.utils.parseEther('0.03') })
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should start sale', async function () {  
    const { admin } = this.signers
    expect(await admin.withNFT.saleStarted()).to.equal(false)
    await admin.withNFT.startSale(false)
    expect(await admin.withNFT.saleStarted()).to.equal(false)
    await admin.withNFT.startSale(true)
    expect(await admin.withNFT.saleStarted()).to.equal(true)
  })

  it('Should mint', async function () {
    const { admin, tokenOwner2, tokenOwner3 } = this.signers
    await tokenOwner2.withNFT.mint(1, { value: ethers.utils.parseEther('0.03') })
    await tokenOwner2.withNFT.mint(1, { value: ethers.utils.parseEther('0.03') })
    await tokenOwner2.withNFT.mint(2, { value: ethers.utils.parseEther('0.06') })
    expect(await admin.withNFT.ownerOf(5)).to.equal(tokenOwner2.address)
    expect(await admin.withNFT.ownerOf(6)).to.equal(tokenOwner2.address)
    expect(await admin.withNFT.ownerOf(7)).to.equal(tokenOwner2.address)
    expect(await admin.withNFT.ownerOf(8)).to.equal(tokenOwner2.address)

    await admin.withNFT.mint(tokenOwner3.address, 2)
    expect(await admin.withNFT.ownerOf(9)).to.equal(tokenOwner3.address)
    expect(await admin.withNFT.ownerOf(10)).to.equal(tokenOwner3.address)
  })

  it('Should not mint', async function () {
    const { tokenOwner2, tokenOwner4 } = this.signers
    await expect(//cant mint anymore
      tokenOwner2.withNFT.mint(2, { value: ethers.utils.parseEther('0.06') })
    ).to.be.revertedWith('InvalidCall()')

    await expect(//invalid amount
      tokenOwner4.withNFT.mint(1, { value: ethers.utils.parseEther('0.02') })
    ).to.be.revertedWith('InvalidCall()')
  })

  it('Should withdraw', async function () {
    const { admin } = this.signers

    await admin.withNFT.setTreasury(admin.withSplitter.address)

    await expect(//no base uri set
      admin.withNFT.withdraw()
    ).to.be.revertedWith('InvalidCall()')

    await admin.withNFT.setBaseURI(this.base)
    await admin.withNFT.withdraw()
    
    expect(parseFloat(
      ethers.utils.formatEther(await admin.provider.getBalance(
        admin.withSplitter.address
      ))
    )).to.equal(0.24)
  })

  it('Should get the correct token URIs', async function () {
    const { admin } = this.signers

    for (let i = 1; i <= 10; i++) {
      expect(
        await admin.withNFT.tokenURI(i)
      ).to.equal(`${this.base}${i}.json`)
    }
  })

  it('Should calc royalties', async function () {
    const { admin } = this.signers

    const info = await admin.withNFT.royaltyInfo(1, 1000)
    expect(info.receiver).to.equal(admin.withSplitter.address)
    expect(info.royaltyAmount).to.equal(100)
  })

  it('Should allow OS to transfer', async function () {
    const { admin, tokenOwner2, tokenOwner3} = this.signers

    await expect(
      admin.withNFT.transferFrom(tokenOwner3.address, tokenOwner2.address, 10)
    ).to.be.revertedWith('InvalidCall()')

    await admin.withNFT.grantRole(getRole('APPROVED_ROLE'), admin.address)
    await admin.withNFT.transferFrom(tokenOwner3.address, tokenOwner2.address, 10)
    expect(await admin.withNFT.ownerOf(10)).to.equal(tokenOwner2.address)
  })
})