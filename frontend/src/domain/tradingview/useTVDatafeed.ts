import { HistoryCallback, PeriodParams, ResolutionString, SubscribeBarsCallback } from "charting_library";
import { getNativeToken, getTokens, isChartAvailabeForToken } from "config/tokens";
import { SUPPORTED_RESOLUTIONS } from "config/tradingview";
import { useChainId } from "lib/chains";
import { USD_DECIMALS } from "lib/legacy";
import { formatAmount } from "lib/numbers";
import { useEffect, useMemo, useRef } from "react";
import { TVDataProvider } from "./TVDataProvider";
import { SymbolInfo } from "./types";
import { formatTimeInBarToMs, getPriceScale, getScaleFromPrice } from "./utils";

const configurationData = {
  supported_resolutions: Object.keys(SUPPORTED_RESOLUTIONS),
  supports_marks: false,
  supports_timescale_marks: false,
  supports_time: true,
  reset_cache_timeout: 100,
};

type Props = {
  dataProvider?: TVDataProvider;
};

export default function useTVDatafeed({ dataProvider }: Props) {
  const { chainId } = useChainId();
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>();
  const resetCacheRef = useRef<() => void | undefined>();
  const activeTicker = useRef<string | undefined>();
  const tvDataProvider = useRef<TVDataProvider>();
  const shouldRefetchBars = useRef<boolean>(false);
  const stableTokens = getTokens().filter((t) => t.isStable).map((t) => t.symbol);

  useEffect(() => {
    if (dataProvider && tvDataProvider.current !== dataProvider) {
      tvDataProvider.current = dataProvider;
    }
  }, [dataProvider]);

  return useMemo(() => {
    return {
      resetCache: function () {
        shouldRefetchBars.current = true;
        resetCacheRef.current?.();
        shouldRefetchBars.current = false;
      },
      datafeed: {
        onReady: (callback) => {
          setTimeout(() => callback(configurationData));
        },
        resolveSymbol(symbolName, onSymbolResolvedCallback) {
          if (!isChartAvailabeForToken(symbolName)) {
            symbolName = getNativeToken().symbol;
          }
          if(dataProvider) {
            dataProvider.getCurrentPriceOfToken(chainId, symbolName).then(currentPrice => {
              const price = parseFloat(formatAmount(currentPrice, USD_DECIMALS, 8))
              const info = {
                name: symbolName,
                type: "crypto",
                description: symbolName + " / USD",
                ticker: symbolName,
                session: "24x7",
                minmov: 1,
                pricescale: getScaleFromPrice(price),
                timezone: "Etc/UTC",
                has_intraday: true,
                has_daily: true,
                currency_code: "USD",
                visible_plots_set: "ohlc",
                data_status: "streaming",
                isStable: stableTokens.includes(symbolName),
              }
              setTimeout(() => onSymbolResolvedCallback(info));
            })
          }
        },

        async getBars(
          symbolInfo: SymbolInfo,
          resolution: ResolutionString,
          periodParams: PeriodParams,
          onHistoryCallback: HistoryCallback,
          onErrorCallback: (error: string) => void
        ) {
          if (!SUPPORTED_RESOLUTIONS[resolution]) {
            return onErrorCallback("[getBars] Invalid resolution");
          }
          const { ticker, isStable } = symbolInfo;
          if (activeTicker.current !== ticker) {
            activeTicker.current = ticker;
          }

          try {
            if (!ticker) {
              onErrorCallback("Invalid ticker!");
              return;
            }
            const bars = await tvDataProvider.current?.getBars(
              chainId,
              ticker,
              resolution,
              isStable,
              periodParams,
              shouldRefetchBars.current
            );
            const noData = !bars || bars.length === 0;
            onHistoryCallback(bars, { noData });
          } catch {
            onErrorCallback("Unable to load historical data!");
          }
        },
        async subscribeBars(
          symbolInfo: SymbolInfo,
          resolution: ResolutionString,
          onRealtimeCallback: SubscribeBarsCallback,
          _subscribeUID,
          onResetCacheNeededCallback: () => void
        ) {
          const { ticker, isStable } = symbolInfo;
          if (!ticker) {
            return;
          }
          if(intervalRef.current) clearInterval(intervalRef.current);
          resetCacheRef.current = onResetCacheNeededCallback;
          if (!isStable) {
            intervalRef.current = setInterval(function () {
              tvDataProvider.current?.getLiveBar(chainId, ticker, resolution).then((bar) => {
                if (bar && ticker === activeTicker.current) {
                  onRealtimeCallback(formatTimeInBarToMs(bar));
                }
              });
            }, 500);
          }
        },
        unsubscribeBars: () => {
          // intervalRef.current && clearInterval(intervalRef.current);
        },
      },
    };
  }, [chainId]);
}
