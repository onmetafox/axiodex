const fs = require('fs')
const path = require('path')

String.prototype.interpolate = function(params) {
    const names = Object.keys(params)
    const vals = Object.values(params)
    return new Function(...names, `return \`${this}\`;`)(...vals)
}

const network = process.argv[2] ?? 'ethereum'

const templ = path.resolve(process.cwd(), 'subgraph.template.yaml')
const yaml = path.resolve(process.cwd(), 'subgraph.yaml')
const state = path.resolve(process.cwd(), '../state.ts')

const { contracts: variables } = require(`./state-${network}.json`)
fs.writeFileSync(state, Object.entries(variables).map(([k, v]) => `export const ${k} = "${v}";`).join('\n'))

variables['network'] = {
    devnet: 'devnet',
    pulsechain: 'ethereum'
}[network]
variables['startBlock'] = {
    devnet: 0,
    pulsechain: 16744653
}[network]

const content = fs.readFileSync(templ).toString().interpolate(variables)
fs.writeFileSync(yaml, Buffer.from(content))