import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import { getContract } from "config/contracts";
import useSWR from "swr";

import OrderBookReader from "abis/OrderBookReader.json";
import OrderBook from "abis/OrderBook.json";

import { DEFAULT_CHAIN_ID, getChainName, getExplorerUrl, getRpcUrl } from "config/chains";
import { getMostAbundantStableToken } from "domain/tokens";
import { getTokenInfo } from "domain/tokens/utils";
import { getProvider } from "./rpc";
import { bigNumberify, expandDecimals, formatAmount } from "./numbers";
import { isValidToken } from "config/tokens";
import { useChainId } from "./chains";
import { isValidTimestamp } from "./dates";
import { t } from "@lingui/macro";
import { isLocal } from "config/env";

const { AddressZero } = ethers.constants;

// use a random placeholder account instead of the zero address as the zero address might have tokens
export const PLACEHOLDER_ACCOUNT = ethers.Wallet.createRandom().address;

export const MIN_PROFIT_TIME = 0;

export const USDG_ADDRESS = getContract("USDG");

export const BASIS_POINTS_DIVISOR = 10000;
export const MAX_LEVERAGE = 100 * BASIS_POINTS_DIVISOR;
export const MAX_ALLOWED_LEVERAGE = 50 * BASIS_POINTS_DIVISOR;

export const MAX_PRICE_DEVIATION_BASIS_POINTS = 750;
export const DEFAULT_GAS_LIMIT = 1 * 1000 * 1000;
export const SECONDS_PER_YEAR = 31536000;
export const USDG_DECIMALS = 18;
export const USD_DECIMALS = 30;
export const DEFAULT_DECIMALS = 18;
export const USDC_DECIMALS = 6;
export const DEPOSIT_FEE = 30;
export const DUST_BNB = "2000000000000000";
export const DUST_USD = expandDecimals(1, USD_DECIMALS);
export const PRECISION = expandDecimals(1, 30);
export const TLP_DECIMALS = 18;
export const AXN_DECIMALS = 18;
export const DEFAULT_MAX_USDG_AMOUNT = expandDecimals(200 * 1000 * 1000, 18);

export const TAX_BASIS_POINTS = 50;
export const STABLE_TAX_BASIS_POINTS = 5;
export const MINT_BURN_FEE_BASIS_POINTS = 25;
export const SWAP_FEE_BASIS_POINTS = 30;
export const STABLE_SWAP_FEE_BASIS_POINTS = 1;
export const MARGIN_FEE_BASIS_POINTS = 10;

export const LIQUIDATION_FEE = expandDecimals(5, USD_DECIMALS);

export const TRADES_PAGE_SIZE = 100;

export const GLP_COOLDOWN_DURATION = 0;
export const THRESHOLD_REDEMPTION_VALUE = expandDecimals(993, 27); // 0.993
export const FUNDING_RATE_PRECISION = 1000000;

export const SWAP = "Swap";
export const INCREASE = "Increase";
export const DECREASE = "Decrease";
export const LONG = "Long";
export const SHORT = "Short";

export const MARKET = "Market";
export const LIMIT = "Limit";
export const STOP = "Stop";
export const LEVERAGE_ORDER_OPTIONS = [MARKET, LIMIT, STOP];
export const SWAP_ORDER_OPTIONS = [MARKET, LIMIT];
export const SWAP_OPTIONS = [LONG, SHORT, SWAP];

export const DEPOSIT = "Deposit";
export const WITHDRAWAL = "Withdrawal";
export const FIAT_OPTIONS = [DEPOSIT, WITHDRAWAL];

export const TVL = "TVL";
export const APY = "APY";
export const DAILY = "Daily";
export const DEAXN_OPTIONS = [TVL, APY, DAILY];
export const DEFAULT_SLIPPAGE_AMOUNT = 30;
export const DEFAULT_HIGHER_SLIPPAGE_AMOUNT = 100;

export const REFERRAL_CODE_QUERY_PARAM = "ref";
export const MAX_REFERRAL_CODE_LENGTH = 20;

export const MIN_PROFIT_BIPS = 0;

export function deserialize(data) {
  for (const [key, value] of Object.entries(data) as any) {
    if (value._type === "BigNumber") {
      data[key] = bigNumberify(value.value);
    }
  }
  return data;
}

export function isHomeSite() {
  return process.env.REACT_APP_IS_HOME_SITE === "true";
}

export function getLiquidationPriceFromDelta({ liquidationAmount, size, collateral, averagePrice, isLong }) {
  if (!size || size.eq(0)) {
    return;
  }

  if (liquidationAmount.gt(collateral)) {
    const liquidationDelta = liquidationAmount.sub(collateral);
    const priceDelta = liquidationDelta.mul(averagePrice).div(size);

    return isLong ? averagePrice.add(priceDelta) : averagePrice.sub(priceDelta);
  }

  const liquidationDelta = collateral.sub(liquidationAmount);
  const priceDelta = liquidationDelta.mul(averagePrice).div(size);

  return isLong ? averagePrice.sub(priceDelta) : averagePrice.add(priceDelta);
}

export function getMarginFee(sizeDelta) {
  if (!sizeDelta) {
    return bigNumberify(0);
  }
  const afterFeeUsd = sizeDelta.mul(BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR);
  return sizeDelta.sub(afterFeeUsd);
}

export function isTriggerRatioInverted(fromTokenInfo, toTokenInfo) {
  if (!toTokenInfo || !fromTokenInfo) return false;
  if (toTokenInfo.isStable || toTokenInfo.isUsdg) return true;
  if (toTokenInfo.maxPrice) return toTokenInfo.maxPrice.lt(fromTokenInfo.maxPrice);
  return false;
}

export function getExchangeRate(tokenAInfo, tokenBInfo, inverted) {
  if (!tokenAInfo || !tokenAInfo.minPrice || !tokenBInfo || !tokenBInfo.maxPrice) {
    return;
  }
  if (inverted) {
    return tokenAInfo.minPrice.mul(PRECISION).div(tokenBInfo.maxPrice);
  }
  return tokenBInfo.maxPrice.mul(PRECISION).div(tokenAInfo.minPrice);
}

export function shouldInvertTriggerRatio(tokenA, tokenB) {
  if (tokenB.isStable || tokenB.isUsdg) return true;
  if (tokenB.maxPrice && tokenA.maxPrice && tokenB.maxPrice.lt(tokenA.maxPrice)) return true;
  return false;
}

export function getExchangeRateDisplay(rate, tokenA, tokenB, opts: { omitSymbols?: boolean } = {}) {
  if (!rate || !tokenA || !tokenB) return "...";
  if (shouldInvertTriggerRatio(tokenA, tokenB)) {
    [tokenA, tokenB] = [tokenB, tokenA];
    rate = PRECISION.mul(PRECISION).div(rate);
  }
  const rateValue = formatAmount(rate, USD_DECIMALS, tokenA.isStable || tokenA.isUsdg ? 2 : 4, true);
  if (opts.omitSymbols) {
    return rateValue;
  }
  return `${rateValue} ${tokenA.symbol} / ${tokenB.symbol}`;
}

const adjustForDecimalsFactory = (n) => (number) => {
  if (n === 0) {
    return number;
  }
  if (n > 0) {
    return number.mul(expandDecimals(1, n));
  }
  return number.div(expandDecimals(1, -n));
};

