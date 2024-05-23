import type { StdFee } from "@cosmjs/stargate";
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

/** Extends the standard chain type with
 *  a list of features that the chain supports. */
type ChainWithFeatures = Chain & { features?: string[] };

export type EstimationOpts = {
  /** Flag to also get the gas amounts while accounting for account balances.
   *  Default: `true` */
  getGasAmount?: boolean;

  /** A multiplier to handle variable gas
   *  or to account for slippage in price in gas markets.
   *  Default: `1.5` */
  gasMultiplier?: number;
} & (
  | {
      /** Base denoms of fee tokens to exclude. */
      excludedFeeDenoms?: string[];
    }
  | {
      /** Force the use of fee token returned by default from `getGasPrice` */
      onlyDefaultFeeDenom: true;
    }
);

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
  getGasAmount = true,
  ...opts
}: {
  chainId: string;
  chainList: ChainWithFeatures[];
  body: Partial<TxBody>;
  bech32Address: string;
} & EstimationOpts): Promise<StdFee> {
  const { gasUsed } = await simulate({
    chainId,
    chainList,
    body,
    bech32Address,
  });

  const gasLimit = String(Math.round(gasUsed * gasMultiplier));

  if (!getGasAmount) {
    return {
      gas: gasLimit,
      amount: [],
    };
  }

  const amount = await getGasFeeAmount({
    chainId,
    chainList,
    gasLimit,
    bech32Address:
      // excluding the address will force the use of the default fee token
      // since user balances will not be taken into account for deciding on the fee token
      "onlyDefaultFeeDenom" in opts && Boolean(opts.onlyDefaultFeeDenom)
        ? undefined
        : bech32Address,
    excludedFeeDenoms:
      "excludedFeeDenoms" in opts ? opts.excludedFeeDenoms : [],
  });

  return {
    gas: gasLimit,
    amount,
  };
}

