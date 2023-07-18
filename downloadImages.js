import { writeFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'

/**
 * Change variables below
 */
const how_many_pages = 11
const how_long_between_requests = 50 // ms
function getListUrlByPage(num){
  // use ${num} as the page at runtime, url is quoted with "`"
  const the_url_to_fetch = `https://na.finalfantasyxiv.com/lodestone/playguide/db/search/?page=${num}&category=item_equipment&patch=6.35`
  return the_url_to_fetch
}

/**
 * utils
 */
let isLastLineGhost = false
function log(text){
  if(isLastLineGhost){
    console.log('')
  }
  isLastLineGhost = false
  console.log(text)
}
function ghostLog(text){
  if (isLastLineGhost && process.stdout.isTTY){
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
  }
  isLastLineGhost = true
  process.stdout.write(text)
}

async function delay(ms) {
  if(ms <=0 ){
    return
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}

let lastRequestTimestamp = 0

async function waitBeforeNextRequestIfNeeded() {
  if (Date.now() - lastRequestTimestamp < how_long_between_requests){
    await delay(how_long_between_requests - (Date.now() - lastRequestTimestamp))
  }
  lastRequestTimestamp = Date.now()
}

async function customFetch(...args){
  await waitBeforeNextRequestIfNeeded()
  return fetch(...args)
}
// end

async function main(){
  const links = []
  log('Processing pages')
  const pages = how_many_pages
  for (let i = 11; i <= pages; i++){
    const url = getListUrlByPage(i)
    const text = await (await customFetch(url)).text()
    const doc = new JSDOM(text, {url: url}).window.document
    const linksinpage = [...doc.querySelectorAll('#character a.db_popup.db-table__txt--detail_link')].map(it=>it.href)
    links.push(...linksinpage)
    ghostLog(`Processed ${i}/${pages}`)
  }
  log('Total items: ' + links.length)

  const record = []
  const imageSet = new Set()
  log('Iterating items')
  for (let i = 0; i < links.length; i++){
    const link = links[i]
    const text = await (await customFetch(link)).text()
    const doc = new JSDOM(text, {url: link}).window.document
    const imageUrl = doc.querySelector('img.db-view__item__icon__item_image').src
    imageSet.add(imageUrl)
    const name = doc.querySelector('h2.db-view__item__text__name').textContent.trim().replaceAll(/[\n\t]+/g, '')
    record.push({
      name: name,
      filename: imageUrl.match(/\w+.png/)[0],
      url: imageUrl,
    })
    ghostLog(`Iterated ${i+1}/${links.length}`)
  }

  const images = [...imageSet]
  log('Total unique images: ' + images.length)
  log('Downloading images')
  for (let i = 0; i < images.length; i++){
    const imageUrl = images[0]
    const buffer = await (await customFetch(imageUrl)).arrayBuffer()
    await writeFile('./images/'+imageUrl.match(/\w+.png/)[0], Buffer.from(buffer))
    ghostLog(`Downloaded ${i+1}/${images.length}`)
  }
  await writeFile('./record_'+Date.now()+'.log', JSON.stringify(record, null, 2))
  log('Done')
}
main()