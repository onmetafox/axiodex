const { readFileSync, writeFileSync, existsSync } = require('fs')
const { ethers, network } = require('hardhat')

const instructions = require(`./instruction-base`)
const { resolve, dirname } = require('path')

const { sleep, interpolate, verify } = require('./helper')
const config = require('../core/tokens')


async function main() {
    // const tokens = config[network.name]
    const signers = await ethers.getSigners()
    const global = { ...ethers.utils }
    const filename = resolve(__dirname, `state-${network.name}.json`)
    if (!existsSync(filename) || network.name=="hardhat")
        writeFileSync(filename, JSON.stringify({
            contracts: {},
            variables: {},
            transactions: []
        }))
    const state = JSON.parse(readFileSync(filename))
    const deployed = []
    for (const instruction of instructions) {
        if(instruction.network) {
            const chain = typeof instruction.network=="object" ? instruction.network : [instruction.network]
            if(!chain.includes(network.name)) continue
        }
        // console.log(instruction.func, instruction.as??'', instruction.artifact??'', instruction.contract??'', instruction.method??'', instruction.args??'')
        if (instruction.func == "deploy" || instruction.func == "redeploy") {
            const name = instruction.as ?? instruction.artifact.split(':').pop()
            const factory = await ethers.getContractFactory(instruction.artifact)
            const block = await ethers.provider.getBlock('latest')
            const args = interpolate({...global, block }, instruction.args ?? [])
            const depends = instruction.args ? deployed.map(c => new RegExp(`\\$\\{${c}(\\..+)?\\}`).test(instruction.args.join(' '))).filter(c => !!c).length > 0 : false
            if (!depends && instruction.func == "deploy" && state.contracts[name]) {
                const contract = await ethers.getContractAt(instruction.artifact, state.contracts[name])
                global[name] = contract
                console.log("Loaded", name, contract.address)
                await verify(contract, args)
                continue
            }
            const contract = await factory.deploy(...args, instruction.overrides ?? {})
            await contract.deployed()
            deployed.push(name)
            state.contracts[name] = contract.address
            global[name] = contract
            writeFileSync(filename, JSON.stringify(state, undefined, 2))
            console.log("new", name, `(${args.join(',')}) // `, contract.address)
            await verify(contract, args)
        } else if (instruction.func == "load") {
            const name = instruction.as ?? instruction.artifact.split(':').pop()
            const address = instruction.address ? instruction.address.interpolate(global) : state.contracts[name]
            const contract = await ethers.getContractAt(instruction.artifact, address)
            state.contracts[name] = contract.address
            global[name] = contract
            writeFileSync(filename, JSON.stringify(state, undefined, 2))
            console.log(instruction.artifact.split(':').pop(), `(${contract.address})`)
        } else if (instruction.func == "call") {
            let depends = deployed.includes(instruction.contract) || (deployed.map(c => new RegExp(`\\$\\{${c}(\\..+)?\\}`).test((instruction.args??[]).join(' '))).filter(c => !!c).length > 0)
            const call_hash = ethers.utils.keccak256(Buffer.from(JSON.stringify([
                instruction.contract,
                instruction.method,
                instruction.args ?? [],
                ...(instruction.key ? [instruction.key] : [])
            ]))).substring(2, 18)
            // console.log('calling', call_hash)
            const block = await ethers.provider.getBlock('latest')
            const args = interpolate({...global, block }, instruction.args ?? [])
            if (!state.transactions.includes(call_hash) || instruction.as || depends) {
                const contract = global[instruction.contract]
                const ret = await contract[instruction.method](...args, instruction.overrides ?? {})
                if (instruction.as) {
                    global[instruction.as] = ret
                    state.variables[instruction.as] = ret
                } else {
                    await ret.wait()
                    state.transactions.push(call_hash)
                }
                writeFileSync(filename, JSON.stringify(state, undefined, 2))
                console.log("\t", `${instruction.contract}.${instruction.method}(${args.join(',')})`)
            } else {
                console.log("\tskipped", `${instruction.contract}.${instruction.method}(${args.join(',')})`)
            }
        } else if (instruction.func == "init_pair_hash") {
            const call_hash = ethers.utils.keccak256(Buffer.from(JSON.stringify([
                "init_pair_hash",
                instruction.router,
                instruction.factory,
            ]))).substring(2, 18)
            if (!state.transactions.includes(call_hash)) {
                const path = instruction.router
                const pathRouter = resolve(path)
                const content = readFileSync(pathRouter)
                const INIT_CODE_PAIR_HASH = await global[instruction.factory].INIT_CODE_PAIR_HASH()
                writeFileSync(pathRouter, content.toString('utf8').replace(/[\da-f]{64}/mi, INIT_CODE_PAIR_HASH.slice(2)))
                console.log("/********************************************************")
                console.log("PairHash set with", INIT_CODE_PAIR_HASH)
                await hre.run("compile")
                console.log("********************************************************/")
                state.transactions.push(call_hash)
                writeFileSync(filename, JSON.stringify(state, undefined, 2))
            }
        } else if(instruction.func == "wallet") {
            if(/^#\d+$/.test(instruction.value))
                global[instruction.as] = signers[instruction.value.substring(1)-1]
            else if(/^0x[\da-f]{64}$/i.test(instruction.value))
                global[instruction.as] = new ethers.Wallet(instruction.value)
            else if(/^0x[\da-f]{40}$/i.test(instruction.value))
                global[instruction.as] = { address: instruction.value }
            else if(global[instruction.value])
                global[instruction.as] = global[instruction.value]
            else
                global[instruction.as] = new ethers.Wallet(ethers.utils.keccak256(Buffer.from(instruction.value)))
            console.log(instruction.as, "= Wallet", `(${global[instruction.as].address})`)
        } else if(instruction.func == "const") {
            if(instruction.path)
                global[instruction.as] = require(instruction.path)
            else
                global[instruction.as] = instruction.value
        } else if(instruction.func == "save") {
            const contracts = instruction.contracts.reduce((contracts, name) => ({ ...contracts, [name]:state.contracts[name] ?? ethers.constants.AddressZero }), {})
            writeFileSync(resolve(__dirname, `contracts.json`), JSON.stringify(contracts, undefined, 4))
        }
    }
    console.log("===================================================")
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})