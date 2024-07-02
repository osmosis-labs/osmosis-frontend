import { Dec, Int } from "@keplr-wallet/unit";
import {
  DEFAULT_LRU_OPTIONS,
  queryBalances,
  queryBaseAccount,
  queryFeesBaseDenom,
  queryFeesBaseGasPrice,
  queryFeeTokens,
  queryFeeTokenSpotPrice,
  sendTxSimulate,
} from "@osmosis-labs/server";
import type { Chain } from "@osmosis-labs/types";
import { ApiClientError } from "@osmosis-labs/utils";
import { Buffer } from "buffer/";
import cachified, { CacheEntry } from "cachified";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import {
  AuthInfo,
  Fee,
  SignerInfo,
  TxBody,
  TxRaw,
} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { LRUCache } from "lru-cache";

import { getSumTotalSpenderCoinsSpent } from "./events";

/** Extends the standard chain type with
 *  a list of features that the chain supports. */
type ChainWithFeatures = Chain & { features?: string[] };

/**
 * A StdFee-conforming fee quoted from simulating a transaction.
 * This includes the gas limit and the amount of fee tokens needed to pay the fee.
 * Accounts for fee tokens available on chain, the fee tokens spent during tx simulation,
 * as well the edge case of the last available fee balance being spent during simulation.
 */
export type QuoteStdFee = {
  gas: string;
  amount: readonly {
    denom: string;
    amount: string;

    /**
     * Indicates that the simulated transaction spends the account's balance required for the fee.
     * Likely, the input spent amount needs to be adjusted by subtracting this amount.
     */
    isNeededForTx?: boolean;
  }[];
};

/** Tx body portions relevant for simulation */
export type SimBody = Partial<
  Pick<
    TxBody,
    "messages" | "memo" | "extensionOptions" | "nonCriticalExtensionOptions"
  >
>;

/**
 * Estimates the full gas fee payment for the given encoded messages on the chain specified by given chain ID.
 * Useful for providing the user with an accurate and dynamic fee amount estimate before sending a transaction.
 *
 * The given gas multiplier proviedes a slippage buffer for chains with gas markets (defaults to `1.5`, currently
 * explicitly supports Osmosis fee markets, but could support [Skip Fee Market](https://github.com/skip-mev/feemarket) in the future as well).
 *
 * @throws `SimulateNotAvailableError` if the chain does not support tx simulation.
 * @throws `InsufficientFeeError` if the user does not have enough balance to pay the fee.
 */
export async function estimateGasFee({
  chainId,
  chainList,
  body,
  bech32Address,
  gasMultiplier = 1.5,
  onlyDefaultFeeDenom,
}: {
  chainId: string;
  chainList: ChainWithFeatures[];
  body: SimBody;
  bech32Address: string;

  /** A multiplier to handle variable gas
   *  or to account for slippage in price in gas markets.
   *  Default: `1.5` */
  gasMultiplier?: number;

  /** Force the use of fee token returned by default from `getGasPrice`. Overrides `excludedFeeDenoms` option. */
  onlyDefaultFeeDenom?: boolean;
}): Promise<QuoteStdFee> {
  const { gasUsed, coinsSpent } = await simulateCosmosTxBody({
    chainId,
    chainList,
    body,
    bech32Address,
  });

  const gasLimit = String(Math.round(gasUsed * gasMultiplier));

  if (onlyDefaultFeeDenom) {
    const { feeDenom, gasPrice } = await getDefaultGasPrice({
      chainId,
      chainList,
      gasMultiplier,
    });
    return {
      gas: gasLimit,
      amount: [
        {
          amount: gasPrice.mul(new Dec(gasLimit)).roundUp().toString(),
          denom: feeDenom,
        },
      ],
    };
  }

  const amount = await getGasFeeAmount({
    chainId,
    chainList,
    gasLimit,
    coinsSpent,
    bech32Address,
    gasMultiplier,
  });

  return {
    gas: gasLimit,
    amount,
  };
}

