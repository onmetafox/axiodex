const gql = require("graphql-tag");
const chain = require("lodash").chain;
const sumBy = require("lodash").sumBy;
const sortBy = require("lodash").sortBy;

const statsClient = require("../config").statsClient;
const from = require("../config").FIRST_DATE_TS;
const to = require("../config").NOW_TS;
const movingAverageDays = require("../config").MOVING_AVERAGE_DAYS;

const BigNumber = require('ethers').BigNumber;

const getFeeState = async () => {
	const PROPS = 'margin liquidation swap mint burn'.split(' ');

	const feesQuery = `{
		feeStats(
		  first: 1000
		  orderBy: id
		  orderDirection: desc
		  where: { period: daily, id_gte: ${from}, id_lte: ${to} }
		  subgraphError: allow
		) {
		  id
		  margin
		  marginAndLiquidation
		  swap
		  mint
		  burn
		}
	}`

	const query = gql(feesQuery);

	try {
		const result = await statsClient.query({
		  query
		});

		let chartData = sortBy(result.data.feeStats, 'id').map(item => {
			const ret = { timestamp: item.timestamp || item.id };

			PROPS.forEach(prop => {
				if (item[prop]) {
				  ret[prop] = item[prop]
				}
			})

			ret.liquidation = BigNumber.from(item.marginAndLiquidation).sub(BigNumber.from(item.margin))
			ret.all = PROPS.reduce((memo, prop) => BigNumber.from(memo).add(BigNumber.from(ret[prop])), 0)
			return ret
		})

		let cumulative = BigNumber.from(0)
		const cumulativeByTs = {}

		const feesChartData = chain(chartData)
	      .groupBy(item => item.timestamp)
	      .map((values, timestamp) => {
	        const all = sumBy(values, 'all')
	        cumulative = cumulative.add(BigNumber.from(all))

	        let movingAverageAll
	        const movingAverageTs = timestamp - movingAverageDays
	        if (movingAverageTs in cumulativeByTs) {
	          movingAverageAll = (cumulative.sub(BigNumber.from(cumulativeByTs[movingAverageTs])) ).div(BigNumber.from(movingAverageDays))
	        }

	        const ret = {
	          timestamp: Number(timestamp),
	          all,
	          cumulative,
	          movingAverageAll
	        }
	        PROPS.forEach(prop => {
	           ret[prop] = sumBy(values, prop)
	        })
	        cumulativeByTs[timestamp] = cumulative
	        return ret
	      })
	      .value()
	      .filter(item => item.timestamp >= from)

        return feesChartData;
	} catch (err) {
		console.log(err);
		return {};
	}
}

module.exports = {
    getFeeState,
}