const { BigNumber } = require("ethers");

function expandDecimals(n, decimals) {
  // @ts-ignore
  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals));
}

module.exports = expandDecimals;