export class SimulateNotAvailableError extends Error {}

/**
 * Attempts to estimate gas amount of the given messages in a tx via a POST to the
 * specified chain.
 *
 * @throws `SimulateNotAvailableError` if the chain does not support tx simulation. If so, it's recommended to use a registered fee amount.
 */
export async function simulateCosmosTxBody({
  chainId,
  chainList,
  body,
  bech32Address,
}: {
  chainId: string;
  chainList: ChainWithFeatures[];
  body: SimBody;
  bech32Address: string;
}): Promise<{
  gasUsed: number;
  /** Coins that left the account at the given address.
   *  Useful for subtracting from amount input if it gas tokens are included. */
  coinsSpent: { denom: string; amount: string }[];
}> {
  const chain = chainList.find((chain) => chain.chain_id === chainId);
  if (!chain) throw new Error("Chain not found: " + chainId);

  // get needed account and message data for a valid tx
  const sequence = await queryBaseAccount({
    chainId,
    chainList,
    bech32Address,
  }).then(({ account }) => Number(account.sequence));
  if (isNaN(sequence)) throw new Error("Invalid sequence number: " + sequence);

  // create placeholder transaction document
  const unsignedTx = TxRaw.encode({
    bodyBytes: TxBody.encode(TxBody.fromPartial(body)).finish(),
    authInfoBytes: AuthInfo.encode({
      signerInfos: [
        SignerInfo.fromPartial({
          // Pub key is ignored.
          // It is fine to ignore the pub key when simulating tx.
          // However, the estimated gas would be slightly smaller because tx size doesn't include pub key.
          modeInfo: {
            single: {
              mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
            },
            multi: undefined,
          },
          sequence,
        }),
      ],
      fee: Fee.fromPartial({
        amount: [],
      }),
    }).finish(),
    // Because of the validation of tx itself, the signature must exist.
    // However, since they do not actually verify the signature, it is okay to use any value.
    signatures: [new Uint8Array(64)],
  }).finish();

  // Include custom error handling to catch specific error scenarios.
  try {
    // Try to send simulate query to chain if available
    const simulation = await sendTxSimulate({
      chainId,
      chainList,
      txBytes: Buffer.from(unsignedTx).toString("base64"),
    });
    const gasUsed = Number(simulation.gas_info?.gas_used ?? NaN);
    if (isNaN(gasUsed)) throw new Error("Gas used is missing or NaN");

    // extract sum total of all coins spent in simulation
    const coinsSpent = getSumTotalSpenderCoinsSpent(
      bech32Address,
      simulation.result?.events ?? []
    );

    return { gasUsed, coinsSpent };
  } catch (e) {
    if (e instanceof ApiClientError) {
      const apiClientError = e as ApiClientError<{
        code?: number;
        message: string;
      }>;

      const status = apiClientError.response?.status;
      const message = apiClientError.data?.message;

      if (status !== 400 || !message || typeof message !== "string") throw e;

      // If the error message includes "invalid empty tx", it means that the chain does not
      // support tx simulation. In this case, just return a specific error type.
      if (message.includes("invalid empty tx")) {
        throw new SimulateNotAvailableError(message);
      }

      // If there is a code, it's a simulate tx error and we should forward its message.
      if (apiClientError?.data?.code) {
        throw new Error(apiClientError?.data?.message);
      }
    }

    throw e;
  }
}

export class InsufficientFeeError extends Error {}

/**
 * Gets the gas fee payment asset amounts for the given chain.
 * If an address is provided, it will attempt to provide amounts from the available fee coin balances
 * at that account address. Otherwise it will use the default fee coin amount(s).
 *
 * If `coinsSpent` are provided, the fee token selection process will account for any spent fee coins.
 * Note: partial fee amounts are not currently supported (mainly by wallet UIs) so for now only single full fee amounts are returned.
 *
 * Can be expanded to handle paying with multiple fee tokens in the future.
 *
 * @throws `InsufficientFeeError` if the user does not have enough balance with any gas token to pay the fee.
 * @throws If chain not found.
 */
