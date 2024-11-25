import { queryGithubFile } from "@osmosis-labs/server";
import {
  Asset,
  AssetList,
  Chain,
  ChainList,
  IbcTransferMethod,
} from "@osmosis-labs/types";

function getOsmosisChainId(environment: "testnet" | "mainnet") {
  return environment === "testnet" ? "osmo-test-5" : "osmosis-1";
}

function groupAssetByChain({
  assetList,
  chain,
  asset,
}: {
  assetList: AssetList[];
  chain: Chain;
  asset: Asset;
}) {
  const assetlistIndex = assetList.findIndex(
    ({ chain_name }) => chain_name === chain.chain_name
  );

  const chainId = chain.chain_id;
  const chainName = chain.chain_name;
  const augmentedAsset: Asset = {
    ...asset,
    relative_image_url: asset.logoURIs.png ?? asset.logoURIs.svg!,
  };

  if (assetlistIndex === -1) {
    assetList.push({
      chain_name: chainName,
      chain_id: chainId,
      assets: [augmentedAsset],
    });
  } else {
    assetList[assetlistIndex].assets.push(augmentedAsset);
  }

  return assetList;
}

interface GitHubResponseAssetList {
  chainName: string;
  assets: Omit<Asset, "chain_id">[];
}

export function formatMobileAssetLists({
  rawAssetList,
  chains,
  environment,
}: {
  rawAssetList: GitHubResponseAssetList;
  chains: Chain[];
  environment: "testnet" | "mainnet";
}) {
  const osmosisChainId = getOsmosisChainId(environment);
  const assetLists = rawAssetList.assets.reduce<AssetList[]>((acc, asset) => {
    /** If it's from the first chain, assume it's an Osmosis asset */
    if (asset.chainName === chains[0].chain_name) {
      const chain = chains.find((chain) => chain.chain_id === osmosisChainId);

      if (!chain) {
        throw new Error("Failed to find chain osmosis");
      }

      return groupAssetByChain({ assetList: acc, chain, asset });
    }

    /** Otherwise, assume IBC asset 1 hop counterparty. */
    const cosmosCounterparty = [...asset.transferMethods]
      .reverse()
      .find(({ type }) => type === "ibc") as IbcTransferMethod | undefined;

    if (!cosmosCounterparty) {
      throw new Error(
        "Failed to find cosmos counterparty for IBC asset: " + asset.symbol
      );
    }

    const counterpartyChainName = cosmosCounterparty.counterparty.chainName;

    const chain = chains.find(
      (chain) => chain.chain_name === counterpartyChainName
    );

    if (!chain) {
      throw new Error(
        `Failed to find chain ${counterpartyChainName}. ${asset.symbol} for that chain will be skipped.`
      );
    }

    return groupAssetByChain({ assetList: acc, chain, asset });
  }, [] as AssetList[]);
  return assetLists;
}

function formatChains({ chainList }: { chainList: ChainList }) {
  return chainList.chains.map((chain): Chain => {
    return {
      ...chain,
      explorers: chain.explorers.map((explorer) => ({
        ...explorer,
        tx_page: explorer.tx_page.replace("${", "{"),
      })),
    };
  });
}

function getGitHubFilePath({
  chainId,
  fileType,
}: {
  chainId: string;
  fileType: "assetlist" | "chainlist";
}) {
  // TEMPORARY
  // use legacy chain list
  if (fileType === "chainlist") {
    return `${chainId}/${chainId}.${fileType}.json`;
  }

  return `${chainId}/generated/frontend/${fileType}.json`;
}

export async function getMobileAssetListAndChains({
  environment,
}: {
  environment: "testnet" | "mainnet";
}) {
  const repo = "osmosis-labs/assetlists";
  const [rawAssetList, rawChainList] = await Promise.all([
    queryGithubFile<GitHubResponseAssetList>({
      repo,
      filePath: getGitHubFilePath({
        chainId: getOsmosisChainId(environment),
        fileType: "assetlist",
      }),
      defaultBranch: "main",
    }),
    queryGithubFile<ChainList>({
      repo,
      filePath: getGitHubFilePath({
        chainId: getOsmosisChainId(environment),
        fileType: "chainlist",
      }),
    }),
  ]);

  const chainList = formatChains({ chainList: rawChainList });
  const assetLists = formatMobileAssetLists({
    rawAssetList: rawAssetList,
    chains: chainList,
    environment,
  });

  return { assetLists, chainList };
}
