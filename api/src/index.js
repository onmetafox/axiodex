const express = require('express')
const app = express()
const cors = require('cors')
const { Worker } = require("worker_threads")
const { resolve } = require('path')
const contracts = require('./contracts.json')
const { workers } = require('./config')

app.use(cors({
    origin: '*'
}))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(express.static(__dirname + '/public'))

for(const model of [ 'candles', 'prices', /*'app-stats', 'ui_version', 'mmy-supply', 'trades', 'orders_indices'*/ ]) {
    try {
        const subapp = require(`./model/${model}.js`)
        app.use(`/api/${model}`, subapp)
    } catch(ex) {}
}

// for(const model of [ 'prices', 'swap', 'candles', 'position' ]) {
//     try {
//         const path = resolve('./src/workers', `${model}.js`)
//         workers[model] = new Worker(path, {
//             workerData: {
//                 contracts
//             }
//         })
//     } catch(ex) {}
// }
 
app.listen(process.env.PORT || 3011)

