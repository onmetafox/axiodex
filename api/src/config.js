const ApolloClient = require("apollo-client").ApolloClient;
const fetch = require("node-fetch");
const createHttpLink = require("apollo-link-http").createHttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;

const GRAPH_URL_ORDERS = "https://api.studio.thegraph.com/query/44624/orders-base-goerli/version/latest"
const GRAPH_URL_STATS = "https://api.studio.thegraph.com/query/44624/stats-base-goerli/version/latest"
const GRAPH_URL_PRICES = "https://api.studio.thegraph.com/query/44624/prices-base-goerli/version/latest"
const GRAPH_URL_RAW = "https://api.studio.thegraph.com/query/44624/raw-base-goerli/version/latest"

const ordersClient = new ApolloClient({
    link: createHttpLink({uri: GRAPH_URL_ORDERS, fetch}),
    cache: new InMemoryCache(),
})

const statsClient = new ApolloClient({
    link: createHttpLink({uri: GRAPH_URL_STATS, fetch}),
    cache: new InMemoryCache(),
})

const pricesClient = new ApolloClient({
    link: createHttpLink({uri: GRAPH_URL_PRICES, fetch}),
    cache: new InMemoryCache(),    
})

const rawClient = new ApolloClient({
    link: createHttpLink({uri: GRAPH_URL_RAW, fetch}),
    cache: new InMemoryCache()
})

const NOW_TS = parseInt(Date.now() / 1000)
const FIRST_DATE_TS = parseInt(+(new Date(2021, 7, 31)) / 1000)
const MOVING_AVERAGE_DAYS = 7
const MOVING_AVERAGE_PERIOD = 86400 * MOVING_AVERAGE_DAYS

const UI_VERSION = 1.01

// const CHAIN = "FANTOM"
const CHAIN = "BASE"

const TOTAL_ACTIVE_POSITION = 100;

const TRADE_PAGE_LIMIT = 100

const PERIOD_TO_SECONDS = {
    '5m': 60 * 5,
    '15m': 60 * 15,
    '1h': 60 * 60,
    '4h': 60 * 60 * 4,
    '1d': 60 * 60 * 24,
}

const BASENET = 84531

const VALID_PERIODS = new Set(Object.keys(PERIOD_TO_SECONDS))

const workers = {}

module.exports = {
    workers,
    ordersClient,
    statsClient,
    pricesClient,
    rawClient,
    FIRST_DATE_TS,
    NOW_TS,
    MOVING_AVERAGE_DAYS,
    MOVING_AVERAGE_PERIOD,
    UI_VERSION,
    CHAIN,
    TOTAL_ACTIVE_POSITION,
    TRADE_PAGE_LIMIT,
    VALID_PERIODS,
    PERIOD_TO_SECONDS,
    BASENET
}