export class SimulateNotAvailableError extends Error {}
/** Tx body portions relevant to simulating */
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
}): Promise<{ gasUsed: number }> {
  const chain = chainList.find(
    (chain) => chainId && chain.chain_id === chainId
  );
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
    // Try to send simulate query to chain consensus layer.
    const gasUsed = await sendTxSimulate({
      chainList,
      txBytes: Buffer.from(unsignedTx).toString("base64"),
    }).then((result) => Number(result.gas_info.gas_used));
    if (isNaN(gasUsed)) throw new Error("Gas used is NaN");
    return { gasUsed };
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
 * If an address is provided, it will attempt to provide amounts from the available fee token balances
 * at that account address. Otherwise it will use the default fee token amount(s).
 *
 * Can be expanded to handle paying with multiple fee tokens in the future.
 *
 * @throws `InsufficientFeeError` if the user does not have enough balance to pay the fee.
 */
export async function getGasFeeAmount({
  chainId,
  chainList,
  gasLimit,
  bech32Address,
  excludedFeeDenoms = [],
  gasMultiplier = 1.5,
}: {
  chainId: string;
  chainList: ChainWithFeatures[];
  bech32Address?: string;
  gasLimit: string;
  /** Base denoms */
  excludedFeeDenoms?: string[];
  gasMultiplier?: number;
}): Promise<{ denom: string; amount: string }[]> {
  const chain = chainList.find(
    (chain) => chainId && chain.chain_id === chainId
  );
  if (!chain) throw new Error("Chain not found: " + chainId);

  if (!bech32Address) {
    // use defaults and not available fee token balances
    const { feeDenom, gasPrice } = await getGasPrice({
      chainId,
      chainList,
      gasMultiplier,
    });
    return [
      {
        amount: gasPrice.mul(new Dec(gasLimit)).roundUp().toString(),
        denom: feeDenom,
      },
    ];
  }

  const [{ gasPrice: chainGasPrice, feeDenom }, { balances }] =
    await Promise.all([
      getGasPrice({
        chainId,
        chainList,
        gasMultiplier,
      }),
      queryBalances({
        bech32Address,
        chainId,
        chainList,
      }),
    ]);

  let fee = {
    amount: chainGasPrice.mul(new Dec(gasLimit)).roundUp().toString(),
    denom: feeDenom,
  };

  const feeBalance = balances.find((balance) => balance.denom === fee.denom);

  const chainHasFeeMarketModule = Boolean(
    chain?.features?.includes("osmosis-txfees")
  );

  const isBalanceInsufficientForBaseFee =
    (feeBalance && new Dec(fee.amount).gt(new Dec(feeBalance.amount))) ||
    !feeBalance;

  // If the chain doesn't support the Osmosis chain fee module, check that the user has enough balance
  // to pay the fee denom, otherwise throw an error.
  if (!chainHasFeeMarketModule && isBalanceInsufficientForBaseFee) {
    throw new InsufficientFeeError(
      "Insufficient balance for transaction fees. Please add funds to continue: " +
        bech32Address
    );
  }

  // If the chain supports the Osmosis chain fee module, check that the user has enough balance
  // to pay the fee denom, otherwise find another fee token to use.
  if (
    chainHasFeeMarketModule &&
    (isBalanceInsufficientForBaseFee || excludedFeeDenoms.includes(fee.denom))
  ) {
    const { fee_tokens } = await queryFeeTokens({ chainId, chainList });

    const feeTokenBalances = balances.filter(
      (balance) =>
        fee_tokens.some(({ denom }) => denom === balance.denom) &&
        !excludedFeeDenoms.includes(balance.denom)
    );

    if (!feeTokenBalances.length) {
      throw new InsufficientFeeError(
        "No fee tokens found with sufficient balance on account. Please add funds to continue: " +
          bech32Address
      );
    }

    let alternateFee: { denom: string; amount: string } | undefined;
    for (const feeTokenBalance of feeTokenBalances) {
      const { gasPrice: feeDenomGasPrice } = await getGasPriceByFeeDenom({
        chainId: chainId,
        chainList,
        feeDenom: feeTokenBalance.denom,
        // Here chain gas price is the osmosis eip base fee since the osmosis fee module is enabled.
        baseFee: chainGasPrice.toString(),
      });
      const feeAmount = feeDenomGasPrice
        .mul(new Dec(gasLimit))
        .truncate()
        .toString();

      // If the fee is greater than the user's balance, continue to the next fee token.
      if (new Dec(feeAmount).gt(new Dec(feeTokenBalance.amount))) continue;

      alternateFee = {
        amount: feeAmount,
        denom: feeTokenBalance.denom,
      };
      break;
    }

    if (!alternateFee) {
      throw new InsufficientFeeError(
        "Insufficient alternative balance for transaction fees. Please add funds to continue: " +
          bech32Address
      );
    }

    fee = alternateFee;
  }

  if (!fee) {
    throw new InsufficientFeeError(
      "Insufficient balance for transaction fees. Please add funds to continue: " +
        bech32Address
    );
  }

  return [fee];
}

/** Gets gas price from a dynamic fee module in the chain at the given chain ID,
 *  or the average price specified in the chain's fees object in the registry.
 *
 *  Gas multiplier is used for chains with fee modules to account for gas price slippage (default: `1.5`).
 */
export async function getGasPrice({
  chainId,
  chainList,
  gasMultiplier = 1.5,
}: {
  chainId: string;
  chainList: ChainWithFeatures[];
  gasMultiplier?: number;
}) {
  const chain = chainList.find(({ chain_id }) => chain_id === chainId);
  if (!chain) throw new Error("Chain not found: " + chainId);

  // Could eventually be a cosmos-wide fee module, like Skip's incoming fee market module
  const chainHasFeeMarketModule = Boolean(
    chain.features?.includes("osmosis-txfees")
  );
  const feeCurrency = chain.fees.fee_tokens[0];

  let gasPrice: number | undefined;

  if (chainHasFeeMarketModule) {
    const baseFee = await queryGasPrice({
      chainId,
      chainList,
    }).then(({ base_fee }) => Number(base_fee));
    if (isNaN(baseFee)) throw new Error("Invalid base fee: " + baseFee);

    // Add slippage multiplier
    gasPrice = baseFee * gasMultiplier;
  } else {
    gasPrice = feeCurrency.average_gas_price || DefaultGasPriceStep.average;
  }

  return { gasPrice: new Dec(gasPrice), feeDenom: feeCurrency.denom };
}

/**
 * For chains that support multiple fee tokens, the gas price is calculated from the
 * base fee token's price relative to the alternative fee token price.
 *
 * @throws if an invalid spot price is supplied
 */
export async function getGasPriceByFeeDenom({
  chainId,
  chainList,
  feeDenom,
  baseFee,
}: {
  /**
   * Chain to fetch the fee token spot price from.
   * This requires the chain to have the Osmosis fee module.
   */
  chainId: string;
  chainList: Chain[];
  feeDenom: string;
  /**
   * The osmosis fee module current base fee token to use for
   * the gas price calculation. It can be fetched with this.queryGasPrice
   */
  baseFee: string | undefined;
}): Promise<{ gasPrice: Dec }> {
  const spotPriceDec = await queryFeeTokenSpotPrice({
    chainId,
    chainList,
    denom: feeDenom,
  }).then(({ spot_price }) => new Dec(spot_price));

  if (spotPriceDec.isZero() || spotPriceDec.isNegative()) {
    throw new Error(`Failed to fetch spot price for fee token ${feeDenom}.`);
  }

  const gasPrice = new Dec(baseFee ?? DefaultGasPriceStep.average)
    .quo(spotPriceDec)
    .mul(new Dec(1.01));

  return { gasPrice };
}

export const DefaultGasPriceStep: {
  low: number;
  average: number;
  high: number;
} = {
  low: 0.01,
  average: 0.025,
  high: 0.04,
};
