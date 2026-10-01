import type {
  AppCurrency,
  AssetList,
  Chain,
  ChainInfo,
  ChainInfoWithExplorer,
  FeeCurrency,
} from "@osmosis-labs/types";
import type { CW20Currency, Secret20Currency } from "@osmosis-labs/unit";

/**
 * Derives chain data at runtime rather than storing it in the generated chain list, where it
 * duplicated `currencies`, `feeCurrencies` and `stakeCurrency` (~40% of the list gzipped).
 *
 * Kept free of Node APIs: it runs in the browser. Chains passed here come from the generated
 * list, so the Osmosis chain id, name and endpoint overwrites are already applied.
 */

const tokensDir = "/tokens/generated";
export function getImageRelativeFilePath(imageUrl: string, symbol: string) {
  const urlParts = imageUrl.split("/");
  const fileNameSplit = urlParts[urlParts.length - 1].split(".");
  const fileType = fileNameSplit[fileNameSplit.length - 1];
  return `${tokensDir}/${symbol.toLowerCase()}.${fileType}`;
}

/** Adds the chain-registry `fees` and `staking` fields CosmosKit reads when suggesting chains. */
export function withCosmosKitFields<TChain extends Chain>(chain: TChain) {
  return {
    ...chain,
    fees: {
      fee_tokens: (chain.feeCurrencies ?? []).map((token) => ({
        ...token,
        denom: token.coinMinimalDenom,
        fixed_min_gas_price: token.gasPriceStep?.low ?? 0,
        low_gas_price: token.gasPriceStep?.low,
        average_gas_price: token.gasPriceStep?.average,
        high_gas_price: token.gasPriceStep?.high,
      })),
    },
    staking: {
      staking_tokens: chain.stakeCurrency ? [chain.stakeCurrency] : [],
    },
  };
}

/** Builds the Keplr `ChainInfo` used by the Keplr chain store. */
export function getKeplrCompatibleChain({
  chain,
  assetLists,
}: {
  chain: Chain;
  assetLists: AssetList[];
}): ChainInfoWithExplorer {
  const assetList = assetLists.find(
    ({ chain_id }) => chain_id === chain.chain_id
  );
  if (!assetList) {
    throw new Error(`Missing asset list for chain ${chain.chain_id}`);
  }

  return {
    rpc: chain.apis?.rpc[0]?.address ?? "",
    rest: chain.apis?.rest[0]?.address ?? "",
    chainId: chain.chain_id,
    chainName: chain.chain_name,
    prettyChainName: chain.prettyName,
    bip44: {
      coinType: chain.slip44 ?? 118,
    },
    currencies: getCurrencies(chain),
    stakeCurrency: getStakeCurrency(chain, assetList),
    feeCurrencies: getFeeCurrencies(chain, assetList),
    bech32Config: chain.bech32Config,
    explorerUrlToTx: chain.explorers?.[0]?.txPage.replace("${", "{") ?? "",
    features: chain.features,
  };
}

/**
 * Only contract tokens carry a `type` key. Native denoms must not have one at all, not even
 * `type: undefined`: Keplr's staking rewards query skips any currency where `"type" in
 * currency`, so a `type` on `uosmo` hides every staking reward.
 */
function getContractTypeField(
  coinMinimalDenom: string
): { type: CW20Currency["type"] | Secret20Currency["type"] } | undefined {
  if (coinMinimalDenom.startsWith("cw20:secret")) return { type: "secret20" };
  if (coinMinimalDenom.startsWith("cw20:")) return { type: "cw20" };
  return undefined;
}

function isContractDenom(coinMinimalDenom: string) {
  return (
    coinMinimalDenom
      .split(/(\w+):(\w+)/)
      .filter((val) => Boolean(val) && !val.startsWith(":")).length > 1
  );
}

