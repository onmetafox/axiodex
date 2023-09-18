const { network } = require("hardhat")

String.prototype.interpolate = function(params) {
    const names = Object.keys(params)
    const vals = Object.values(params)
    return new Function(...names, `return \`${this}\`;`)(...vals)
}

const helpers = {
    sleep: async (seconds) => {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000))
    },
    interpolate: (scope, args) => {
        const ret = []
        for(const arg of args) {
            if(typeof arg == "string")
                ret.push(arg.interpolate(scope))
            else if(typeof arg == "object")
                ret.push(helpers.interpolate(scope, arg))
            else
                ret.push(arg)
        }
        return ret
    },
    verify: async (contract, args, retry = 3) => {
        if(["hardhat", "localhost", "devnet"].includes(network.name)) return
        console.log("/********************************************************")
        for(let i = 0;i<retry;i++) {
            try {
                await hre.run("verify:verify", {
                    address: contract.address,
                    constructorArguments: args,
                })
                break
            } catch(ex) {
                console.log("\t* Failed verify", args?.join(','), ex)
                await helpers.sleep(5)
            }
        }
        console.log("********************************************************/")                
    }
}

module.exports = helpers