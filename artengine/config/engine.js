const path = require('path')
const root = path.join(process.cwd(), 'artengine')

module.exports = {
  network: 'testnet',
  default_weight: 100,
  default_blend: 'source-over',
  default_opacity: 1,
  preview: {
    width: 300,
    height: 300
  },
  image: {
    width: 2000,
    height: 2000
  },
  pixelated: 2 / 24,
  start_edition: 1,
  cid_version: 0,
  smoothing: true,
  shuffle_layers: true,
  paths: {
    root,
    config: path.resolve(root, 'config'),
    build: path.resolve(root, 'build'),
    layers: path.resolve(root, 'layers'),
    cache: path.resolve(root, '.artengine')
  },
  metadata_template: {
    name: 'MPPC #{EDITION}',
    description: 'Manila Pool Party Club. Exclusive & Iconic NFT Club. 1st Club that showcases the 🇵🇭 as a World Class Tourist Destination through NFTs',
    preview: 'https://ipfs.io/ipfs/{LORES_CID}',
    image: 'https://ipfs.io/ipfs/{HIRES_CID}',
    external_url: 'https://www.katipunanpoolpartyclub.com/manilapoolpartyclub'
  },
  layers: [
    {
      config: "layers/Ape",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Ape'
      }],
      limit: 450
    },
    {
      config: "layers/Eagle",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Eagle'
      }],
      limit: 550
    },
    {
      config: "layers/Archer",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Archer'
      }],
      limit: 650
    },
    {
      config: "layers/Tiger",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Tiger'
      }],
      limit: 750
    },
    {
      config: "layers/Lion",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Lion'
      }],
      limit: 850
    },
    {
      config: "layers/Cardinal",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Cardinal'
      }],
      limit: 950
    },
    {
      config: "layers/Tamaraw",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Tamaraw'
      }],
      limit: 1050
    },
    {
      config: "layers/Warrior",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Warrior'
      }],
      limit: 1150
    },
    {
      config: "layers/Dragon",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Dragon'
      }],
      limit: 1250
    },
    {
      config: "layers/Bulldog",
      attributes: [{
        trait_type: 'Tribe',
        value: 'Bulldog'
      }],
      limit: 1350
    }
  ]
}