export function adjustForDecimals(amount, divDecimals, mulDecimals) {
  return amount.mul(expandDecimals(1, mulDecimals)).div(expandDecimals(1, divDecimals));
}

export function getTargetUsdgAmount(token, usdgSupply, totalTokenWeights) {
  if (!token || !token.weight || !usdgSupply) {
    return;
  }

  if (usdgSupply.eq(0)) {
    return bigNumberify(0);
  }

  return token.weight.mul(usdgSupply).div(totalTokenWeights);
}

export function getFeeBasisPoints(
  token,
  tokenUsdgAmount,
  usdgDelta,
  feeBasisPoints,
  taxBasisPoints,
  increment,
  usdgSupply,
  totalTokenWeights
) {
  if (!token || !tokenUsdgAmount || !usdgSupply || !totalTokenWeights) {
    return 0;
  }

  feeBasisPoints = bigNumberify(feeBasisPoints);
  taxBasisPoints = bigNumberify(taxBasisPoints);

  const initialAmount = tokenUsdgAmount;
  let nextAmount = initialAmount.add(usdgDelta);
  if (!increment) {
    nextAmount = usdgDelta.gt(initialAmount) ? bigNumberify(0) : initialAmount.sub(usdgDelta);
  }

  const targetAmount = getTargetUsdgAmount(token, usdgSupply, totalTokenWeights);
  if (!targetAmount || targetAmount.eq(0)) {
    return feeBasisPoints.toNumber();
  }

  const initialDiff = initialAmount.gt(targetAmount)
    ? initialAmount.sub(targetAmount)
    : targetAmount.sub(initialAmount);
  const nextDiff = nextAmount.gt(targetAmount) ? nextAmount.sub(targetAmount) : targetAmount.sub(nextAmount);

  if (nextDiff.lt(initialDiff)) {
    const rebateBps = taxBasisPoints.mul(initialDiff).div(targetAmount);
    return rebateBps.gt(feeBasisPoints) ? 0 : feeBasisPoints.sub(rebateBps).toNumber();
  }

  let averageDiff = initialDiff.add(nextDiff).div(2);
  if (averageDiff.gt(targetAmount)) {
    averageDiff = targetAmount;
  }
  const taxBps = taxBasisPoints.mul(averageDiff).div(targetAmount);
  return feeBasisPoints.add(taxBps).toNumber();
}

export function getBuyAlpToAmount(fromAmount, swapTokenAddress, infoTokens, alpPrice, usdgSupply, totalTokenWeights) {
  const defaultValue = { amount: bigNumberify(0), feeBasisPoints: 0 };
  if (!fromAmount || !swapTokenAddress || !infoTokens || !alpPrice || !usdgSupply || !totalTokenWeights) {
    return defaultValue;
  }

  const swapToken = getTokenInfo(infoTokens, swapTokenAddress);
  if (!swapToken || !swapToken.minPrice) {
    return defaultValue;
  }

  let alpAmount = fromAmount.mul(swapToken.minPrice).div(alpPrice);
  alpAmount = adjustForDecimals(alpAmount, swapToken.decimals, USDG_DECIMALS);

  let usdgAmount = fromAmount.mul(swapToken.minPrice).div(PRECISION);
  usdgAmount = adjustForDecimals(usdgAmount, swapToken.decimals, USDG_DECIMALS);
  const feeBasisPoints = getFeeBasisPoints(
    swapToken,
    swapToken.usdgAmount,
    usdgAmount,
    MINT_BURN_FEE_BASIS_POINTS,
    TAX_BASIS_POINTS,
    true,
    usdgSupply,
    totalTokenWeights
  );

  alpAmount = alpAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints).div(BASIS_POINTS_DIVISOR);

  return { amount: alpAmount, feeBasisPoints };
}

export function getSellAlpFromAmount(toAmount, swapTokenAddress, infoTokens, alpPrice, usdgSupply, totalTokenWeights) {
  const defaultValue = { amount: bigNumberify(0), feeBasisPoints: 0 };
  if (!toAmount || !swapTokenAddress || !infoTokens || !alpPrice || !usdgSupply || !totalTokenWeights) {
    return defaultValue;
  }

  const swapToken = getTokenInfo(infoTokens, swapTokenAddress);
  if (!swapToken || !swapToken.maxPrice) {
    return defaultValue;
  }

  let alpAmount = toAmount.mul(swapToken.maxPrice).div(alpPrice);
  alpAmount = adjustForDecimals(alpAmount, swapToken.decimals, USDG_DECIMALS);

  let usdgAmount = toAmount.mul(swapToken.maxPrice).div(PRECISION);
  usdgAmount = adjustForDecimals(usdgAmount, swapToken.decimals, USDG_DECIMALS);

  // in the Vault contract, the USDG supply is reduced before the fee basis points
  // is calculated
  usdgSupply = usdgSupply.sub(usdgAmount);

  // in the Vault contract, the token.usdgAmount is reduced before the fee basis points
  // is calculated
  const feeBasisPoints = getFeeBasisPoints(
    swapToken,
    swapToken?.usdgAmount?.sub(usdgAmount),
    usdgAmount,
    MINT_BURN_FEE_BASIS_POINTS,
    TAX_BASIS_POINTS,
    false,
    usdgSupply,
    totalTokenWeights
  );

  alpAmount = alpAmount.mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - feeBasisPoints);

  return { amount: alpAmount, feeBasisPoints };
}

export function getBuyAlpFromAmount(toAmount, fromTokenAddress, infoTokens, alpPrice, usdgSupply, totalTokenWeights) {
  const defaultValue = { amount: bigNumberify(0) };
  if (!toAmount || !fromTokenAddress || !infoTokens || !alpPrice || !usdgSupply || !totalTokenWeights) {
    return defaultValue;
  }

  const fromToken = getTokenInfo(infoTokens, fromTokenAddress);
  if (!fromToken || !fromToken.minPrice) {
    return defaultValue;
  }

  let fromAmount = toAmount.mul(alpPrice).div(fromToken.minPrice);
  fromAmount = adjustForDecimals(fromAmount, TLP_DECIMALS, fromToken.decimals);

  const usdgAmount = toAmount.mul(alpPrice).div(PRECISION);
  const feeBasisPoints = getFeeBasisPoints(
    fromToken,
    fromToken.usdgAmount,
    usdgAmount,
    MINT_BURN_FEE_BASIS_POINTS,
    TAX_BASIS_POINTS,
    true,
    usdgSupply,
    totalTokenWeights
  );

  fromAmount = fromAmount.mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - feeBasisPoints);

  return { amount: fromAmount, feeBasisPoints };
}

