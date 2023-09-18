const fs = require('fs')
const path = require('path')

String.prototype.interpolate = function(params) {
    const names = Object.keys(params)
    const vals = Object.values(params)
    return new Function(...names, `return \`${this}\`;`)(...vals)
}

const network = process.argv[2] ?? 'ethereum'
const block = process.argv[3] ?? 0
const json = process.argv[4] ?? 'state-mainnet.json'

const templ = path.resolve(process.cwd(), 'subgraph.template.yaml')
const yaml = path.resolve(process.cwd(), 'subgraph.yaml')
const state = path.resolve(process.cwd(), '../state.ts')

const { contracts: variables } = require(path.resolve(__dirname, `../contracts/scripts/_total/${json}`))
fs.writeFileSync(state, Object.entries(variables).map(([k, v]) => `export const ${k} = "${v.toLowerCase()}";`).join('\n'))

variables['network'] = network
variables['startBlock'] = block

const content = fs.readFileSync(templ).toString().interpolate(variables)
fs.writeFileSync(yaml, Buffer.from(content))