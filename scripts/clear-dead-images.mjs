import fs from 'fs'

let js = fs.readFileSync('client/src/data/products.js', 'utf8')
js = js.replace(
  /"image":\s*"https:\/\/mrz-perfume\.com\/[^"]*"/g,
  '"image": ""',
)
fs.writeFileSync('client/src/data/products.js', js)

const seed = JSON.parse(
  fs.readFileSync('client/src/data/products_seed.json', 'utf8'),
)
for (const product of seed) {
  if (String(product.image || '').includes('mrz-perfume.com')) {
    product.image = ''
  }
}
fs.writeFileSync(
  'client/src/data/products_seed.json',
  `${JSON.stringify(seed, null, 2)}\n`,
)

console.log(
  'cleaned',
  seed.filter((p) => !p.image).length,
  'empty images of',
  seed.length,
)
