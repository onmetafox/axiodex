const gql = require("graphql-tag");
const sortBy = require("lodash").sortBy;

const statsClient = require("../config").statsClient;
const from = require("../config").FIRST_DATE_TS;
const to = require("../config").NOW_TS;
const movingAverageDays = require("../config").MOVING_AVERAGE_DAYS;
const BigNumber = require('ethers').BigNumber;

const getVolumeState = async () => {
	const PROPS = 'margin liquidation swap mint burn'.split(' ');
	const timestampProp = "timestamp"
	const volumeQuery = `{
		volumeStats(
		  first: 1000,
		  orderBy: timestamp,
		  orderDirection: desc
		  where: { period: daily, ${timestampProp}_gte: ${from}, ${timestampProp}_lte: ${to} }
		  subgraphError: allow
		) {
		  ${timestampProp}
		  ${PROPS.join('\n')}
		}
	}`

	const query = gql(volumeQuery);
	try {
		const result = await statsClient.query({
		  query
		});

	    let ret =  sortBy(result.data.volumeStats, timestampProp).map(item => {
	      const ret = { timestamp: item[timestampProp] };
	      let all = BigNumber.from(0);
	      PROPS.forEach(prop => {
            ret[prop] = item[prop]
	        all = all.add(BigNumber.from(ret[prop]))
	      })
	      ret.all = all
	      return ret
	    })

	    let cumulative = BigNumber.from(0)
	    const cumulativeByTs = {}

		const volumeData = ret.map(item => {
	      cumulative = cumulative.add(item.all)

	      let movingAverageAll
	      const movingAverageTs = item.timestamp - movingAverageDays
	      if (movingAverageTs in cumulativeByTs) {
	        movingAverageAll = (cumulative.sub(cumulativeByTs[movingAverageTs])).div(BigNumber.from(movingAverageDays))
	      }

	      return {
	        movingAverageAll,
	        cumulative,
	        ...item
	      }
	    })

	    return volumeData;
	} catch (err) {
		console.log(err);
		return {};
	}
}

module.exports = {
    getVolumeState,
}