export async function getGasFeeAmount({
  chainId,
  chainList,
  gasLimit,
  bech32Address,
  gasMultiplier = 1.5,
  coinsSpent,
}: {
  chainId: string;
  chainList: ChainWithFeatures[];
  bech32Address: string;
  gasLimit: string;
  gasMultiplier?: number;
  /** Coins being spent in applicable transaction.
   *  Will be cross checked with available fee coins on chain and from account if given. */
  coinsSpent?: { denom: string; amount: string }[];
}): Promise<
  {
    denom: string;
    amount: string;
    /** Returns `true` if this fee applies to the edge case where the amount was
     *  spent by the given spent coins list.
     *  Likely, the spent amount needs to be adjusted by subtracting this amount.
     */
    isNeededForTx?: boolean;
  }[]
> {
  const chain = chainList.find((chain) => chain.chain_id === chainId);
  if (!chain) throw new Error("Chain not found: " + chainId);

  // Need to reconcile
  // * Available fee tokens
  // * Account fee token balances
  // * Spent fee tokens

  const [chainFeeDenoms, { balances }] = await Promise.all([
    getChainSupportedFeeDenoms({
      chainId,
      chainList,
    }),
    queryBalances({
      chainId,
      chainList,
      bech32Address,
    }),
  ]);
  const feeBalances: { denom: string; amount: string }[] = [];

  // iterate in order of fee denoms
  for (const denom of chainFeeDenoms) {
    const balance = balances.find((balance) => balance.denom === denom);
    if (balance) {
      feeBalances.push(balance);
    }
  }

  if (!feeBalances.length) {
    throw new InsufficientFeeError(
      "No fee tokens found with sufficient balance on account. Please add funds to continue: " +
        bech32Address
    );
  }

  // first check unspent balances
  const feeDenomsSpent = (coinsSpent ?? []).map(({ denom }) => denom);
  const unspentFeeBalances = feeBalances.filter(
    (balance) => !feeDenomsSpent.includes(balance.denom)
  );

  for (const { denom, amount } of unspentFeeBalances) {
    const { gasPrice: feeDenomGasPrice } = await getGasPriceByFeeDenom({
      chainId,
      chainList,
      feeDenom: denom,
      gasMultiplier,
    });
    const feeAmount = feeDenomGasPrice
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    // Check if this balance is not enough or fee amount is too little (not enough precision) to pay the fee, if so skip.
    if (
      new Dec(feeAmount).gt(new Dec(amount)) ||
      new Dec(feeAmount).lte(new Dec(0))
    )
      continue;

    // found enough to pay the fee that is not spent
    return [
      {
        amount: feeAmount,
        denom,
      },
    ];
  }

  // check spent balances last
  if (!coinsSpent)
    throw new InsufficientFeeError(
      "Insufficient alternative balance for transaction fees. Please add funds to continue: " +
        bech32Address
    );
  const spentFeeBalances = feeBalances.filter((balance) =>
    coinsSpent.some(({ denom }) => denom === balance.denom)
  );

  // get all fee amounts for spent balances so we can prioritize the smallest amounts
  const spentFeesWithAmounts = await Promise.all(
    spentFeeBalances.map((spentFeeBalance) =>
      getGasPriceByFeeDenom({
        chainId,
        chainList,
        feeDenom: spentFeeBalance.denom,
        gasMultiplier,
      }).then(({ gasPrice }) => ({
        ...spentFeeBalance,
        feeAmount: gasPrice.mul(new Dec(gasLimit)).truncate().toString(),
      }))
    )
  );

  // filter spent fees by those that are not enough to pay the fee and sort by smallest amounts
  const spentFees = spentFeesWithAmounts
    .filter((spentFee) =>
      new Dec(spentFee.feeAmount).lte(new Dec(spentFee.amount))
    )
    .sort((a, b) => (new Int(a.feeAmount).lt(new Int(b.feeAmount)) ? -1 : 1));

  for (const { amount, feeAmount, denom } of spentFees) {
    // check for gas price conversion having too little precision
    if (new Dec(feeAmount).lte(new Dec(0))) continue;

    const spentAmount =
      coinsSpent.find((coinSpent) => coinSpent.denom === denom)?.amount || "0";
    const totalSpent = new Dec(spentAmount).add(new Dec(feeAmount));
    const isBalanceNeededForTx = totalSpent.gte(new Dec(amount));

    return [
      {
        amount: feeAmount,
        denom,
        isNeededForTx: isBalanceNeededForTx,
      },
    ];
    // keep trying with other balances
  }

  throw new InsufficientFeeError(
    "Insufficient alternative balance for transaction fees. Please add funds to continue: " +
      bech32Address
  );
}