export function getSellAlpToAmount(toAmount, fromTokenAddress, infoTokens, alpPrice, usdgSupply, totalTokenWeights) {
  const defaultValue = { amount: bigNumberify(0) };
  if (!toAmount || !fromTokenAddress || !infoTokens || !alpPrice || !usdgSupply || !totalTokenWeights) {
    return defaultValue;
  }

  const fromToken = getTokenInfo(infoTokens, fromTokenAddress);
  if (!fromToken || !fromToken.maxPrice) {
    return defaultValue;
  }

  let fromAmount = toAmount.mul(alpPrice).div(fromToken.maxPrice);
  fromAmount = adjustForDecimals(fromAmount, TLP_DECIMALS, fromToken.decimals);

  const usdgAmount = toAmount.mul(alpPrice).div(PRECISION);

  // in the Vault contract, the USDG supply is reduced before the fee basis points
  // is calculated
  usdgSupply = usdgSupply.sub(usdgAmount);

  // in the Vault contract, the token.usdgAmount is reduced before the fee basis points
  // is calculated
  const feeBasisPoints = getFeeBasisPoints(
    fromToken,
    fromToken?.usdgAmount?.sub(usdgAmount),
    usdgAmount,
    MINT_BURN_FEE_BASIS_POINTS,
    TAX_BASIS_POINTS,
    false,
    usdgSupply,
    totalTokenWeights
  );

  fromAmount = fromAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints).div(BASIS_POINTS_DIVISOR);

  return { amount: fromAmount, feeBasisPoints };
}

export function getNextFromAmount(
  chainId,
  toAmount,
  fromTokenAddress,
  toTokenAddress,
  infoTokens,
  toTokenPriceUsd,
  ratio,
  usdgSupply,
  totalTokenWeights,
  forSwap
) {
  const defaultValue = { amount: bigNumberify(0) };

  if (!toAmount || !fromTokenAddress || !toTokenAddress || !infoTokens) {
    return defaultValue;
  }

  if (fromTokenAddress === toTokenAddress) {
    return { amount: toAmount };
  }

  const fromToken = getTokenInfo(infoTokens, fromTokenAddress);
  const toToken = getTokenInfo(infoTokens, toTokenAddress);

  if (fromToken.isNative && toToken.isWrapped) {
    return { amount: toAmount };
  }

  if (fromToken.isWrapped && toToken.isNative) {
    return { amount: toAmount };
  }

  // the realtime price should be used if it is for a transaction to open / close a position
  // or if the transaction involves doing a swap and opening / closing a position
  // otherwise use the contract price instead of realtime price for swaps

  let fromTokenMinPrice;
  if (fromToken) {
    fromTokenMinPrice = forSwap ? fromToken.contractMinPrice : fromToken.minPrice;
  }

  let toTokenMaxPrice;
  if (toToken) {
    toTokenMaxPrice = forSwap ? toToken.contractMaxPrice : toToken.maxPrice;
  }

  if (!fromToken || !fromTokenMinPrice || !toToken || !toTokenMaxPrice) {
    return defaultValue;
  }

  const adjustDecimals = adjustForDecimalsFactory(fromToken.decimals - toToken.decimals);

  let fromAmountBasedOnRatio;
  if (ratio && !ratio.isZero()) {
    fromAmountBasedOnRatio = toAmount.mul(ratio).div(PRECISION);
  }

  const fromAmount =
    ratio && !ratio.isZero() ? fromAmountBasedOnRatio : toAmount.mul(toTokenMaxPrice).div(fromTokenMinPrice);

  let usdgAmount = fromAmount.mul(fromTokenMinPrice).div(PRECISION);
  usdgAmount = adjustForDecimals(usdgAmount, toToken.decimals, USDG_DECIMALS);
  const swapFeeBasisPoints =
    fromToken.isStable && toToken.isStable ? STABLE_SWAP_FEE_BASIS_POINTS : SWAP_FEE_BASIS_POINTS;
  const taxBasisPoints = fromToken.isStable && toToken.isStable ? STABLE_TAX_BASIS_POINTS : TAX_BASIS_POINTS;
  const feeBasisPoints0 = getFeeBasisPoints(
    fromToken,
    fromToken.usdgAmount,
    usdgAmount,
    swapFeeBasisPoints,
    taxBasisPoints,
    true,
    usdgSupply,
    totalTokenWeights
  );
  const feeBasisPoints1 = getFeeBasisPoints(
    toToken,
    toToken.usdgAmount,
    usdgAmount,
    swapFeeBasisPoints,
    taxBasisPoints,
    false,
    usdgSupply,
    totalTokenWeights
  );
  const feeBasisPoints = feeBasisPoints0 > feeBasisPoints1 ? feeBasisPoints0 : feeBasisPoints1;

  return {
    amount: adjustDecimals(fromAmount.mul(BASIS_POINTS_DIVISOR).div(BASIS_POINTS_DIVISOR - feeBasisPoints)),
    feeBasisPoints,
  };
}

