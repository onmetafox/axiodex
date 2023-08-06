import {
  BigInt,
  Address,
  // TypedMap,
  // ethereum,
  // store,
  // log
} from "@graphprotocol/graph-ts"
import {
  CreateIncreaseOrder,
  CreateDecreaseOrder,
  CreateSwapOrder,
  UpdateIncreaseOrder,
  UpdateDecreaseOrder,
  UpdateSwapOrder,
  CancelIncreaseOrder,
  CancelDecreaseOrder,
  CancelSwapOrder,
  ExecuteIncreaseOrder,
  ExecuteDecreaseOrder,
  ExecuteSwapOrder
} from "../generated/OrderBook/OrderBook"

import {
  Order,
  OrderStat
} from "../generated/schema"

// import {
//   getTokenAmountUsd
// } from "./helpers"

function _getId(account: Address, type: string, index: BigInt): string {
  let id = account.toHexString() + "-" + type + "-" + index.toString()
  return id
}

function _storeStats(incrementProp: string, decrementProp: string | null): void {
  let entity = OrderStat.load("total")
  if (entity == null) {
    entity = new OrderStat("total")
    entity.openSwap = 0 as i32
    entity.openIncrease = 0 as i32
    entity.openDecrease = 0 as i32
    entity.cancelledSwap = 0 as i32
    entity.cancelledIncrease = 0 as i32
    entity.cancelledDecrease = 0 as i32
    entity.executedSwap = 0 as i32
    entity.executedIncrease = 0 as i32
    entity.executedDecrease = 0 as i32
    entity.period = "total"
  }

  entity.setI32(incrementProp, entity.getI32(incrementProp) + 1)
  if (decrementProp != null) {
    entity.setI32(decrementProp, entity.getI32(decrementProp) - 1)
  }

  entity.save()
}

function _handleCreateOrder(
  type: string,
  account: Address,
  index: BigInt,
  size: BigInt,
  path: Address[] | null,
  indexToken: Address | null,
  isLong: boolean,
  triggerAboveThreshold: boolean,
  triggerRatio: BigInt,
  timestamp: BigInt
): void {
  let id = _getId(account, type, index)
  let order = new Order(id)
  
  order.type = type
  order.account = account.toHexString()
  order.index = index
  order.size = size
  if(path != null)
    order.path = path.map<string>((token: Address) => {
      return token.toHexString()
    })
  else
    order.path = []
  order.indexToken = indexToken!.toHexString()
  order.isLong = isLong
  order.triggerAboveThreshold = triggerAboveThreshold
  order.triggerRatio = triggerRatio
  order.status = "open"
  order.createdTimestamp = timestamp.toI32()

  order.save()
}

function _handleUpdateOrder(
  type: string,
  account: Address,
  index: BigInt,
  size: BigInt,
  indexToken: Address | null,
  isLong: boolean,
  triggerAboveThreshold: boolean,
  triggerRatio: BigInt,
  timestamp: BigInt
): void {
  let id = _getId(account, type, index)
  let order = Order.load(id)
  if(order != null) {
    order.type = type
    order.account = account.toHexString()
    order.index = index
    order.size = size
    order.indexToken = indexToken!.toHexString()
    order.isLong = isLong
    order.triggerAboveThreshold = triggerAboveThreshold
    order.triggerRatio = triggerRatio
    order.status = "open"
    order.updatedTimestamp = timestamp.toI32()

    order.save()
  }
}

function _handleCancelOrder(type: string, account: Address, index: BigInt, timestamp: BigInt): void {
  let id = account.toHexString() + "-" + type + "-" + index.toString()
  let order = Order.load(id)

  if(order != null) {
    order.status = "cancelled"
    order.cancelledTimestamp = timestamp.toI32()

    order.save()
  }
}

function _handleExecuteOrder(type: string, account: Address, index: BigInt, timestamp: BigInt): void {
  let id = account.toHexString() + "-" + type + "-" + index.toString()
  let order = Order.load(id)

  if(order != null) {
    order.status = "executed"
    order.executedTimestamp = timestamp.toI32()

    order.save()
  }
}

