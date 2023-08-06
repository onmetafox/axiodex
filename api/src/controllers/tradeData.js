const gql = require("graphql-tag");
const orderBy = require("lodash").orderBy;

const rawClient = require("../config").rawClient;
const pageLimit = require("../config").TRADE_PAGE_LIMIT;

const getTradeData = async (account, after) => {
  let prevData = await decreasePosition(account);
  prevData = await increasePosition(account, prevData);
  prevData = await liquidatePositions(account, prevData);
  prevData = await createDecreasePosition(account, prevData);
  prevData = await createIncreasePosition(account, prevData);
  prevData = await liquidatePositions(account, prevData);

  const totalData = await swap(account, prevData);

  let sortedData = [];
  
  let index = 1;
  let startFlag = false;
  totalData ? orderBy(totalData, i => i.timestamp, 'desc').map(item => {
    if (after) {
      if (startFlag) {
        if (index > pageLimit)
          return sortedData;

        sortedData.push(item);
        index ++;
      }

      if (item.txhash == after) {
        startFlag = true;
      }
    }
    else {
      if (index > pageLimit)
        return sortedData;
      sortedData.push(item);
      index ++;
    }
  }) : null

  return sortedData;
}

async function decreasePosition(account) {
  const tradeQuery = `{
    decreasePositions(
        first: 1000
        orderBy: timestamp
        orderDirection: desc
        where: {account: "${account}"}
      ) {
        id
        account
        collateralDelta
        collateralToken
        fee
        indexToken
        isLong
        key
        price
        sizeDelta
        timestamp
      }
    }`

  const query = gql(tradeQuery);

  const totalData = [];
  try {
    const result = await rawClient.query({
      query
    });

    result.data.decreasePositions.map(dataItem => {
      const item = {
        "action": "DecreasePosition",
        "txhash": dataItem.id,
        "account": dataItem.account,
        "sizeDelta": dataItem.sizeDelta,
        "fee": dataItem.fee,
        "price": dataItem.price,
        "isLong": dataItem.isLong,
        "key": dataItem.key,
        "indexToken": dataItem.indexToken,
        "collateralToken": dataItem.collateralToken,
        "collateralDelta": dataItem.collateralDelta,
        "timestamp": dataItem.timestamp
      }

      totalData.push(item);
    })

    return totalData;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function createDecreasePosition(account, prevData) {
  const tradeQuery = `{
    createDecreasePositions(
        first: 1000
        orderBy: timestamp
        orderDirection: desc
        where: {account: "${account}"}
      ) {
        acceptablePrice
        account
        collateralToken
        executionFee
        id
        indexToken
        isLong
        sizeDelta
        timestamp
      }
    }`

  const query = gql(tradeQuery);

  try {
    const result = await rawClient.query({
      query
    });

    result.data.createDecreasePositions.map(dataItem => {
      const item = {
        "action": "CreateDecreasePosition",
        "txhash": dataItem.id,
        "account": dataItem.account,
        "sizeDelta": dataItem.sizeDelta,
        "collateralToken": dataItem.collateralToken,
        "executionFee": dataItem.executionFee,
        "indexToken": dataItem.indexToken,
        "isLong": dataItem.isLong,
        "acceptablePrice": dataItem.acceptablePrice,
        "timestamp": dataItem.timestamp
      }

      prevData.push(item);
    })

    return prevData;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function increasePosition(account, prevData) {
  const tradeQuery = `{
    increasePositions(
      first: 1000
      orderBy: timestamp
      orderDirection: desc
      where: {account: "${account}"}
    ) {
      account
      collateralDelta
      collateralToken
      fee
      id
      indexToken
      isLong
      key
      price
      sizeDelta
      timestamp
    }
  }`

  const query = gql(tradeQuery);
  try {
    const result = await rawClient.query({
      query
    });

    result.data.increasePositions.map(dataItem => {
      const item = {
        "action": "IncreasePosition",
        "txhash": dataItem.id,
        "account": dataItem.account,
        "sizeDelta": dataItem.sizeDelta,
        "fee": dataItem.fee,
        "price": dataItem.price,
        "isLong": dataItem.isLong,
        "key": dataItem.key,
        "indexToken": dataItem.indexToken,
        "collateralToken": dataItem.collateralToken,
        "collateralDelta": dataItem.collateralDelta,
        "timestamp": dataItem.timestamp
      }

      prevData.push(item);
    })
    return prevData;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function createIncreasePosition(account, prevData) {
  const tradeQuery = `{
    createIncreasePositions(
        first: 1000
        orderBy: timestamp
        orderDirection: desc
        where: {account: "${account}"}
      ) {
        id
        acceptablePrice
        account
        amountIn
        collateralToken
        executionFee
        indexToken
        isLong
        sizeDelta
        timestamp
      }
    }`

  const query = gql(tradeQuery);

  const totalData = [];
  try {
    const result = await rawClient.query({
      query
    });

    result.data.createIncreasePositions.map(dataItem => {
      const item = {
        "action": "CreateIncreasePosition",
        "txhash": dataItem.id,
        "account": dataItem.account,
        "sizeDelta": dataItem.sizeDelta,
        "collateralToken": dataItem.collateralToken,
        "executionFee": dataItem.executionFee,
        "indexToken": dataItem.indexToken,
        "isLong": dataItem.isLong,
        "acceptablePrice": dataItem.acceptablePrice,
        "timestamp": dataItem.timestamp
      }

      prevData.push(item);
    })

    return prevData;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function liquidatePositions(account, prevData) {
  const tradeQuery = `{
    liquidatePositions(
        first: 1000
        orderBy: timestamp
        orderDirection: desc
        where: {account: "${account}"}
      ) {
        account
        collateral
        collateralToken
        id
        indexToken
        isLong
        key
        markPrice
        realisedPnl
        reserveAmount
        size
        timestamp
      }
    }`

  const query = gql(tradeQuery);
  try {
    const result = await rawClient.query({
      query
    });

    result.data.liquidatePositions.map(dataItem => {
      const item = {
        "action": "LiquidatePosition",
        "txhash": dataItem.id,
        "account": dataItem.account,
        "size": dataItem.size,
        "collateral": dataItem.collateral,
        "reserveAmount": dataItem.reserveAmount,
        "markPrice": dataItem.markPrice,
        "key": dataItem.key,
        "isLong": dataItem.isLong,
        "indexToken": dataItem.indexToken,
        "collateralToken": dataItem.collateralToken,
        "timestamp": dataItem.timestamp
      }

      prevData.push(item);
    })
    return prevData;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function swap(account, prevData) {
  const tradeQuery = `{
    swaps(
        first: 1000
        orderBy: timestamp
        orderDirection: desc
        where: {account: "${account}"}
      ) {
        account
        amountIn
        amountOut
        amountOutAfterFees
        feeBasisPoints
        id
        timestamp
        tokenIn
        tokenOut
      }
    }`

  const query = gql(tradeQuery);
  try {
    const result = await rawClient.query({
      query
    });

    result.data.swaps.map(dataItem => {
      const item = {
        "action": "Swap",
        "txhash": dataItem.id,
        "tokenIn": dataItem.tokenIn,
        "tokenOut": dataItem.tokenOut,
        "feeBasisPoints": dataItem.feeBasisPoints,
        "amountIn": dataItem.amountIn,
        "amountOut": dataItem.amountOut,
        "amountOutAfterFees": dataItem.amountOutAfterFees,
        "timestamp": dataItem.timestamp
      }

      prevData.push(item);
    })
    return prevData;
  } catch (err) {
    console.log(err);
    return [];
  }
}

module.exports = {
  getTradeData,
}