export function getNextToAmount(
  chainId,
  fromAmount,
  fromTokenAddress,
  toTokenAddress,
  infoTokens,
  toTokenPriceUsd,
  ratio,
  usdgSupply,
  totalTokenWeights,
  forSwap
) {
  const defaultValue = { amount: bigNumberify(0) };
  if (!fromAmount || !fromTokenAddress || !toTokenAddress || !infoTokens) {
    return defaultValue;
  }

  if (fromTokenAddress === toTokenAddress) {
    return { amount: fromAmount };
  }

  const fromToken = getTokenInfo(infoTokens, fromTokenAddress);
  const toToken = getTokenInfo(infoTokens, toTokenAddress);

  if (fromToken.isNative && toToken.isWrapped) {
    return { amount: fromAmount };
  }

  if (fromToken.isWrapped && toToken.isNative) {
    return { amount: fromAmount };
  }

  // the realtime price should be used if it is for a transaction to open / close a position
  // or if the transaction involves doing a swap and opening / closing a position
  // otherwise use the contract price instead of realtime price for swaps

  let fromTokenMinPrice;
  if (fromToken) {
    fromTokenMinPrice = forSwap ? fromToken.contractMinPrice : fromToken.minPrice;
  }

  let toTokenMaxPrice;
  if (toToken) {
    toTokenMaxPrice = forSwap ? toToken.contractMaxPrice : toToken.maxPrice;
  }

  if (!fromTokenMinPrice || !toTokenMaxPrice) {
    return defaultValue;
  }

  const adjustDecimals = adjustForDecimalsFactory(toToken.decimals - fromToken.decimals);

  let toAmountBasedOnRatio = bigNumberify(0)!;
  if (ratio && !ratio.isZero()) {
    toAmountBasedOnRatio = fromAmount.mul(PRECISION).div(ratio);
  }

  if (toTokenAddress === USDG_ADDRESS) {
    const feeBasisPoints = getSwapFeeBasisPoints(fromToken.isStable);

    if (ratio && !ratio.isZero()) {
      const toAmount = toAmountBasedOnRatio;
      return {
        amount: adjustDecimals(toAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints).div(BASIS_POINTS_DIVISOR)),
        feeBasisPoints,
      };
    }

    const toAmount = fromAmount.mul(fromTokenMinPrice).div(PRECISION);
    return {
      amount: adjustDecimals(toAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints).div(BASIS_POINTS_DIVISOR)),
      feeBasisPoints,
    };
  }

  if (fromTokenAddress === USDG_ADDRESS) {
    const redemptionValue = toToken.redemptionAmount
      ?.mul(toTokenPriceUsd || toTokenMaxPrice)
      .div(expandDecimals(1, toToken.decimals));

    if (redemptionValue && redemptionValue.gt(THRESHOLD_REDEMPTION_VALUE)) {
      const feeBasisPoints = getSwapFeeBasisPoints(toToken.isStable);

      const toAmount =
        ratio && !ratio.isZero()
          ? toAmountBasedOnRatio
          : fromAmount.mul(toToken.redemptionAmount).div(expandDecimals(1, toToken.decimals));

      return {
        amount: adjustDecimals(toAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints).div(BASIS_POINTS_DIVISOR)),
        feeBasisPoints,
      };
    }

    const expectedAmount = fromAmount;

    const stableToken = getMostAbundantStableToken(chainId, infoTokens);
    if (!stableToken?.availableAmount || stableToken.availableAmount.lt(expectedAmount)) {
      const toAmount =
        ratio && !ratio.isZero()
          ? toAmountBasedOnRatio
          : fromAmount.mul(toToken.redemptionAmount).div(expandDecimals(1, toToken.decimals));
      const feeBasisPoints = getSwapFeeBasisPoints(toToken.isStable);
      return {
        amount: adjustDecimals(toAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints).div(BASIS_POINTS_DIVISOR)),
        feeBasisPoints,
      };
    }

    const feeBasisPoints0 = getSwapFeeBasisPoints(true);
    const feeBasisPoints1 = getSwapFeeBasisPoints(false);

    if (ratio && !ratio.isZero()) {
      const toAmount = toAmountBasedOnRatio
        .mul(BASIS_POINTS_DIVISOR - feeBasisPoints0 - feeBasisPoints1)
        .div(BASIS_POINTS_DIVISOR);
      return {
        amount: adjustDecimals(toAmount),
        path: [USDG_ADDRESS, stableToken.address, toToken.address],
        feeBasisPoints: feeBasisPoints0 + feeBasisPoints1,
      };
    }

    // get toAmount for USDG => stableToken
    let toAmount = fromAmount.mul(PRECISION).div(stableToken.maxPrice);
    // apply USDG => stableToken fees
    toAmount = toAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints0).div(BASIS_POINTS_DIVISOR);

    // get toAmount for stableToken => toToken
    toAmount = toAmount.mul(stableToken.minPrice).div(toTokenPriceUsd || toTokenMaxPrice);
    // apply stableToken => toToken fees
    toAmount = toAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints1).div(BASIS_POINTS_DIVISOR);

    return {
      amount: adjustDecimals(toAmount),
      path: [USDG_ADDRESS, stableToken.address, toToken.address],
      feeBasisPoints: feeBasisPoints0 + feeBasisPoints1,
    };
  }

  const toAmount =
    ratio && !ratio.isZero()
      ? toAmountBasedOnRatio
      : fromAmount.mul(fromTokenMinPrice).div(toTokenPriceUsd || toTokenMaxPrice);

  let usdgAmount = fromAmount.mul(fromTokenMinPrice).div(PRECISION);
  usdgAmount = adjustForDecimals(usdgAmount, fromToken.decimals, USDG_DECIMALS);
  const swapFeeBasisPoints =
    fromToken.isStable && toToken.isStable ? STABLE_SWAP_FEE_BASIS_POINTS : SWAP_FEE_BASIS_POINTS;
  const taxBasisPoints = fromToken.isStable && toToken.isStable ? STABLE_TAX_BASIS_POINTS : TAX_BASIS_POINTS;
  const feeBasisPoints0 = getFeeBasisPoints(
    fromToken,
    fromToken.usdgAmount,
    usdgAmount,
    swapFeeBasisPoints,
    taxBasisPoints,
    true,
    usdgSupply,
    totalTokenWeights
  );
  const feeBasisPoints1 = getFeeBasisPoints(
    toToken,
    toToken.usdgAmount,
    usdgAmount,
    swapFeeBasisPoints,
    taxBasisPoints,
    false,
    usdgSupply,
    totalTokenWeights
  );
  const feeBasisPoints = feeBasisPoints0 > feeBasisPoints1 ? feeBasisPoints0 : feeBasisPoints1;

  return {
    amount: adjustDecimals(toAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints).div(BASIS_POINTS_DIVISOR)),
    feeBasisPoints,
  };
}

export function getProfitPrice(closePrice, position) {
  let profitPrice;
  if (position && position.averagePrice && closePrice) {
    profitPrice = position.isLong
      ? position.averagePrice.mul(BASIS_POINTS_DIVISOR + MIN_PROFIT_BIPS).div(BASIS_POINTS_DIVISOR)
      : position.averagePrice.mul(BASIS_POINTS_DIVISOR - MIN_PROFIT_BIPS).div(BASIS_POINTS_DIVISOR);
  }
  return profitPrice;
}

export function calculatePositionDelta(
  price,
  { size, collateral, isLong, averagePrice, lastIncreasedTime },
  sizeDelta
) {
  if (!sizeDelta) {
    sizeDelta = size;
  }
  const priceDelta = averagePrice.gt(price) ? averagePrice.sub(price) : price.sub(averagePrice);
  let delta = sizeDelta.mul(priceDelta).div(averagePrice);
  const pendingDelta = delta;

  const minProfitExpired = lastIncreasedTime + MIN_PROFIT_TIME < Date.now() / 1000;
  const hasProfit = isLong ? price.gt(averagePrice) : price.lt(averagePrice);
  if (!minProfitExpired && hasProfit && delta.mul(BASIS_POINTS_DIVISOR).lte(size.mul(MIN_PROFIT_BIPS))) {
    delta = bigNumberify(0);
  }

  const deltaPercentage = delta.mul(BASIS_POINTS_DIVISOR).div(collateral);
  const pendingDeltaPercentage = pendingDelta.mul(BASIS_POINTS_DIVISOR).div(collateral);

  return {
    delta,
    pendingDelta,
    pendingDeltaPercentage,
    hasProfit,
    deltaPercentage,
  };
}

export function getDeltaStr({ delta, deltaPercentage, hasProfit }) {
  let deltaStr;
  let deltaPercentageStr;

  if (delta.gt(0)) {
    deltaStr = hasProfit ? "+" : "-";
    deltaPercentageStr = hasProfit ? "+" : "-";
  } else {
    deltaStr = "";
    deltaPercentageStr = "";
  }
  deltaStr += `$${formatAmount(delta, USD_DECIMALS, 2, true)}`;
  deltaPercentageStr += `${formatAmount(deltaPercentage, 2, 2)}%`;

  return { deltaStr, deltaPercentageStr };
}

