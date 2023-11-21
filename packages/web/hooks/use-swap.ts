import { Dec, DecUtils } from "@keplr-wallet/unit";
import { Currency } from "@osmosis-labs/types";
import { useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import { useCallback } from "react";

import { MaybeUserAsset } from "~/server/api/edge-routers/assets";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { useAmountInput } from "./input/use-amount-input";
import { useDebouncedState } from "./use-debounced-state";
import { useWalletSelect } from "./wallet-select";
import { useQueryParamState } from "./window/use-query-param-state";

/** Use swap state for managing user input, selecting currencies, as well as querying for quotes.
 *
 *  Features:
 *  * Input amount of from asset
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable assets, with user balances if wallet connected
 *  * Assets search query
 *  * Debounced quote fetching from user input */
export function useSwap({
  initialFromDenom = "ATOM",
  initialToDenom = "OSMO",
  useQueryParams = true,
  useOtherCurrencies = true,
} = {}) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const swapAssets = useSwapAssets({
    initialFromDenom,
    initialToDenom,
    useQueryParams,
    useOtherCurrencies,
  });

  const inAmountInput = useAmountInput(swapAssets.fromAsset);

  // generate debounced quote from user inputs
  const [debouncedInAmount, setDebounceInAmount] = useDebouncedState("", 500);
  useEffect(() => {
    setDebounceInAmount(inAmountInput.inputAmount);
  }, [setDebounceInAmount, inAmountInput.inputAmount]);
  const {
    data: quote,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = api.edge.quoteRouter.routeTokenOutGivenIn.useQuery(
    {
      tokenInDenom: swapAssets.fromAsset!.coinMinimalDenom,
      tokenInAmount: debouncedInAmount,
      tokenOutDenom: swapAssets.toAsset!.coinMinimalDenom,
    },
    {
      enabled: Boolean(
        swapAssets.fromAsset?.coinMinimalDenom &&
          swapAssets.toAsset?.coinMinimalDenom &&
          !isNaN(Number(debouncedInAmount))
      ),
    }
  );

  /** Send trade token in transaction. */
  const sendTradeTokenInTx = useCallback(
    (maxSlippage: Dec) =>
      new Promise<"multiroute" | "multihop" | "exact-in">((resolve, reject) => {
        if (!quote) {
          return reject(
            "User input should be disabled if no route is found or is being generated"
          );
        }

        if (!inAmountInput.amount) return reject("No input");
        if (!account) return reject("No account");

        /**
         * Prepare swap data
         */

        type Pool = {
          id: string;
          tokenOutDenom: string;
        };
        type Route = {
          pools: Pool[];
          tokenInAmount: string;
        };

        const routes: Route[] = [];

        for (const route of quote.split) {
          const pools: Pool[] = [];

          for (let i = 0; i < route.pools.length; i++) {
            const pool = route.pools[i];

            pools.push({
              id: pool.id,
              tokenOutDenom: route.tokenOutDenoms[i],
            });
          }

          routes.push({
            pools: pools,
            tokenInAmount: route.initialAmount.toString(),
          });
        }

        /** In amount converted to integer (remove decimals) */
        const tokenIn = {
          currency: swapAssets.fromAsset as Currency,
          amount: inAmountInput.amount.toCoin().amount,
        };

        /** Out amount with slippage included */
        const tokenOutMinAmount = quote.amount
          .toDec()
          .mul(new Dec(1).sub(maxSlippage))
          .mulTruncate(
            DecUtils.getTenExponentNInPrecisionRange(
              swapAssets.toAsset!.coinDecimals
            )
          )
          .toString();

        /**
         * Send messages to account
         */
        if (routes.length === 1) {
          const { pools } = routes[0];
          account.osmosis
            .sendSwapExactAmountInMsg(
              pools,
              tokenIn,
              tokenOutMinAmount,
              undefined,
              undefined,
              () => {
                resolve(pools.length === 1 ? "exact-in" : "multihop");
              }
            )
            .catch((reason) => {
              reject(reason);
            })
            .finally(() => {
              inAmountInput.setAmount("");
            });
          return pools.length === 1 ? "exact-in" : "multihop";
        } else if (routes.length > 1) {
          account.osmosis
            .sendSplitRouteSwapExactAmountInMsg(
              routes,
              tokenIn,
              tokenOutMinAmount,
              undefined,
              undefined,
              () => {
                resolve("multiroute");
              }
            )
            .catch((reason) => {
              reject(reason);
            })
            .finally(() => {
              inAmountInput.setAmount("");
            });
        } else {
          reject("No routes given");
        }
      }),
    [quote, inAmountInput, account, swapAssets.fromAsset, swapAssets.toAsset]
  );

  return {
    ...swapAssets,
    inAmountInput,
    quote,
    // TODO: look into errors serialization
    quoteError,
    isQuoteLoading,
    sendTradeTokenInTx,
  };
}

/** Use assets for swapping: the from and to assets, as well as the list of
 *  swappable assets. Sorts by balance if user is signed in.
 *
 *  Features:
 *  * Option to store from and to assets in query params, default = yes
 *  * Paginated swappable assets, with user balances if wallet connected
 *  * Assets search query */
export function useSwapAssets({
  initialFromDenom = "ATOM",
  initialToDenom = "OSMO",
  useQueryParams = true,
  useOtherCurrencies = true,
} = {}) {
  const { chainStore, accountStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  const { fromAssetDenom, toAssetDenom, setFromAssetDenom, setToAssetDenom } =
    useToFromDenoms(useQueryParams, initialFromDenom, initialToDenom);

  const switchAssets = useCallback(() => {
    const temp = fromAssetDenom;
    setFromAssetDenom(toAssetDenom);
    setToAssetDenom(temp);
  }, [fromAssetDenom, toAssetDenom, setFromAssetDenom, setToAssetDenom]);

  // search with query param string and get first search result as in and out asset
  // we're trusting that the search returns the right asset when given either denom or minimal denom
  // not using denoms may yield unexpected results
  const { data: fromAssets, isLoading: isLoadingFromAsset } =
    api.edge.assets.getAssets.useQuery(
      {
        search: { query: fromAssetDenom! },
        userOsmoAddress: account?.address,
      },
      { enabled: Boolean(fromAssetDenom) && !isLoadingWallet }
    );
  const fromAsset: MaybeUserAsset | undefined = fromAssets?.items[0];
  const { data: toAssets, isLoading: isLoadingToAsset } =
    api.edge.assets.getAssets.useQuery(
      {
        search: { query: toAssetDenom! },
        userOsmoAddress: account?.address,
      },
      { enabled: Boolean(toAssetDenom) && !isLoadingWallet }
    );
  const toAsset: MaybeUserAsset | undefined = toAssets?.items[0];

  // get selectable currencies for trading, including user balances if wallect connected
  const [assetsQueryInput, setAssetsQueryInput] = useState<string>("");
  const search = useMemo(
    () => (assetsQueryInput ? { query: assetsQueryInput } : undefined),
    [assetsQueryInput]
  );
  const {
    data: selectableAssetPages,
    isLoading: isLoadingSelectAssets,
    fetchNextPage,
  } = api.edge.assets.getAssets.useInfiniteQuery(
    {
      userOsmoAddress: account?.address,
      search,
    },
    {
      enabled:
        !isLoadingWallet &&
        Boolean(fromAssetDenom) &&
        Boolean(toAssetDenom) &&
        useOtherCurrencies,
    }
  );

  /** Remove to and from assets from assets that can be selected. */
  const filteredSelectableAssets =
    selectableAssetPages?.pages
      .flatMap(({ items }) => items)
      .filter(
        (asset) =>
          asset.coinMinimalDenom !== fromAsset?.coinMinimalDenom &&
          asset.coinMinimalDenom !== toAsset?.coinMinimalDenom
      ) ?? [];

  return {
    fromAsset,
    toAsset,
    assetsQueryInput,
    selectableAssets: filteredSelectableAssets,
    isLoadingSelectAssets,
    isLoadingFromAsset,
    isLoadingToAsset,
    setAssetsQueryInput,
    setFromAssetDenom,
    setToAssetDenom,
    switchAssets,
    fetchNextPageAssets: fetchNextPage,
  };
}

/** Switches on query params or react state to store to/from asset denoms.
 *  The initial denoms will be ignored if the user set preferences via query params. */
function useToFromDenoms(
  useQueryParams: boolean,
  initialFromDenom?: string,
  initialToDenom?: string
) {
  // user query params as state source-of-truth
  // ignores initial denoms if there are query params
  const [fromDenomQueryParam, setFromDenomQueryParam] = useQueryParamState(
    "from",
    useQueryParams ? initialFromDenom : undefined
  );
  const fromDenomQueryParamStr =
    typeof fromDenomQueryParam === "string" ? fromDenomQueryParam : undefined;
  const [toAssetQueryParam, setToAssetQueryParam] = useQueryParamState(
    "to",
    useQueryParams ? initialToDenom : undefined
  );
  const toDenomQueryParamStr =
    typeof toAssetQueryParam === "string" ? toAssetQueryParam : undefined;

  // if query params are not used, use react state as source-of-truth
  const [fromAssetState, setFromAssetState] = useState<string | undefined>(
    initialFromDenom
  );
  const [toAssetState, setToAssetState] = useState<string | undefined>(
    initialToDenom
  );

  return {
    fromAssetDenom: useQueryParams ? fromDenomQueryParamStr : fromAssetState,
    toAssetDenom: useQueryParams ? toDenomQueryParamStr : toAssetState,
    setFromAssetDenom: useQueryParams
      ? setFromDenomQueryParam
      : setFromAssetState,
    setToAssetDenom: useQueryParams ? setToAssetQueryParam : setToAssetState,
  };
}