export function handleCreateIncreaseOrder(event: CreateIncreaseOrder): void {
  _handleCreateOrder(
    "increase", 
    event.params.account, 
    event.params.orderIndex, 
    event.params.sizeDelta, 
    null, 
    event.params.indexToken, 
    event.params.isLong, 
    event.params.triggerAboveThreshold, 
    event.params.triggerPrice, 
    event.block.timestamp
  );
  _storeStats("openIncrease", null)
}

export function handleUpdateIncreaseOrder(event: UpdateIncreaseOrder): void {
  _handleUpdateOrder(
    "increase", 
    event.params.account, 
    event.params.orderIndex, 
    event.params.sizeDelta, 
    event.params.indexToken, 
    event.params.isLong, 
    event.params.triggerAboveThreshold, 
    event.params.triggerPrice, 
    event.block.timestamp
  );
}

export function handleCancelIncreaseOrder(event: CancelIncreaseOrder): void {
  _handleCancelOrder("increase", event.params.account, event.params.orderIndex, event.block.timestamp);
  _storeStats("cancelledIncrease", "openIncrease")
}

export function handleExecuteIncreaseOrder(event: ExecuteIncreaseOrder): void {
  _handleExecuteOrder("increase", event.params.account, event.params.orderIndex, event.block.timestamp);
  _storeStats("executedIncrease", "openIncrease")
}

export function handleCreateDecreaseOrder(event: CreateDecreaseOrder): void {
  _handleCreateOrder(
    "decrease", 
    event.params.account, 
    event.params.orderIndex, 
    event.params.sizeDelta, 
    null, 
    event.params.indexToken, 
    event.params.isLong, 
    event.params.triggerAboveThreshold, 
    event.params.triggerPrice, 
    event.block.timestamp
  );
  _storeStats("openDecrease", null)
}

export function handleUpdateDecreaseOrder(event: UpdateDecreaseOrder): void {
  _handleUpdateOrder(
    "decrease", 
    event.params.account, 
    event.params.orderIndex, 
    event.params.sizeDelta, 
    event.params.indexToken, 
    event.params.isLong, 
    event.params.triggerAboveThreshold, 
    event.params.triggerPrice, 
    event.block.timestamp
  );
}

export function handleCancelDecreaseOrder(event: CancelDecreaseOrder): void {
  _handleCancelOrder("decrease", event.params.account, event.params.orderIndex, event.block.timestamp);
  _storeStats("cancelledDecrease", "openDecrease")
}

export function handleExecuteDecreaseOrder(event: ExecuteDecreaseOrder): void {
  _handleExecuteOrder("decrease", event.params.account, event.params.orderIndex, event.block.timestamp);
  _storeStats("executedDecrease", "openDecrease")
}

export function handleCreateSwapOrder(event: CreateSwapOrder): void {
  // let path = event.params.path
  // let size = getTokenAmountUsd(path[0].toHexString(), event.params.amountIn)
  _handleCreateOrder(
    "swap", 
    event.params.account, 
    event.params.orderIndex, 
    event.params.amountIn, 
    event.params.path, 
    null, 
    false, 
    event.params.triggerAboveThreshold, 
    event.params.triggerRatio, 
    event.block.timestamp
  );
  _storeStats("openSwap", null)
}

export function handleUpdateSwapOrder(event: UpdateSwapOrder): void {
  // let path = event.params.path
  // let size = getTokenAmountUsd(path[0].toHexString(), event.params.amountIn)
  _handleUpdateOrder(
    "swap", 
    event.params.account, 
    event.params.ordexIndex, 
    event.params.amountIn, 
    null, 
    false, 
    event.params.triggerAboveThreshold, 
    event.params.triggerRatio, 
    event.block.timestamp
  );
  _storeStats("openSwap", null)
}

export function handleCancelSwapOrder(event: CancelSwapOrder): void {
  _handleCancelOrder("swap", event.params.account, event.params.orderIndex, event.block.timestamp);
  _storeStats("cancelledSwap", "openSwap")
}

export function handleExecuteSwapOrder(event: ExecuteSwapOrder): void {
  _handleExecuteOrder("swap", event.params.account, event.params.orderIndex, event.block.timestamp);
  _storeStats("executedSwap", "openSwap")
}