export function getLeverage({
  size,
  sizeDelta,
  increaseSize,
  collateral,
  collateralDelta,
  increaseCollateral,
  entryFundingRate,
  cumulativeFundingRate,
  hasProfit,
  delta,
  includeDelta,
}) {
  if (!size && !sizeDelta) {
    return;
  }
  if (!collateral && !collateralDelta) {
    return;
  }

  let nextSize = size ? size : bigNumberify(0);
  if (sizeDelta) {
    if (increaseSize) {
      nextSize = size.add(sizeDelta);
    } else {
      if (sizeDelta.gte(size)) {
        return;
      }
      nextSize = size.sub(sizeDelta);
    }
  }

  let remainingCollateral = collateral ? collateral : bigNumberify(0);
  if (collateralDelta) {
    if (increaseCollateral) {
      remainingCollateral = collateral.add(collateralDelta);
    } else {
      if (collateralDelta.gte(collateral)) {
        return;
      }
      remainingCollateral = collateral.sub(collateralDelta);
    }
  }

  if (delta && includeDelta) {
    if (hasProfit) {
      remainingCollateral = remainingCollateral.add(delta);
    } else {
      if (delta.gt(remainingCollateral)) {
        return;
      }

      remainingCollateral = remainingCollateral.sub(delta);
    }
  }

  if (remainingCollateral.eq(0)) {
    return;
  }

  remainingCollateral = sizeDelta
    ? remainingCollateral.mul(BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
    : remainingCollateral;
  if (entryFundingRate && cumulativeFundingRate) {
    const fundingFee = size.mul(cumulativeFundingRate.sub(entryFundingRate)).div(FUNDING_RATE_PRECISION);
    remainingCollateral = remainingCollateral.sub(fundingFee);
  }

  return nextSize.mul(BASIS_POINTS_DIVISOR).div(remainingCollateral);
}

export function getLeverageStr(leverage) {
  if (leverage && ethers.BigNumber.isBigNumber(leverage)) {
    if (leverage.lt(0)) {
      return "> 100x";
    }
    return `${formatAmount(leverage, 4, 2, true)}x`;
  }
}

export function getFundingFee(data: {
  size: BigNumber;
  entryFundingRate?: BigNumber;
  cumulativeFundingRate?: BigNumber;
}) {
  let { entryFundingRate, cumulativeFundingRate, size } = data;

  if (entryFundingRate && cumulativeFundingRate) {
    return size.mul(cumulativeFundingRate.sub(entryFundingRate)).div(FUNDING_RATE_PRECISION);
  }

  return;
}

export function getLiquidationPrice(data) {
  let {
    isLong,
    size,
    collateral,
    averagePrice,
    entryFundingRate,
    cumulativeFundingRate,
    sizeDelta,
    collateralDelta,
    increaseCollateral,
    increaseSize,
    delta,
    hasProfit,
    includeDelta,
  } = data;
  if (!size || !collateral || !averagePrice) {
    return;
  }

  let nextSize = size ? size : bigNumberify(0);
  let remainingCollateral = collateral;

  if (sizeDelta) {
    if (increaseSize) {
      nextSize = size.add(sizeDelta);
    } else {
      if (sizeDelta.gte(size)) {
        return;
      }
      nextSize = size.sub(sizeDelta);
    }

    const marginFee = getMarginFee(sizeDelta);
    remainingCollateral = remainingCollateral.sub(marginFee);

    if (includeDelta && !hasProfit) {
      const adjustedDelta = sizeDelta.mul(delta).div(size);
      remainingCollateral = remainingCollateral.sub(adjustedDelta);
    }
  }

  if (collateralDelta) {
    if (increaseCollateral) {
      remainingCollateral = remainingCollateral.add(collateralDelta);
    } else {
      if (collateralDelta.gte(remainingCollateral)) {
        return;
      }
      remainingCollateral = remainingCollateral.sub(collateralDelta);
    }
  }

  let positionFee = getMarginFee(size).add(LIQUIDATION_FEE);

  if (entryFundingRate && cumulativeFundingRate) {
    const fundingFee = size.mul(cumulativeFundingRate.sub(entryFundingRate)).div(FUNDING_RATE_PRECISION);
    positionFee = positionFee.add(fundingFee);
  }

  const liquidationPriceForFees = getLiquidationPriceFromDelta({
    liquidationAmount: positionFee,
    size: nextSize,
    collateral: remainingCollateral,
    averagePrice,
    isLong,
  });

  const liquidationPriceForMaxLeverage = getLiquidationPriceFromDelta({
    liquidationAmount: nextSize.mul(BASIS_POINTS_DIVISOR).div(MAX_LEVERAGE),
    size: nextSize,
    collateral: remainingCollateral,
    averagePrice,
    isLong,
  });

  if (!liquidationPriceForFees) {
    return liquidationPriceForMaxLeverage;
  }

  if (!liquidationPriceForMaxLeverage) {
    return liquidationPriceForFees;
  }

  if (isLong) {
    // return the higher price
    return liquidationPriceForFees.gt(liquidationPriceForMaxLeverage)
      ? liquidationPriceForFees
      : liquidationPriceForMaxLeverage;
  }

  // return the lower price
  return liquidationPriceForFees.lt(liquidationPriceForMaxLeverage)
    ? liquidationPriceForFees
    : liquidationPriceForMaxLeverage;
}

export function getPositionKey(
  account: string,
  collateralTokenAddress: string,
  indexTokenAddress: string,
  isLong: boolean,
  nativeTokenAddress?: string
) {
  const tokenAddress0 = collateralTokenAddress === AddressZero ? nativeTokenAddress : collateralTokenAddress;
  const tokenAddress1 = indexTokenAddress === AddressZero ? nativeTokenAddress : indexTokenAddress;
  return account + ":" + tokenAddress0 + ":" + tokenAddress1 + ":" + isLong;
}

export function getPositionContractKey(account, collateralToken, indexToken, isLong) {
  return ethers.utils.solidityKeccak256(
    ["address", "address", "address", "bool"],
    [account, collateralToken, indexToken, isLong]
  );
}

export function getSwapFeeBasisPoints(isStable) {
  return isStable ? STABLE_SWAP_FEE_BASIS_POINTS : SWAP_FEE_BASIS_POINTS;
}

export function shortenAddress(address, length) {
  if (!length) {
    return "";
  }
  if (!address) {
    return address;
  }
  if (address.length < 10) {
    return address;
  }
  let left = Math.floor((length - 3) / 2) + 1;
  return address.substring(0, left) + "..." + address.substring(address.length - (length - (left + 3)), address.length);
}

export function useENS(address) {
  const [ensName, setENSName] = useState<string>('');

  useEffect(() => {
    async function resolveENS() {
      if (address /*&& DEFAULT_CHAIN_ID!==LOCALNET*/) {
        const provider = new ethers.providers.JsonRpcProvider(getRpcUrl(DEFAULT_CHAIN_ID));
        // const name = await provider.lookupAddress(address.toLowerCase());
        const name = provider? getChainName(provider?._network?.chainId) : ''
        if (name) setENSName(name);
      }
    }
    resolveENS();
  }, [address]);

  return { ensName };
}

function _parseOrdersData(ordersData, account, indexes, extractor, uintPropsLength, addressPropsLength) {
  if (!ordersData || ordersData.length === 0) {
    return [];
  }
  const [uintProps, addressProps] = ordersData;
  const count = uintProps.length / uintPropsLength;

  const orders: any[] = [];
  for (let i = 0; i < count; i++) {
    const sliced = addressProps
      .slice(addressPropsLength * i, addressPropsLength * (i + 1))
      .concat(uintProps.slice(uintPropsLength * i, uintPropsLength * (i + 1)));

    if (sliced[0] === AddressZero && sliced[1] === AddressZero) {
      continue;
    }

    const order = extractor(sliced);
    order.index = indexes[i];
    order.account = account;
    orders.push(order);
  }

  return orders;
}

function parseDecreaseOrdersData(chainId, decreaseOrdersData, account, indexes) {
  const extractor = (sliced) => {
    const isLong = sliced[4].toString() === "1";
    return {
      collateralToken: sliced[0],
      indexToken: sliced[1],
      collateralDelta: sliced[2],
      sizeDelta: sliced[3],
      isLong,
      triggerPrice: sliced[5],
      triggerAboveThreshold: sliced[6].toString() === "1",
      type: DECREASE,
    };
  };
  return _parseOrdersData(decreaseOrdersData, account, indexes, extractor, 5, 2).filter((order) => {
    return isValidToken(order.collateralToken) && isValidToken(order.indexToken);
  });
}

function parseIncreaseOrdersData(chainId, increaseOrdersData, account, indexes) {
  const extractor = (sliced) => {
    const isLong = sliced[5].toString() === "1";
    return {
      purchaseToken: sliced[0],
      collateralToken: sliced[1],
      indexToken: sliced[2],
      purchaseTokenAmount: sliced[3],
      sizeDelta: sliced[4],
      isLong,
      triggerPrice: sliced[6],
      triggerAboveThreshold: sliced[7].toString() === "1",
      type: INCREASE,
    };
  };
  return _parseOrdersData(increaseOrdersData, account, indexes, extractor, 5, 3).filter((order) => {
    return (
      isValidToken(order.purchaseToken) &&
      isValidToken(order.collateralToken) &&
      isValidToken(order.indexToken)
    );
  });
}

function parseSwapOrdersData(chainId, swapOrdersData, account, indexes) {
  if (!swapOrdersData || !swapOrdersData.length) {
    return [];
  }

  const extractor = (sliced) => {
    const triggerAboveThreshold = sliced[6].toString() === "1";
    const shouldUnwrap = sliced[7].toString() === "1";

    return {
      path: [sliced[0], sliced[1], sliced[2]].filter((address) => address !== AddressZero),
      amountIn: sliced[3],
      minOut: sliced[4],
      triggerRatio: sliced[5],
      triggerAboveThreshold,
      type: SWAP,
      shouldUnwrap,
    };
  };
  return _parseOrdersData(swapOrdersData, account, indexes, extractor, 5, 3).filter((order) => {
    return order.path.every((token) => isValidToken(token));
  });
}

export function getOrderKey(order) {
  return `${order.type}-${order.account}-${order.index}`;
}

export function useAccountOrders(flagOrdersEnabled, overrideAccount) {
  const { library, account: connectedAccount } = useWeb3React();
  const active = true; // this is used in Actions.js so set active to always be true
  const account = overrideAccount || connectedAccount;

  const { chainId } = useChainId();
  const shouldRequest = active && account && flagOrdersEnabled;

  const orderBookAddress = getContract("OrderBook");
  const orderBookReaderAddress = getContract("OrderBookReader");
  const key: any = shouldRequest ? [active, chainId, orderBookAddress, account] : false;
  const {
    data: orders = [],
    mutate: updateOrders,
    error: ordersError,
  } = useSWR(key, {
    dedupingInterval: 5000,
    fetcher: async (active, chainId, orderBookAddress, account) => {
      const provider = getProvider(library, chainId);
      const orderBookContract = new ethers.Contract(orderBookAddress, OrderBook.abi, provider);
      const orderBookReaderContract = new ethers.Contract(orderBookReaderAddress, OrderBookReader.abi, provider);

      const fetchIndexesFromServer = () => {
        return { swap: [], increase: [], decrease: [] };
        // const ordersIndexesUrl = `${getServerBaseUrl(chainId)}/orders_indices?account=${account}`;
        // return fetch(ordersIndexesUrl)
        //   .then(async (res) => {
        //     const json = await res.json();
        //     const ret = {};
        //     for (const key of Object.keys(json)) {
        //       ret[key.toLowerCase()] = json[key].map((val) => parseInt(val.value)).sort((a, b) => a - b);
        //     }

        //     return ret;
        //   })
        //   .catch(() => ({ swap: [], increase: [], decrease: [] }));
      };

      const fetchLastIndex = async (type) => {
        const method = type.toLowerCase() + "OrdersIndex";
        return await orderBookContract[method](account).then((res) => bigNumberify(res._hex)!.toNumber());
      };

      const fetchLastIndexes = async () => {
        const [swap, increase, decrease] = await Promise.all([
          fetchLastIndex("swap"),
          fetchLastIndex("increase"),
          fetchLastIndex("decrease"),
        ]);

        return { swap, increase, decrease };
      };

      const getRange = (to: number, from?: number) => {
        const LIMIT = 10;
        const _indexes: number[] = [];
        from = from || Math.max(to - LIMIT, 0);
        for (let i = to - 1; i >= from; i--) {
          _indexes.push(i);
        }
        return _indexes;
      };

      const getIndexes = (knownIndexes, lastIndex) => {
        if (knownIndexes.length === 0) {
          return getRange(lastIndex);
        }
        return [
          ...knownIndexes,
          ...getRange(lastIndex, knownIndexes[knownIndexes.length - 1] + 1).sort((a, b) => b - a),
        ];
      };

      const getOrders = async (method, knownIndexes, lastIndex, parseFunc) => {
        const indexes = getIndexes(knownIndexes, lastIndex);
        const ordersData = await orderBookReaderContract[method](orderBookAddress, account, indexes);
        const orders = parseFunc(chainId, ordersData, account, indexes);

        return orders;
      };

      try {
        const [serverIndexes, lastIndexes]: any = await Promise.all([fetchIndexesFromServer(), fetchLastIndexes()]);
        const [swapOrders = [], increaseOrders = [], decreaseOrders = []] = await Promise.all([
          getOrders("getSwapOrders", serverIndexes.swap, lastIndexes.swap, parseSwapOrdersData),
          getOrders("getIncreaseOrders", serverIndexes.increase, lastIndexes.increase, parseIncreaseOrdersData),
          getOrders("getDecreaseOrders", serverIndexes.decrease, lastIndexes.decrease, parseDecreaseOrdersData),
        ]);
        return [...swapOrders, ...increaseOrders, ...decreaseOrders];
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error(ex);
      }
    },
  });

  return [orders, updateOrders, ordersError];
}

export function getAccountUrl(chainId, account) {
  if (!account) {
    return getExplorerUrl(chainId);
  }
  return getExplorerUrl(chainId) + "address/" + account;
}

export function isMobileDevice(navigator) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export const CHART_PERIODS = {
  "5m": 60 * 5,
  "15m": 60 * 15,
  "1h": 60 * 60,
  "4h": 60 * 60 * 4,
  "1d": 60 * 60 * 24,
};

export function getTotalVolumeSum(volumes) {
  if (!volumes || volumes.length === 0) {
    return;
  }

  let volume = bigNumberify(0)!;

  for (let i = 0; i < volumes.length; i++) {
    volume = volume.add(volumes[i].data.volume);
  }

  return volume;
}

export function getBalanceAndSupplyData(balances) {
  if (!balances || balances.length === 0) {
    return {};
  }

  const keys = ["axn", "esAxn", "alp", "stakedAxnTracker"];
  const balanceData = {};
  const supplyData = {};
  const propsLength = 2;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    balanceData[key] = balances[i * propsLength];
    supplyData[key] = balances[i * propsLength + 1];
  }

  return { balanceData, supplyData };
}

