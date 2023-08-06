import { BigInt, TypedMap } from "@graphprotocol/graph-ts"
import {
  ChainlinkPrice,
  UniswapPrice
} from "../generated/schema"

import * as contracts from "../../state"

export let BASIS_POINTS_DIVISOR = BigInt.fromI32(10000)
export let PRECISION = BigInt.fromI32(10).pow(30)

export let PLS = contracts.NATIVE_TOKEN
export let BTC = contracts.BTC
export let ETH = contracts.ETH
export let USDC = contracts.USDC
export let HEX = contracts.HEX
export let AXN = contracts.AXN
// export let LINK = ""
// export let UNI = ""
// export let MIM = ""
// export let SPELL = ""
// export let SUSHI = ""
// export let FRAX = ""
// export let DAI = contracts.DAI

export function timestampToDay(timestamp: BigInt): BigInt {
  return timestamp / BigInt.fromI32(86400) * BigInt.fromI32(86400)
}

export function timestampToPeriod(timestamp: BigInt, period: string): BigInt {
  let periodTime: BigInt

  if (period == "daily") {
    periodTime = BigInt.fromI32(86400)
  } else if (period == "hourly") {
    periodTime = BigInt.fromI32(3600)
  } else if (period == "weekly" ){
    periodTime = BigInt.fromI32(86400 * 7)
  } else {
    throw new Error("Unsupported period " + period)
  }

  return timestamp / periodTime * periodTime
}


export function getTokenDecimals(token: String): u8 {
  let tokenDecimals = new Map<String, i32>()
  tokenDecimals.set(PLS, 18)
  tokenDecimals.set(BTC, 8)
  tokenDecimals.set(ETH, 18)
  tokenDecimals.set(USDC, 6)
  tokenDecimals.set(HEX, 18)
  tokenDecimals.set(AXN, 18)
  // tokenDecimals.set(LINK, 18)
  // tokenDecimals.set(UNI, 18)
  // tokenDecimals.set(MIM, 18)
  // tokenDecimals.set(SPELL, 18)
  // tokenDecimals.set(SUSHI, 18)
  // tokenDecimals.set(FRAX, 18)
  // tokenDecimals.set(DAI, 18)

  return tokenDecimals.get(token) as u8
}

export function getTokenAmountUsd(token: String, amount: BigInt): BigInt {
  let decimals = getTokenDecimals(token)
  let denominator = BigInt.fromI32(10).pow(decimals)
  let price = getTokenPrice(token)
  return amount * price / denominator
}

export function getTokenPrice(token: String): BigInt {
  if (token != AXN) {
    let chainlinkPriceEntity = ChainlinkPrice.load(token)
    if (chainlinkPriceEntity != null) {
      // all chainlink prices have 8 decimals
      // adjusting them to fit AXN 30 decimals USD values
      return chainlinkPriceEntity.value * BigInt.fromI32(10).pow(22)
    }
  }

  if (token == AXN) {
    let uniswapPriceEntity = UniswapPrice.load(AXN)

    if (uniswapPriceEntity != null) {
      return uniswapPriceEntity.value
    }
  }

  let prices = new TypedMap<String, BigInt>()
  prices.set(PLS, BigInt.fromI32(14) * PRECISION / BigInt.fromI32(100))
  prices.set(ETH, BigInt.fromI32(1800) * PRECISION)
  prices.set(BTC, BigInt.fromI32(27000) * PRECISION)
  prices.set(USDC, PRECISION)
  prices.set(HEX, BigInt.fromI32(30) * PRECISION)
  prices.set(AXN, BigInt.fromI32(3) * PRECISION / BigInt.fromI32(100))
  // prices.set(LINK, BigInt.fromI32(25) * PRECISION)
  // prices.set(UNI, BigInt.fromI32(23) * PRECISION)
  // prices.set(USDT, PRECISION)
  // prices.set(MIM, PRECISION)
  // prices.set(SPELL, PRECISION / BigInt.fromI32(50)) // ~2 cents
  // prices.set(SUSHI, BigInt.fromI32(10) * PRECISION)
  // prices.set(FRAX, PRECISION)
  // prices.set(DAI, PRECISION)

  return prices.get(token) as BigInt
}
