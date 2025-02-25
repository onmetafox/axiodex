// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class AddLiquidity extends ethereum.Event {
  get params(): AddLiquidity__Params {
    return new AddLiquidity__Params(this);
  }
}

export class AddLiquidity__Params {
  _event: AddLiquidity;

  constructor(event: AddLiquidity) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get token(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get aumInUsdg(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get alpSupply(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get usdgAmount(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get mintAmount(): BigInt {
    return this._event.parameters[6].value.toBigInt();
  }
}

export class RemoveLiquidity extends ethereum.Event {
  get params(): RemoveLiquidity__Params {
    return new RemoveLiquidity__Params(this);
  }
}

export class RemoveLiquidity__Params {
  _event: RemoveLiquidity;

  constructor(event: RemoveLiquidity) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get token(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get alpAmount(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get aumInUsdg(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get alpSupply(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get usdgAmount(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get amountOut(): BigInt {
    return this._event.parameters[6].value.toBigInt();
  }
}

export class AlpManager extends ethereum.SmartContract {
  static bind(address: Address): AlpManager {
    return new AlpManager("AlpManager", address);
  }

  MAX_COOLDOWN_DURATION(): BigInt {
    let result = super.call(
      "MAX_COOLDOWN_DURATION",
      "MAX_COOLDOWN_DURATION():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_MAX_COOLDOWN_DURATION(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "MAX_COOLDOWN_DURATION",
      "MAX_COOLDOWN_DURATION():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  PRICE_PRECISION(): BigInt {
    let result = super.call(
      "PRICE_PRECISION",
      "PRICE_PRECISION():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_PRICE_PRECISION(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "PRICE_PRECISION",
      "PRICE_PRECISION():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  USDG_DECIMALS(): BigInt {
    let result = super.call("USDG_DECIMALS", "USDG_DECIMALS():(uint256)", []);

    return result[0].toBigInt();
  }

  try_USDG_DECIMALS(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "USDG_DECIMALS",
      "USDG_DECIMALS():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  addLiquidity(
    _token: Address,
    _amount: BigInt,
    _minUsdg: BigInt,
    _minAlp: BigInt
  ): BigInt {
    let result = super.call(
      "addLiquidity",
      "addLiquidity(address,uint256,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(_token),
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromUnsignedBigInt(_minUsdg),
        ethereum.Value.fromUnsignedBigInt(_minAlp)
      ]
    );

    return result[0].toBigInt();
  }

  try_addLiquidity(
    _token: Address,
    _amount: BigInt,
    _minUsdg: BigInt,
    _minAlp: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "addLiquidity",
      "addLiquidity(address,uint256,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(_token),
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromUnsignedBigInt(_minUsdg),
        ethereum.Value.fromUnsignedBigInt(_minAlp)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  addLiquidityForAccount(
    _fundingAccount: Address,
    _account: Address,
    _token: Address,
    _amount: BigInt,
    _minUsdg: BigInt,
    _minAlp: BigInt
  ): BigInt {
    let result = super.call(
      "addLiquidityForAccount",
      "addLiquidityForAccount(address,address,address,uint256,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(_fundingAccount),
        ethereum.Value.fromAddress(_account),
        ethereum.Value.fromAddress(_token),
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromUnsignedBigInt(_minUsdg),
        ethereum.Value.fromUnsignedBigInt(_minAlp)
      ]
    );

    return result[0].toBigInt();
  }

  try_addLiquidityForAccount(
    _fundingAccount: Address,
    _account: Address,
    _token: Address,
    _amount: BigInt,
    _minUsdg: BigInt,
    _minAlp: BigInt
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "addLiquidityForAccount",
      "addLiquidityForAccount(address,address,address,uint256,uint256,uint256):(uint256)",
      [
        ethereum.Value.fromAddress(_fundingAccount),
        ethereum.Value.fromAddress(_account),
        ethereum.Value.fromAddress(_token),
        ethereum.Value.fromUnsignedBigInt(_amount),
        ethereum.Value.fromUnsignedBigInt(_minUsdg),
        ethereum.Value.fromUnsignedBigInt(_minAlp)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  aumAddition(): BigInt {
    let result = super.call("aumAddition", "aumAddition():(uint256)", []);

    return result[0].toBigInt();
  }

  try_aumAddition(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("aumAddition", "aumAddition():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  aumDeduction(): BigInt {
    let result = super.call("aumDeduction", "aumDeduction():(uint256)", []);

    return result[0].toBigInt();
  }

  try_aumDeduction(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("aumDeduction", "aumDeduction():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  cooldownDuration(): BigInt {
    let result = super.call(
      "cooldownDuration",
      "cooldownDuration():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_cooldownDuration(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "cooldownDuration",
      "cooldownDuration():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getAum(maximise: boolean): BigInt {
    let result = super.call("getAum", "getAum(bool):(uint256)", [
      ethereum.Value.fromBoolean(maximise)
    ]);

    return result[0].toBigInt();
  }

  try_getAum(maximise: boolean): ethereum.CallResult<BigInt> {
    let result = super.tryCall("getAum", "getAum(bool):(uint256)", [
      ethereum.Value.fromBoolean(maximise)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getAumInUsdg(maximise: boolean): BigInt {
    let result = super.call("getAumInUsdg", "getAumInUsdg(bool):(uint256)", [
      ethereum.Value.fromBoolean(maximise)
    ]);

    return result[0].toBigInt();
  }

  try_getAumInUsdg(maximise: boolean): ethereum.CallResult<BigInt> {
    let result = super.tryCall("getAumInUsdg", "getAumInUsdg(bool):(uint256)", [
      ethereum.Value.fromBoolean(maximise)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  getAums(): Array<BigInt> {
    let result = super.call("getAums", "getAums():(uint256[])", []);

    return result[0].toBigIntArray();
  }

  try_getAums(): ethereum.CallResult<Array<BigInt>> {
    let result = super.tryCall("getAums", "getAums():(uint256[])", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigIntArray());
  }

  alp(): Address {
    let result = super.call("alp", "alp():(address)", []);

    return result[0].toAddress();
  }

  try_alp(): ethereum.CallResult<Address> {
    let result = super.tryCall("alp", "alp():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  gov(): Address {
    let result = super.call("gov", "gov():(address)", []);

    return result[0].toAddress();
  }

  try_gov(): ethereum.CallResult<Address> {
    let result = super.tryCall("gov", "gov():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  inPrivateMode(): boolean {
    let result = super.call("inPrivateMode", "inPrivateMode():(bool)", []);

    return result[0].toBoolean();
  }

  try_inPrivateMode(): ethereum.CallResult<boolean> {
    let result = super.tryCall("inPrivateMode", "inPrivateMode():(bool)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  isHandler(param0: Address): boolean {
    let result = super.call("isHandler", "isHandler(address):(bool)", [
      ethereum.Value.fromAddress(param0)
    ]);

    return result[0].toBoolean();
  }

  try_isHandler(param0: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("isHandler", "isHandler(address):(bool)", [
      ethereum.Value.fromAddress(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  lastAddedAt(param0: Address): BigInt {
    let result = super.call("lastAddedAt", "lastAddedAt(address):(uint256)", [
      ethereum.Value.fromAddress(param0)
    ]);

    return result[0].toBigInt();
  }

  try_lastAddedAt(param0: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "lastAddedAt",
      "lastAddedAt(address):(uint256)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  removeLiquidity(
    _tokenOut: Address,
    _alpAmount: BigInt,
    _minOut: BigInt,
    _receiver: Address
  ): BigInt {
    let result = super.call(
      "removeLiquidity",
      "removeLiquidity(address,uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromAddress(_tokenOut),
        ethereum.Value.fromUnsignedBigInt(_alpAmount),
        ethereum.Value.fromUnsignedBigInt(_minOut),
        ethereum.Value.fromAddress(_receiver)
      ]
    );

    return result[0].toBigInt();
  }

  try_removeLiquidity(
    _tokenOut: Address,
    _alpAmount: BigInt,
    _minOut: BigInt,
    _receiver: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "removeLiquidity",
      "removeLiquidity(address,uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromAddress(_tokenOut),
        ethereum.Value.fromUnsignedBigInt(_alpAmount),
        ethereum.Value.fromUnsignedBigInt(_minOut),
        ethereum.Value.fromAddress(_receiver)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  removeLiquidityForAccount(
    _account: Address,
    _tokenOut: Address,
    _alpAmount: BigInt,
    _minOut: BigInt,
    _receiver: Address
  ): BigInt {
    let result = super.call(
      "removeLiquidityForAccount",
      "removeLiquidityForAccount(address,address,uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromAddress(_account),
        ethereum.Value.fromAddress(_tokenOut),
        ethereum.Value.fromUnsignedBigInt(_alpAmount),
        ethereum.Value.fromUnsignedBigInt(_minOut),
        ethereum.Value.fromAddress(_receiver)
      ]
    );

    return result[0].toBigInt();
  }

  try_removeLiquidityForAccount(
    _account: Address,
    _tokenOut: Address,
    _alpAmount: BigInt,
    _minOut: BigInt,
    _receiver: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "removeLiquidityForAccount",
      "removeLiquidityForAccount(address,address,uint256,uint256,address):(uint256)",
      [
        ethereum.Value.fromAddress(_account),
        ethereum.Value.fromAddress(_tokenOut),
        ethereum.Value.fromUnsignedBigInt(_alpAmount),
        ethereum.Value.fromUnsignedBigInt(_minOut),
        ethereum.Value.fromAddress(_receiver)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  usdg(): Address {
    let result = super.call("usdg", "usdg():(address)", []);

    return result[0].toAddress();
  }

  try_usdg(): ethereum.CallResult<Address> {
    let result = super.tryCall("usdg", "usdg():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  vault(): Address {
    let result = super.call("vault", "vault():(address)", []);

    return result[0].toAddress();
  }

  try_vault(): ethereum.CallResult<Address> {
    let result = super.tryCall("vault", "vault():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _vault(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _usdg(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _alp(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _cooldownDuration(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class AddLiquidityCall extends ethereum.Call {
  get inputs(): AddLiquidityCall__Inputs {
    return new AddLiquidityCall__Inputs(this);
  }

  get outputs(): AddLiquidityCall__Outputs {
    return new AddLiquidityCall__Outputs(this);
  }
}

export class AddLiquidityCall__Inputs {
  _call: AddLiquidityCall;

  constructor(call: AddLiquidityCall) {
    this._call = call;
  }

  get _token(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _minUsdg(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _minAlp(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }
}

export class AddLiquidityCall__Outputs {
  _call: AddLiquidityCall;

  constructor(call: AddLiquidityCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class AddLiquidityForAccountCall extends ethereum.Call {
  get inputs(): AddLiquidityForAccountCall__Inputs {
    return new AddLiquidityForAccountCall__Inputs(this);
  }

  get outputs(): AddLiquidityForAccountCall__Outputs {
    return new AddLiquidityForAccountCall__Outputs(this);
  }
}

export class AddLiquidityForAccountCall__Inputs {
  _call: AddLiquidityForAccountCall;

  constructor(call: AddLiquidityForAccountCall) {
    this._call = call;
  }

  get _fundingAccount(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _account(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _token(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _amount(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get _minUsdg(): BigInt {
    return this._call.inputValues[4].value.toBigInt();
  }

  get _minAlp(): BigInt {
    return this._call.inputValues[5].value.toBigInt();
  }
}

export class AddLiquidityForAccountCall__Outputs {
  _call: AddLiquidityForAccountCall;

  constructor(call: AddLiquidityForAccountCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class RemoveLiquidityCall extends ethereum.Call {
  get inputs(): RemoveLiquidityCall__Inputs {
    return new RemoveLiquidityCall__Inputs(this);
  }

  get outputs(): RemoveLiquidityCall__Outputs {
    return new RemoveLiquidityCall__Outputs(this);
  }
}

export class RemoveLiquidityCall__Inputs {
  _call: RemoveLiquidityCall;

  constructor(call: RemoveLiquidityCall) {
    this._call = call;
  }

  get _tokenOut(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _alpAmount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _minOut(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _receiver(): Address {
    return this._call.inputValues[3].value.toAddress();
  }
}

export class RemoveLiquidityCall__Outputs {
  _call: RemoveLiquidityCall;

  constructor(call: RemoveLiquidityCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class RemoveLiquidityForAccountCall extends ethereum.Call {
  get inputs(): RemoveLiquidityForAccountCall__Inputs {
    return new RemoveLiquidityForAccountCall__Inputs(this);
  }

  get outputs(): RemoveLiquidityForAccountCall__Outputs {
    return new RemoveLiquidityForAccountCall__Outputs(this);
  }
}

export class RemoveLiquidityForAccountCall__Inputs {
  _call: RemoveLiquidityForAccountCall;

  constructor(call: RemoveLiquidityForAccountCall) {
    this._call = call;
  }

  get _account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _tokenOut(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _alpAmount(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _minOut(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get _receiver(): Address {
    return this._call.inputValues[4].value.toAddress();
  }
}

export class RemoveLiquidityForAccountCall__Outputs {
  _call: RemoveLiquidityForAccountCall;

  constructor(call: RemoveLiquidityForAccountCall) {
    this._call = call;
  }

  get value0(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }
}

export class SetAumAdjustmentCall extends ethereum.Call {
  get inputs(): SetAumAdjustmentCall__Inputs {
    return new SetAumAdjustmentCall__Inputs(this);
  }

  get outputs(): SetAumAdjustmentCall__Outputs {
    return new SetAumAdjustmentCall__Outputs(this);
  }
}

export class SetAumAdjustmentCall__Inputs {
  _call: SetAumAdjustmentCall;

  constructor(call: SetAumAdjustmentCall) {
    this._call = call;
  }

  get _aumAddition(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _aumDeduction(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class SetAumAdjustmentCall__Outputs {
  _call: SetAumAdjustmentCall;

  constructor(call: SetAumAdjustmentCall) {
    this._call = call;
  }
}

export class SetCooldownDurationCall extends ethereum.Call {
  get inputs(): SetCooldownDurationCall__Inputs {
    return new SetCooldownDurationCall__Inputs(this);
  }

  get outputs(): SetCooldownDurationCall__Outputs {
    return new SetCooldownDurationCall__Outputs(this);
  }
}

export class SetCooldownDurationCall__Inputs {
  _call: SetCooldownDurationCall;

  constructor(call: SetCooldownDurationCall) {
    this._call = call;
  }

  get _cooldownDuration(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class SetCooldownDurationCall__Outputs {
  _call: SetCooldownDurationCall;

  constructor(call: SetCooldownDurationCall) {
    this._call = call;
  }
}

export class SetGovCall extends ethereum.Call {
  get inputs(): SetGovCall__Inputs {
    return new SetGovCall__Inputs(this);
  }

  get outputs(): SetGovCall__Outputs {
    return new SetGovCall__Outputs(this);
  }
}

export class SetGovCall__Inputs {
  _call: SetGovCall;

  constructor(call: SetGovCall) {
    this._call = call;
  }

  get _gov(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetGovCall__Outputs {
  _call: SetGovCall;

  constructor(call: SetGovCall) {
    this._call = call;
  }
}

export class SetHandlerCall extends ethereum.Call {
  get inputs(): SetHandlerCall__Inputs {
    return new SetHandlerCall__Inputs(this);
  }

  get outputs(): SetHandlerCall__Outputs {
    return new SetHandlerCall__Outputs(this);
  }
}

export class SetHandlerCall__Inputs {
  _call: SetHandlerCall;

  constructor(call: SetHandlerCall) {
    this._call = call;
  }

  get _handler(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _isActive(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }
}

export class SetHandlerCall__Outputs {
  _call: SetHandlerCall;

  constructor(call: SetHandlerCall) {
    this._call = call;
  }
}

export class SetInPrivateModeCall extends ethereum.Call {
  get inputs(): SetInPrivateModeCall__Inputs {
    return new SetInPrivateModeCall__Inputs(this);
  }

  get outputs(): SetInPrivateModeCall__Outputs {
    return new SetInPrivateModeCall__Outputs(this);
  }
}

export class SetInPrivateModeCall__Inputs {
  _call: SetInPrivateModeCall;

  constructor(call: SetInPrivateModeCall) {
    this._call = call;
  }

  get _inPrivateMode(): boolean {
    return this._call.inputValues[0].value.toBoolean();
  }
}

export class SetInPrivateModeCall__Outputs {
  _call: SetInPrivateModeCall;

  constructor(call: SetInPrivateModeCall) {
    this._call = call;
  }
}