export function getDepositBalanceData(depositBalances) {
  if (!depositBalances || depositBalances.length === 0) {
    return;
  }

  const keys = [
    "axnInStakedAxn",
    "esAxnInStakedAxn",
    "stakedAxnInBonusAxn",
    "bonusAxnInFeeAxn",
    "bnAxnInFeeAxn",
    "alpInStakedAlp",
  ];
  const data = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    data[key] = depositBalances[i];
  }

  return data;
}

export function getVestingData(vestingInfo) {
  if (!vestingInfo || vestingInfo.length === 0) {
    return;
  }

  const keys = ["axnVester", "alpVester"];
  const data = {};
  const propsLength = 7;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    data[key] = {
      pairAmount: vestingInfo[i * propsLength],
      vestedAmount: vestingInfo[i * propsLength + 1],
      escrowedBalance: vestingInfo[i * propsLength + 2],
      claimedAmounts: vestingInfo[i * propsLength + 3],
      claimable: vestingInfo[i * propsLength + 4],
      maxVestableAmount: vestingInfo[i * propsLength + 5],
      averageStakedAmount: vestingInfo[i * propsLength + 6],
    };

    data[key + "PairAmount"] = data[key].pairAmount;
    data[key + "VestedAmount"] = data[key].vestedAmount;
    data[key + "EscrowedBalance"] = data[key].escrowedBalance;
    data[key + "ClaimSum"] = data[key].claimedAmounts.add(data[key].claimable);
    data[key + "Claimable"] = data[key].claimable;
    data[key + "MaxVestableAmount"] = data[key].maxVestableAmount;
    data[key + "AverageStakedAmount"] = data[key].averageStakedAmount;
  }

  return data;
}

