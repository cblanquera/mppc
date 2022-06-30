const path = require('path')
const fs = require('fs-extra')
const Bottleneck = require('bottleneck')
const pinataSDK = require('@pinata/sdk')
const FormData = require('form-data')
const { post } = require('axios')

const { 
  paths, 
  network,
  cid_version
} = require('../config/engine')

require('dotenv').config()
const PINATA_API_PINFILETOIPFS = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
const { PINATA_API_KEY, PINATA_API_SECRET } = process.env
const CACHE_FILE = path.join(paths.cache, '.pinata.json')

const uploaded = fs.existsSync(CACHE_FILE)? fs.readJsonSync(CACHE_FILE): {}
const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET)
const rateLimiter = new Bottleneck({ maxConcurrent: 1, minTime: 3000 })

async function main() {
  const datalist = []
  const previews = path.resolve(paths.build, network, 'preview')
  const jsons = path.resolve(paths.build, network, 'json')
  if (!fs.existsSync(previews)) {
    throw new Error('build/preview folder missing')
  } else if (!fs.existsSync(jsons)) {
    throw new Error('build/json folder missing')
  }

  //loop through preview files
  const files = await fs.promises.readdir(previews)
  for( const name of files ) {
    const preview = path.join(previews, name)
    const previewStat = await fs.promises.stat( preview )
    //if not a file
    if(!previewStat.isFile()) {
      console.error(`Skipping ${name}, not a file`)
      continue
    //if not a png
    } else if (path.extname(preview) !== '.png') {
      console.error(`Skipping ${name}, not a png`)
      continue
    }

    const json = path.join(jsons, `${path.basename(name, '.png')}.json`)
    //if file doesnt exist
    if (!fs.existsSync(json)) {
      console.error(`Skipping ${name}, no matching ${path.basename(name, '.png')}.json found`)
      continue
    }

    if (uploaded[preview]) {
      console.log('unpinning', path.basename(name, '.png'), uploaded[preview])
      await rateLimiter.schedule(async() => (await pinata.unpin(uploaded[preview])))
    }

    datalist.push({ path: json, name: path.basename(json) })
  }

  console.log('Uploading all json...')
  const formData = new FormData();
  datalist.forEach(metadata => {
    console.log(`Adding file: ${metadata.path}`)
    formData.append('file', fs.createReadStream(metadata.path), {
      filepath: metadata.name
    })
  })
  const {
    data: { IpfsHash: cid },
  } = await post(PINATA_API_PINFILETOIPFS, formData, {
    maxBodyLength: 'Infinity',
    headers: {
      // eslint-disable-next-line no-underscore-dangle
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
  })
  console.log(`JSON folder found in https://ipfs.io/ipfs/${cid}`)
  console.log('Done!')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})