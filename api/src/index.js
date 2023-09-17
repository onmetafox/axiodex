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

for(const model of [ 'candles', /*'prices', 'app-stats', 'ui_version', 'mmy-supply', 'trades', 'orders_indices'*/ ]) {
    try {
        const subapp = require(`./model/${model}.js`)
        app.use(`/api/${model}`, subapp)
    } catch(ex) {}
}

for(const model of [ 'candles', /*'prices', 'swap', 'position' */]) {
    try {
        const path = resolve('./src/workers', `${model}.js`)
        workers[model] = new Worker(path, {
            workerData: {
                contracts
            }
        })
    } catch(ex) {}
}
 
const port =  process.env.PORT || 8000;
app.listen(port, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Server listening on port ' + port)
    }
})

