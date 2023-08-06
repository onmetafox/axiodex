const gql = require("graphql-tag");
const sortBy = require("lodash").sortBy;

const statsClient = require("../config").statsClient;
const BigNumber = require('ethers').BigNumber;

const secondsPerHour = 60 * 60;
const to = parseInt(Date.now() / 1000);
const from = parseInt(Date.now() / 1000 / secondsPerHour) * secondsPerHour - 24 * secondsPerHour;

const getHourlyVolume = async () => {
	const PROPS = 'margin liquidation swap mint burn'.split(' ');
	const hourlyVolumeQuery = `{
		hourlyVolumeByTokens(
		  first: 1000,
		  orderBy: timestamp,
		  orderDirection: desc
		  where: { timestamp_gte: ${from}, timestamp_lte: ${to} }
		  subgraphError: allow
		) {
          timestamp
		  ${PROPS.join('\n')}
		}
	}`

	const query = gql(hourlyVolumeQuery);
	try {
		const result = await statsClient.query({
		  query
		});

	    let ret =  sortBy(result.data.hourlyVolumeByTokens, 'timestamp').map(item => {
	      const ret = { timestamp: item.timestamp };
	      let all = BigNumber.from(0);
	      PROPS.forEach(prop => {
            ret[prop] = item[prop]
	        all = all.add(BigNumber.from(ret[prop]))
	      })
	      ret.all = all
	      return ret
	    })

	    let cumulative = BigNumber.from(0)

		const hourlyVolumeData = ret.map(item => {
	      cumulative = cumulative.add(item.all)

	      return {
	        cumulative,
	        ...item
	      }
	    })

	    return hourlyVolumeData;
	} catch (err) {
		console.log(err);
		return {};
	}
}

module.exports = {
    getHourlyVolume,
}