export function getStakingData(stakingInfo) {
  if (!stakingInfo || stakingInfo.length === 0) {
    return;
  }

  const keys = ["stakedAxnTracker", "bonusAxnTracker", "feeAxnTracker", "stakedAlpTracker", "feeAlpTracker"];
  const data = {};
  const propsLength = 5;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    data[key] = {
      claimable: stakingInfo[i * propsLength],
      tokensPerInterval: stakingInfo[i * propsLength + 1],
      averageStakedAmounts: stakingInfo[i * propsLength + 2],
      cumulativeRewards: stakingInfo[i * propsLength + 3],
      totalSupply: stakingInfo[i * propsLength + 4],
    };
  }

  return data;
}

export function getProcessedData(
  balanceData,
  supplyData,
  depositBalanceData,
  stakingData,
  vestingData,
  aum,
  nativeTokenPrice,
  stakedAxnSupply,
  axnPrice,
  axnSupply
) {
  if (
    !balanceData ||
    !supplyData ||
    !depositBalanceData ||
    !stakingData ||
    !vestingData ||
    !aum ||
    !nativeTokenPrice ||
    !stakedAxnSupply ||
    !axnPrice ||
    !axnSupply
  ) {
    return {};
  }

  const data: any = {};

  data.axnBalance = balanceData.axn;
  data.axnBalanceUsd = balanceData.axn.mul(axnPrice).div(expandDecimals(1, 18));

  data.axnSupply = bigNumberify(axnSupply);

  data.axnSupplyUsd = data.axnSupply.mul(axnPrice).div(expandDecimals(1, 18));
  data.stakedAxnSupply = stakedAxnSupply;
  data.stakedAxnSupplyUsd = stakedAxnSupply.mul(axnPrice).div(expandDecimals(1, 18));
  data.axnInStakedAxn = depositBalanceData.axnInStakedAxn;
  data.axnInStakedAxnUsd = depositBalanceData.axnInStakedAxn.mul(axnPrice).div(expandDecimals(1, 18));

  data.esAxnBalance = balanceData.esAxn;
  data.esAxnBalanceUsd = balanceData.esAxn.mul(axnPrice).div(expandDecimals(1, 18));

  data.stakedAxnTrackerSupply = supplyData.stakedAxnTracker;
  data.stakedAxnTrackerSupplyUsd = supplyData.stakedAxnTracker.mul(axnPrice).div(expandDecimals(1, 18));
  data.stakedEsAxnSupply = data.stakedAxnTrackerSupply.sub(data.stakedAxnSupply);
  data.stakedEsAxnSupplyUsd = data.stakedEsAxnSupply.mul(axnPrice).div(expandDecimals(1, 18));

  data.esAxnInStakedAxn = depositBalanceData.esAxnInStakedAxn;
  data.esAxnInStakedAxnUsd = depositBalanceData.esAxnInStakedAxn.mul(axnPrice).div(expandDecimals(1, 18));

  data.bnAxnInFeeAxn = depositBalanceData.bnAxnInFeeAxn;
  data.bonusAxnInFeeAxn = depositBalanceData.bonusAxnInFeeAxn;
  data.feeAxnSupply = stakingData.feeAxnTracker.totalSupply;
  data.feeAxnSupplyUsd = data.feeAxnSupply.mul(axnPrice).div(expandDecimals(1, 18));

  data.stakedAxnTrackerRewards = stakingData.stakedAxnTracker.claimable;
  data.stakedAxnTrackerRewardsUsd = stakingData.stakedAxnTracker.claimable.mul(axnPrice).div(expandDecimals(1, 18));

  data.bonusAxnTrackerRewards = stakingData.bonusAxnTracker.claimable;

  data.feeAxnTrackerRewards = stakingData.feeAxnTracker.claimable;
  data.feeAxnTrackerRewardsUsd = stakingData.feeAxnTracker.claimable.mul(nativeTokenPrice).div(expandDecimals(1, 18));

  data.boostBasisPoints = bigNumberify(0);
  if (data && data.bnAxnInFeeAxn && data.bonusAxnInFeeAxn && data.bonusAxnInFeeAxn.gt(0)) {
    data.boostBasisPoints = data.bnAxnInFeeAxn.mul(BASIS_POINTS_DIVISOR).div(data.bonusAxnInFeeAxn);
  }

  data.stakedAxnTrackerAnnualRewardsUsd = stakingData.stakedAxnTracker.tokensPerInterval
    .mul(SECONDS_PER_YEAR)
    .mul(axnPrice)
    .div(expandDecimals(1, 18));
  data.axnAprForEsAxn =
    data.stakedAxnTrackerSupplyUsd && data.stakedAxnTrackerSupplyUsd.gt(0)
      ? data.stakedAxnTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.stakedAxnTrackerSupplyUsd)
      : bigNumberify(0);
  data.feeAxnTrackerAnnualRewardsUsd = stakingData.feeAxnTracker.tokensPerInterval
    .mul(SECONDS_PER_YEAR)
    .mul(nativeTokenPrice)
    .div(expandDecimals(1, 18));
  data.axnAprForNativeToken =
    data.feeAxnSupplyUsd && data.feeAxnSupplyUsd.gt(0)
      ? data.feeAxnTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.feeAxnSupplyUsd)
      : bigNumberify(0);
  data.axnBoostAprForNativeToken = data.axnAprForNativeToken.mul(data.boostBasisPoints).div(BASIS_POINTS_DIVISOR);
  data.axnAprTotal = data.axnAprForNativeToken.add(data.axnAprForEsAxn);
  data.axnAprTotalWithBoost = data.axnAprForNativeToken.add(data.axnBoostAprForNativeToken).add(data.axnAprForEsAxn);
  data.axnAprForNativeTokenWithBoost = data.axnAprForNativeToken.add(data.axnBoostAprForNativeToken);

  data.totalAxnRewardsUsd = data.stakedAxnTrackerRewardsUsd.add(data.feeAxnTrackerRewardsUsd);

  data.alpSupply = supplyData.alp;
  data.alpPrice =
    data.alpSupply && data.alpSupply.gt(0)
      ? aum.mul(expandDecimals(1, TLP_DECIMALS)).div(data.alpSupply)
      : expandDecimals(1, TLP_DECIMALS);

  data.alpSupplyUsd = supplyData.alp.mul(data.alpPrice).div(expandDecimals(1, 18));

  data.alpBalance = depositBalanceData.alpInStakedAlp;
  data.alpBalanceUsd = depositBalanceData.alpInStakedAlp.mul(data.alpPrice).div(expandDecimals(1, TLP_DECIMALS));

  data.stakedAlpTrackerRewards = stakingData.stakedAlpTracker.claimable;
  data.stakedAlpTrackerRewardsUsd = stakingData.stakedAlpTracker.claimable.mul(axnPrice).div(expandDecimals(1, 18));

  data.feeAlpTrackerRewards = stakingData.feeAlpTracker.claimable;
  data.feeAlpTrackerRewardsUsd = stakingData.feeAlpTracker.claimable.mul(nativeTokenPrice).div(expandDecimals(1, 18));

  data.stakedAlpTrackerAnnualRewardsUsd = stakingData.stakedAlpTracker.tokensPerInterval
    .mul(SECONDS_PER_YEAR)
    .mul(axnPrice)
    .div(expandDecimals(1, 18));
  data.alpAprForEsAxn =
    data.alpSupplyUsd && data.alpSupplyUsd.gt(0)
      ? data.stakedAlpTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.alpSupplyUsd)
      : bigNumberify(0);
  data.feeAlpTrackerAnnualRewardsUsd = stakingData.feeAlpTracker.tokensPerInterval
    .mul(SECONDS_PER_YEAR)
    .mul(nativeTokenPrice)
    .div(expandDecimals(1, 18));
  data.alpAprForNativeToken =
    data.alpSupplyUsd && data.alpSupplyUsd.gt(0)
      ? data.feeAlpTrackerAnnualRewardsUsd.mul(BASIS_POINTS_DIVISOR).div(data.alpSupplyUsd)
      : bigNumberify(0);
  data.alpAprTotal = data.alpAprForNativeToken.add(data.alpAprForEsAxn);

  data.totalAlpRewardsUsd = data.stakedAlpTrackerRewardsUsd.add(data.feeAlpTrackerRewardsUsd);

  data.totalEsAxnRewards = data.stakedAxnTrackerRewards.add(data.stakedAlpTrackerRewards);
  data.totalEsAxnRewardsUsd = data.stakedAxnTrackerRewardsUsd.add(data.stakedAlpTrackerRewardsUsd);

  data.axnVesterRewards = vestingData.axnVester.claimable;
  data.alpVesterRewards = vestingData.alpVester.claimable;
  data.totalVesterRewards = data.axnVesterRewards.add(data.alpVesterRewards);
  data.totalVesterRewardsUsd = data.totalVesterRewards.mul(axnPrice).div(expandDecimals(1, 18));

  data.totalNativeTokenRewards = data.feeAxnTrackerRewards.add(data.feeAlpTrackerRewards);
  data.totalNativeTokenRewardsUsd = data.feeAxnTrackerRewardsUsd.add(data.feeAlpTrackerRewardsUsd);

  data.totalRewardsUsd = data.totalEsAxnRewardsUsd.add(data.totalNativeTokenRewardsUsd).add(data.totalVesterRewardsUsd);

  return data;
}

