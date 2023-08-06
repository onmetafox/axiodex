const gql = require("graphql-tag");
const statsClient = require("../config").statsClient;

const getUserState = async () => {
    const querySource = `{
        userStats(
            first: 10
            orderBy: timestamp
            orderDirection: desc
        ) {
            uniqueCountCumulative
        }
    }`

    const query = gql(querySource);

    try {
        const result = await statsClient.query({
            query
        });

        return result.data.userStats;
    } catch (err) {
        console.log(err);
        return {};
    }
}

module.exports = {
    getUserState,
}