function getGasPriceStep(
  chain: Chain,
  coinMinimalDenom: string
): ChainInfo["gasPriceStep"] {
  const step = chain.feeCurrencies?.find(
    (token) => token.coinMinimalDenom === coinMinimalDenom
  )?.gasPriceStep;
  if (!step?.low || !step.average || !step.high) return undefined;
  return { low: step.low, average: step.average, high: step.high };
}

function getCurrencies(chain: Chain): AppCurrency[] {
  return (chain.currencies ?? []).map((asset) => {
    const coinMinimalDenom = asset.coinMinimalDenom ?? "";
    const isContractToken = isContractDenom(coinMinimalDenom);
    const imageUrl = asset.coinImageUrl ?? "";

    return {
      ...getContractTypeField(coinMinimalDenom),
      coinDenom: asset.coinDenom,
      /**
       * In Keplr ChainStore, denom should start with "type:contractAddress:denom" if it is for the token based on contract.
       */
      coinMinimalDenom: isContractToken
        ? coinMinimalDenom + `:${asset.coinDenom}`
        : coinMinimalDenom,
      contractAddress: isContractToken ? coinMinimalDenom.split(":")[1]! : "",
      coinDecimals: asset.coinDecimals,
      coinGeckoId: asset.coinGeckoId,
      coinImageUrl: imageUrl
        ? getImageRelativeFilePath(imageUrl, asset.coinDenom)
        : undefined,
      base: asset.coinMinimalDenom,
      gasPriceStep: getGasPriceStep(chain, coinMinimalDenom),
    };
  });
}

function getStakeCurrency(
  chain: Chain,
  assetList: AssetList
): ChainInfoWithExplorer["stakeCurrency"] {
  const stakingTokenDenom = chain.stakeCurrency?.coinMinimalDenom ?? "";
  const stakeAsset = assetList.assets.find(
    (asset) => asset.coinMinimalDenom === stakingTokenDenom
  );

  // Some chains have no staking token (e.g. Noble). Our Keplr stores predate the nullable
  // stake currency, so they get a placeholder. Only other-chain staking UIs would read it.
  if (!stakeAsset?.decimals) {
    return {
      coinDecimals: 0,
      coinDenom: "STAKE",
      coinMinimalDenom: "tempStakePlaceholder",
    };
  }

  const imageUrl = stakeAsset.logoURIs?.svg ?? stakeAsset.logoURIs?.png;
  return {
    coinDecimals: stakeAsset.decimals,
    coinDenom: stakeAsset.symbol,
    coinMinimalDenom: stakeAsset.coinMinimalDenom,
    coinGeckoId: stakeAsset.coingeckoId,
    coinImageUrl: imageUrl
      ? getImageRelativeFilePath(imageUrl, stakeAsset.symbol)
      : undefined,
    base: stakeAsset.coinMinimalDenom,
  };
}

function getFeeCurrencies(chain: Chain, assetList: AssetList): FeeCurrency[] {
  return (chain.feeCurrencies ?? []).flatMap((token) => {
    const asset = assetList.assets.find(
      (asset) => asset.coinMinimalDenom === token.coinMinimalDenom
    );
    if (!asset) return [];

    const coinMinimalDenom = asset.coinMinimalDenom;
    const isContractToken = isContractDenom(coinMinimalDenom);
    const imageUrl = asset.logoURIs?.svg ?? asset.logoURIs?.png;

    return {
      ...getContractTypeField(coinMinimalDenom),
      coinDenom: asset.symbol,
      coinMinimalDenom: isContractToken
        ? coinMinimalDenom + `:${asset.symbol}`
        : coinMinimalDenom,
      contractAddress: isContractToken ? coinMinimalDenom.split(":")[1] : "ƒ",
      coinDecimals: asset.decimals,
      coinGeckoId: asset.coingeckoId,
      coinImageUrl: imageUrl
        ? getImageRelativeFilePath(imageUrl, asset.symbol)
        : undefined,
      base: asset.coinMinimalDenom,
      gasPriceStep: getGasPriceStep(chain, coinMinimalDenom),
    };
  });
}
