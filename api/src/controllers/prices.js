const gql = require("graphql-tag");
const pricesClient = require("../config").pricesClient;


const getPrices = async () => {
	const priceQuery = `{
        chainlinkPrices {
            price
            token
        }
    }`

	const query = gql(priceQuery);

	try {
		const result = await pricesClient.query({
		  query, fetchPolicy: 'no-cache'
		});

        const tokenPrices = {}
        result.data.chainlinkPrices.map(item => {
            tokenPrices[item.token] = item.price + "0000000000000000000000"; //Number(item.value * 1e22).toLocaleString('fullwide', { useGrouping: false });
        })

        return tokenPrices;
	} catch (err) {
		console.log(err);
		return {};
	}
}

module.exports = {
    getPrices,
}