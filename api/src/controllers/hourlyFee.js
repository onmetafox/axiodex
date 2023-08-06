const gql = require("graphql-tag");
const sortBy = require("lodash").sortBy;

const statsClient = require("../config").statsClient;
const BigNumber = require('ethers').BigNumber;

const secondsPerHour = 60 * 60;
const to = parseInt(Date.now() / 1000);
const from = parseInt(Date.now() / 1000 / secondsPerHour) * secondsPerHour - 24 * secondsPerHour;

const getHourlyFee = async () => {
	const PROPS = 'margin liquidation swap mint burn'.split(' ');
	const hourlyFees = `{
		hourlyFees(
		  first: 1000,
		  orderBy: id,
		  orderDirection: desc
		  where: { id_gte: ${from}, id_lte: ${to} }
		  subgraphError: allow
		) {
          id
		  ${PROPS.join('\n')}
		}
	}`

	const query = gql(hourlyFees);
	try {
		const result = await statsClient.query({
		  query
		});

	    let ret =  sortBy(result.data.hourlyFees, 'id').map(item => {
	      const ret = { timestamp: item.id };
	      let all = BigNumber.from(0);
	      PROPS.forEach(prop => {
            ret[prop] = item[prop]
	        all = all.add(BigNumber.from(ret[prop]))
	      })
	      ret.all = all
	      return ret
	    })

	    let cumulative = BigNumber.from(0)

		const hourlyFeeData = ret.map(item => {
	      cumulative = cumulative.add(item.all)

	      return {
	        cumulative,
	        ...item
	      }
	    })

	    return hourlyFeeData;
	} catch (err) {
		console.log(err);
		return {};
	}
}

module.exports = {
    getHourlyFee,
}