/**
 * For chains that support multiple fee tokens, this function will return the gas price (either from converting from the base fee or from the chain's fees object) for the given fee token.
 *
 * For tokens with a fee market module, the gas price is calculated by dividing the base fee by the queried spot price of the fee token.
 *
 * @throws If chain or fee denom not found.
 */
export async function getGasPriceByFeeDenom({
  chainId,
  chainList,
  feeDenom,
  gasMultiplier = 1.5,
  defaultGasPrice = 0.025,
}: {
  chainId: string;
  chainList: Chain[];
  feeDenom: string;
  gasMultiplier?: number;
  defaultGasPrice?: number;
}): Promise<{ gasPrice: Dec }> {
  const chain = chainList.find((chain) => chain.chain_id === chainId);
  if (!chain) throw new Error("Chain not found: " + chainId);

  // TODO use reflection call from rpc clients to see if it's available: https://github.com/osmosis-labs/osmosis-frontend/blob/stage/packages/proto-codecs/scripts/codegen.ts#L111
  const chainHasFeeMarketModule = Boolean(
    chain.features?.includes("osmosis-txfees")
  );

  const defaultFee = await getDefaultGasPrice({
    chainId,
    chainList,
    gasMultiplier,
  });

  if (defaultFee.feeDenom === feeDenom) {
    return defaultFee;
  }

  if (chainHasFeeMarketModule) {
    // convert to alternative denom by querying spot price
    // throws if given token does not have a spot price
    const spotPrice = await getFeeTokenSpotPrice({
      chainId,
      chainList,
      denom: feeDenom,
    });

    if (spotPrice.isZero() || spotPrice.isNegative()) {
      throw new Error(`Failed to fetch spot price for fee token ${feeDenom}.`);
    }

    return {
      gasPrice: defaultFee.gasPrice.quo(spotPrice).mul(new Dec(1.01)),
    };
  }

  const feeToken = chain.fees.fee_tokens.find((ft) => ft.denom === feeDenom);
  if (!feeToken) throw new Error("Fee token not found: " + feeDenom);

  return { gasPrice: new Dec(feeToken.average_gas_price ?? defaultGasPrice) };
}

/**
 * Gets base gas price from a dynamic fee module in the chain at the given chain ID,
 * or the average price specified in the chain's fees object in the registry.
 *
 * Gas multiplier is used for chains with fee modules to account for gas price slippage (default: `1.5`).
 *
 * @throws If chain not found.
 */
