import { BigNumber } from "@ethersproject/bignumber";
import { Token } from "domain/tokens";

export type Position = {
  key: string;
  contractKey?: string;
  collateralToken: Token;
  indexToken: Token;
  isLong: boolean;
  size: BigNumber;
  collateral: BigNumber;
  averagePrice: BigNumber;
  entryFundingRate: BigNumber;
  cumulativeFundingRate: BigNumber;
  hasRealisedProfit: boolean;
  realisedPnl: BigNumber;
  lastIncreasedTime: number;
  hasProfit: boolean;
  delta: BigNumber;
  markPrice: BigNumber;
  fundingFee: BigNumber;
  collateralAfterFee: BigNumber;
  closingFee: BigNumber;
  positionFee: BigNumber;
  totalFees: BigNumber;
  pendingDelta: BigNumber;
  hasLowCollateral: boolean;
  deltaPercentage: BigNumber;
  deltaStr: string;
  deltaPercentageStr: string;
  deltaBeforeFeesStr: string;
  hasProfitAfterFees: boolean;
  pendingDeltaAfterFees: BigNumber;
  deltaPercentageAfterFees: BigNumber;
  deltaAfterFeesStr: string;
  deltaAfterFeesPercentageStr: string;
  netValue: BigNumber;
  leverage: BigNumber;
  leverageStr: string;
};

export type Positions = Position[];
