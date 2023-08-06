const gql = require("graphql-tag");
const statsClient = require("../config").statsClient;

const getOrderData = async (account) => {
    const result = {
        "Swap": [],
        "Increase": [],
        "Decrease": [],
      }

    return result;
}

module.exports = {
    getOrderData,
}