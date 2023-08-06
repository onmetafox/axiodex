const gql = require("graphql-tag");
const sortBy = require("lodash").sortBy;

const statsClient = require("../config").statsClient;
const from = require("../config").FIRST_DATE_TS;
const to = require("../config").NOW_TS;

const BigNumber = require('ethers').BigNumber;

const getTradeState = async () => {
	const tradeQuery = `{
        tradingStats(
            first: 1000
            orderBy: timestamp
            orderDirection: desc
            where: { period: "daily", timestamp_gte: ${from}, timestamp_lte: ${to} }
            subgraphError: allow
          ) {
            timestamp
            longOpenInterest
            shortOpenInterest
          }
	    }`

	const query = gql(tradeQuery);

	try {
		const result = await statsClient.query({
		  query
		});

        let ret = null

        const data = result ? sortBy(result.data.tradingStats, i => i.timestamp).map(dataItem => {
            const longOpenInterest = BigNumber.from(dataItem.longOpenInterest)
            const shortOpenInterest = BigNumber.from(dataItem.shortOpenInterest)
            const openInterest = longOpenInterest.add(shortOpenInterest)
        
            return {
              longOpenInterest,
              shortOpenInterest,
              openInterest
            }
          }) : null

        if (data) {
            ret = {
                data
            }

            return ret;
        }
	} catch (err) {
		console.log(err);
		return {};
	}
}

module.exports = {
    getTradeState,
}