// import { timezoneOffset } from "domain/prices";
import { CHART_PERIODS } from "lib/legacy";
import { Bar } from "./types";

export function getObjectKeyFromValue(value, object) {
  return Object.keys(object).find((key) => object[key] === value);
}

export function formatTimeInBarToMs(bar: Bar) {
  return {
    ...bar,
    time: bar.time * 1000,
  };
}

export function getCurrentCandleTime(period: string) {
  // Converts current time to seconds, rounds down to nearest period, adds timezone offset, and converts back to milliseconds
  const periodSeconds = CHART_PERIODS[period];
  return Math.floor(Date.now() / 1000 / periodSeconds) * periodSeconds /* + timezoneOffset*/;
}

export const getScaleFromPrice = (price: number) => {
  const [part1, part2] = price.toFixed(8).split('.')
  if(Number(part1) > 0)
    return 100
  // if(part2) {
  //   const pos = part2.indexOf('0')
  //   return Math.pow(10, pos + 3)
  // }
  if(part2) for(let i = 6;i>0;i--) {
    if(part2.startsWith('0'.repeat(i)))
      return Math.pow(10, i + 2)
  }
  return 100
}

export function getPriceScale(bar: Bar) {
  return Math.max(...[
    getScaleFromPrice(bar.open),
    getScaleFromPrice(bar.close),
    getScaleFromPrice(bar.high),
    getScaleFromPrice(bar.low),
  ])
}