export function getPageTitle(data) {
  return `${data} | Decentralized
  Perpetual Exchange | AXN`;
}

export function isHashZero(value) {
  return value === ethers.constants.HashZero;
}
export function isAddressZero(value) {
  return value === ethers.constants.AddressZero;
}

export function getHomeUrl() {
  if (isLocal()) {
    return "http://localhost:3010";
  }

  return "https://axiodex.com";
}

export function getAppBaseUrl() {
  if (isLocal()) {
    return "http://localhost:3011/#";
  }

  return "https://app.axiodex.com/#";
}

export function getRootShareApiUrl() {
  if (isLocal()) {
    return "https://axns.vercel.app";
  }

  return "https://share.axn.finanace";
}

export function getTradePageUrl() {
  if (isLocal()) {
    return "http://localhost:3011/#/trade";
  }

  return "https://app.axnfinance.com/#/trade";
  // return "https://app.tail.vessellookup.com/#/trade";
}

export function importImage(name) {
  let tokenImage: { default: string } | null = null;

  try {
    tokenImage = require("img/" + name);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return tokenImage?.default;
}

export function getTwitterIntentURL(text, url = "", hashtag = "") {
  let finalURL = "https://twitter.com/intent/tweet?text=";
  if (text.length > 0) {
    finalURL += Array.isArray(text) ? text.map((t) => encodeURIComponent(t)).join("%0a%0a") : encodeURIComponent(text);
    if (hashtag.length > 0) {
      finalURL += "&hashtags=" + encodeURIComponent(hashtag.replace(/#/g, ""));
    }
    if (url.length > 0) {
      finalURL += "&url=" + encodeURIComponent(url);
    }
  }
  return finalURL;
}

export function getPositionForOrder(account, order, positionsMap) {
  const key = getPositionKey(account, order.collateralToken, order.indexToken, order.isLong);

  const position = positionsMap[key];

  return position && position.size && position.size.gt(0) ? position : null;
}

export function getOrderError(account, order, positionsMap, position) {
  if (order.type !== DECREASE) {
    return;
  }

  const positionForOrder = position ? position : getPositionForOrder(account, order, positionsMap);

  if (!positionForOrder) {
    return t`No open position, order cannot be executed unless a position is opened`;
  }
  if (positionForOrder.size.lt(order.sizeDelta)) {
    return t`Order size is bigger than position, will only be executable if position increases`;
  }

  if (positionForOrder.size.gt(order.sizeDelta)) {
    if (positionForOrder.size.sub(order.sizeDelta).lt(positionForOrder.collateral.sub(order.collateralDelta))) {
      return t`Order cannot be executed as it would reduce the position's leverage below 1`;
    }
    if (positionForOrder.size.sub(order.sizeDelta).lt(expandDecimals(5, USD_DECIMALS))) {
      return t`Order cannot be executed as the remaining position would be smaller than $5.00`;
    }
  }
}

export function arrayURLFetcher(...urlArr) {
  const fetcher = (url) => fetch(url).then((res) => res.json());
  return Promise.all(urlArr.map(fetcher));
}

export function shouldShowRedirectModal(timestamp) {
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;
  const expiryTime = timestamp + thirtyDays;
  return !isValidTimestamp(timestamp) || Date.now() > expiryTime;
}
