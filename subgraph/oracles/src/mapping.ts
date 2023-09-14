import { BigInt, log } from "@graphprotocol/graph-ts"
import { UpdateAnswer } from "../generated/PriceFeedBTC/PriceFeed"
import { ChainlinkPrice, PriceCandle } from "../generated/schema"

function timestampToPeriodStart(timestamp: BigInt, period: string): BigInt {
  let seconds = periodToSeconds(period)
  return timestamp.div(seconds).times(seconds)

}
function periodToSeconds(period: string): BigInt {
  let seconds: BigInt
  if (period == "5m") {
    seconds = BigInt.fromI32(5 * 60)
  } else if (period == "15m") {
    seconds = BigInt.fromI32(15 * 60)
  } else if (period == "1h") {
    seconds = BigInt.fromI32(60 * 60)
  } else if (period == "4h") {
    seconds = BigInt.fromI32(4 * 60 * 60)
  } else if (period == "1d") {
    seconds = BigInt.fromI32(24 * 60 * 60)
  } else {
    throw new Error("Invalid period")
  }
  return seconds
}


function getId(token: String, period: string, periodStart: BigInt): string {
  return token + ":" + period + ":" + periodStart.toString()
}

function updateCandle(entity: ChainlinkPrice, period: string): void {
  let periodStart = timestampToPeriodStart(BigInt.fromI32(entity.timestamp), period)
  let id = getId(entity.token, period, periodStart)
  let prevId = entity.token + ":" + period + ":last"
  let candle = PriceCandle.load(id)

  let lastCandle = PriceCandle.load(prevId)

  if (candle == null) {
    candle = new PriceCandle(id)
    
    candle.period = period
    candle.timestamp = periodStart.toI32()
    
    let price = entity.price
    if (lastCandle != null) {
      price = lastCandle.close
    }
    candle.open = price
    candle.high = price
    candle.low = price
    candle.token = entity.token
  }
  if (candle.high.lt(entity.price)) {
    candle.high = entity.price
  }
  if (candle.low.gt(entity.price)) {
    candle.low = entity.price
  }
  candle.close = entity.price

  if(lastCandle == null) {
    lastCandle = new PriceCandle(prevId)
    lastCandle.token = entity.token
    lastCandle.open = BigInt.fromI32(0)
    lastCandle.high = BigInt.fromI32(0)
    lastCandle.low = BigInt.fromI32(0)
    lastCandle.timestamp = 0
    lastCandle.period = "last"
  }
  lastCandle.close = entity.price
  lastCandle.save()

  // log.debug("*** updatedCandle {} {} {} {} {}", [candle.id, candle.open.toString(), candle.high.toString(), candle.low.toString(), candle.close.toString(),])

  candle.save()
}

function updateChainlinkPrice(token: string, price: BigInt, timestamp: BigInt, blockNumber: BigInt, asUSD: boolean = true): void {
  let entity = new ChainlinkPrice(token)
  entity.price = price
  entity.token = token
  entity.timestamp = timestamp.toI32()
  entity.blockNumber = blockNumber.toI32()
  if(asUSD) entity.save()

  updateCandle(entity, "5m")
  updateCandle(entity, "15m")
  updateCandle(entity, "1h")
  updateCandle(entity, "4h")
  updateCandle(entity, "1d")
}

export function handleAnswerUpdatedBTC(event: UpdateAnswer): void {
  updateChainlinkPrice("BTC", event.params._answer, event.block.timestamp, event.block.number)
}

export function handleAnswerUpdatedETH(event: UpdateAnswer): void {
  updateChainlinkPrice("ETH", event.params._answer, event.block.timestamp, event.block.number)
}

export function handleAnswerUpdatedHEX(event: UpdateAnswer): void {
  updateChainlinkPrice("HEX", event.params._answer, event.block.timestamp, event.block.number)
}

export function handleAnswerUpdatedPLS(event: UpdateAnswer): void {
  updateChainlinkPrice("PLS", event.params._answer, event.block.timestamp, event.block.number)
}

export function handleAnswerUpdatedUSDC(event: UpdateAnswer): void {
  updateChainlinkPrice("USDC", event.params._answer, event.block.timestamp, event.block.number)
}