import { Dec } from "@keplr-wallet/unit";
import {
  queryBalances,
  queryBaseAccount,
  queryFeeTokens,
  queryFeeTokenSpotPrice,
  queryGasPrice,
  sendTxSimulate,
} from "@osmosis-labs/server";
import type { Chain } from "@osmosis-labs/types";
import { ApiClientError } from "@osmosis-labs/utils";
import { Buffer } from "buffer/";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import {
  AuthInfo,
  Fee,
  SignerInfo,
  TxBody,
  TxRaw,
} from "cosmjs-types/cosmos/tx/v1beta1/tx";

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
  const { gasUsed, coinsSpent } = await simulate({
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
    // also return max last send token balance if the send token is the only available fee token balance
  };
}

export class SimulateNotAvailableError extends Error {}
/** Tx body portions relevant for simulation */
export type SimBody = Partial<
  Pick<
    TxBody,
    "messages" | "memo" | "extensionOptions" | "nonCriticalExtensionOptions"
  >
>;

/**
 * Attempts to estimate gas amount of the given messages in a tx via a POST to the
 * specified chain.
 *
 * @throws `SimulateNotAvailableError` if the chain does not support tx simulation. If so, it's recommended to use a registered fee amount.
 */
export async function simulate({
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
    chainId: chain.chain_id,
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

  // availabe chain fee denoms
  const chainFeeDenoms = await getChainSupportedFeeDenoms({
    chainId,
    chainList,
  });

  // account fee denoms with amounts
  const { balances } = await queryBalances({
    bech32Address,
    chainId,
    chainList,
  });
  const feeBalances = balances.filter((balance) =>
    chainFeeDenoms.some((denom) => denom === balance.denom)
  );

  if (!feeBalances.length) {
    throw new InsufficientFeeError(
      "No fee tokens found with sufficient balance on account. Please add funds to continue: " +
        bech32Address
    );
  }

  let foundFee:
    | { denom: string; amount: string; isNeededForTx?: boolean }
    | undefined;
  // loop to find the applicable fee amongst account balances
  for (const feeTokenBalance of feeBalances) {
    const { gasPrice: feeDenomGasPrice } = await getGasPriceByFeeDenom({
      chainId: chainId,
      chainList,
      feeDenom: feeTokenBalance.denom,
      gasMultiplier,
    });
    const feeAmount = feeDenomGasPrice
      .mul(new Dec(gasLimit))
      .truncate()
      .toString();

    if (new Dec(feeAmount).gt(new Dec(feeTokenBalance.amount))) continue;

    const isLastToken = feeBalances.length === 1;
    const spentAmount =
      coinsSpent?.find(({ denom }) => denom === feeTokenBalance.denom)
        ?.amount || "0";
    const totalSpent = new Dec(spentAmount).add(new Dec(feeAmount));

    if (isLastToken && totalSpent.gt(new Dec(feeTokenBalance.amount))) {
      // the coins spent in this transaction exceeds the amount needed for fee
      foundFee = {
        amount: feeAmount,
        denom: feeTokenBalance.denom,
        isNeededForTx: true,
      };
    } else {
      foundFee = {
        amount: feeAmount,
        denom: feeTokenBalance.denom,
      };
    }
    break;
  }

  if (!foundFee) {
    throw new InsufficientFeeError(
      "Insufficient alternative balance for transaction fees. Please add funds to continue: " +
        bech32Address
    );
  }

  return [foundFee];
}

/**
 * For chains that support multiple fee tokens, this function will return the gas price.
 *
 * For tokens with a fee market module, the gas price is calculated by dividing the base fee by the queried spot price of the fee token.
 *
 * @throws If chain not found.
 */
export async function getGasPriceByFeeDenom({
  chainId,
  chainList,
  feeDenom,
  gasMultiplier = 1.5,
}: {
  /**
   * Chain to fetch the fee token spot price from.
   * This requires the chain to have the Osmosis fee module.
   */
  chainId: string;
  chainList: Chain[];
  feeDenom: string;
  gasMultiplier?: number;
}): Promise<{ gasPrice: Dec }> {
  const chain = chainList.find((chain) => chain.chain_id === chainId);
  if (!chain) throw new Error("Chain not found: " + chainId);

  // TODO use reflection call from rpc clients to see if it's available: https://github.com/osmosis-labs/osmosis-frontend/blob/stage/packages/proto-codecs/scripts/codegen.ts#L111
  const chainHasFeeMarketModule = Boolean(
    chain.features?.includes("osmosis-txfees")
  );

  const defaultGasPrice = await getDefaultGasPrice({
    chainId,
    chainList,
    gasMultiplier,
  });

  if (chainHasFeeMarketModule) {
    const spotPriceDec = await queryFeeTokenSpotPrice({
      chainId,
      chainList,
      denom: feeDenom,
    }).then(({ spot_price }) => new Dec(spot_price));

    if (spotPriceDec.isZero() || spotPriceDec.isNegative()) {
      throw new Error(`Failed to fetch spot price for fee token ${feeDenom}.`);
    }

    return {
      gasPrice: defaultGasPrice.gasPrice.quo(spotPriceDec).mul(new Dec(1.01)),
    };
  }

  return defaultGasPrice;
}

/** Gets gas price from a dynamic fee module in the chain at the given chain ID,
 *  or the average price specified in the chain's fees object in the registry.
 *
 *  Gas multiplier is used for chains with fee modules to account for gas price slippage (default: `1.5`).
 *
 *  @throws If chain not found.
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
  const defaultFeeCurrency = chain.fees.fee_tokens[0];

  let gasPrice: number | undefined;

  if (chainHasFeeMarketModule) {
    const baseFee = await queryGasPrice({
      chainId,
      chainList,
    }).then(({ base_fee }) => Number(base_fee));
    if (isNaN(baseFee)) throw new Error("Invalid base fee: " + baseFee);

    // Add slippage multiplier to account for shifting gas prices in gas market
    gasPrice = baseFee * gasMultiplier;
  } else {
    gasPrice = defaultFeeCurrency.average_gas_price || defaultGasPrice;
  }

  return { gasPrice: new Dec(gasPrice), feeDenom: defaultFeeCurrency.denom };
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

  return chainHasFeeMarketModule
    ? await queryFeeTokens({ chainId, chainList }).then(({ fee_tokens }) =>
        fee_tokens.map((ft) => ft.denom)
      )
    : chain.fees.fee_tokens.map(({ denom }) => denom);
}