export async function getDefaultGasPrice({
  chainId,
  chainList,
  gasMultiplier = 1.5,
  defaultGasPrice = 0.025,
}: {
  chainId: string;
  chainList: ChainWithFeatures[];
  gasMultiplier?: number;
  defaultGasPrice?: number;
}) {
  const chain = chainList.find(({ chain_id }) => chain_id === chainId);
  if (!chain) throw new Error("Chain not found: " + chainId);

  // Could eventually be a cosmos-wide fee module, like Skip's incoming fee market module
  // TODO use reflection call from rpc clients to see if it's available: https://github.com/osmosis-labs/osmosis-frontend/blob/stage/packages/proto-codecs/scripts/codegen.ts#L111
  const chainHasFeeMarketModule = Boolean(
    chain.features?.includes("osmosis-txfees")
  );

  let feeDenom: string;
  let gasPrice: Dec;

  if (chainHasFeeMarketModule) {
    // fee market
    const [baseDenom, baseFeePrice] = await Promise.all([
      getFeesBaseDenom({ chainId, chainList }),
      getBaseFeeSpotPrice({ chainId, chainList }),
    ]);

    feeDenom = baseDenom;
    // Add slippage multiplier to account for shifting gas prices in gas market
    gasPrice = baseFeePrice.mul(new Dec(gasMultiplier));
  } else {
    // registry

    feeDenom = chain.fees.fee_tokens[0].denom;
    gasPrice = new Dec(
      chain.fees.fee_tokens[0].average_gas_price || defaultGasPrice
    );
  }

  return { gasPrice, feeDenom };
}

/**
 * Gets the available denoms for paying gas for a given chain ID.
 *
 * @throws If chain not found
 */
export async function getChainSupportedFeeDenoms({
  chainId,
  chainList,
}: {
  chainId: string;
  chainList: ChainWithFeatures[];
}) {
  const chain = chainList.find((chain) => chain.chain_id === chainId);
  if (!chain) throw new Error("Chain not found: " + chainId);

  const chainHasFeeMarketModule = Boolean(
    chain.features?.includes("osmosis-txfees")
  );

  if (chainHasFeeMarketModule) {
    const [baseDenom, alternativeFeeDenoms] = await Promise.all([
      getFeesBaseDenom({ chainId, chainList }),
      getFeeTokenDenoms({ chainId, chainList }),
    ]);

    return [baseDenom, ...alternativeFeeDenoms];
  }

  return chain.fees.fee_tokens.map(({ denom }) => denom);
}

// cached query functions

const queryCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getFeesBaseDenom({
  chainId,
  chainList,
}: {
  chainId: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: queryCache,
    key: "fees-base-denom-" + chainId,
    ttl: process.env.NODE_ENV === "test" ? -1 : 1000 * 60 * 10, // 10 minutes since denoms don't change often
    getFreshValue: () =>
      queryFeesBaseDenom({ chainId, chainList }).then(
        ({ base_denom }) => base_denom
      ),
  });
}

export function getFeeTokenDenoms({
  chainId,
  chainList,
}: {
  chainId: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: queryCache,
    key: "fee-token-denoms-" + chainId,
    ttl: process.env.NODE_ENV === "test" ? -1 : 1000 * 60 * 10, // 10 minutes since denoms don't change often
    getFreshValue: () =>
      queryFeeTokens({ chainId, chainList }).then(({ fee_tokens }) =>
        fee_tokens.map((ft) => ft.denom)
      ),
  });
}

export function getFeeTokenSpotPrice({
  chainId,
  chainList,
  denom,
}: {
  chainId: string;
  chainList: Chain[];
  denom: string;
}) {
  return cachified({
    cache: queryCache,
    key: `spot-price-${chainId}-${denom}`,
    ttl: process.env.NODE_ENV === "test" ? -1 : 1000 * 5, // 5 seconds, shorter in case of swift price changes
    getFreshValue: () =>
      queryFeeTokenSpotPrice({ chainId, chainList, denom }).then(
        ({ spot_price }) => new Dec(spot_price)
      ),
  });
}

export function getBaseFeeSpotPrice({
  chainId,
  chainList,
}: {
  chainId: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: queryCache,
    key: "base-fee-spot-price-" + chainId,
    ttl: process.env.NODE_ENV === "test" ? -1 : 1000 * 5, // 5 seconds, shorter in case of swift price changes
    getFreshValue: () =>
      queryFeesBaseGasPrice({ chainId, chainList }).then(({ base_fee }) => {
        if (isNaN(Number(base_fee)))
          throw new Error("Invalid base fee: " + base_fee);
        return new Dec(base_fee);
      }),
  });
}
