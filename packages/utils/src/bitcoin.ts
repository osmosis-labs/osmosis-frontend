export const BitcoinChainInfo = {
  prettyName: "Bitcoin",
  chainId: "bitcoin",
  chainName: "Bitcoin",
  color: "#F7931A",
};

export const BitcoinMainnetExplorerUrl =
  "https://www.blockchain.com/explorer/transactions/btc/{txHash}";
export const BitcoinTestnetExplorerUrl =
  "https://mempool.space/testnet/tx/{txHash}";

export const getBitcoinExplorerUrl = ({
  txHash,
  env = "mainnet",
}: {
  txHash: string;
  env?: "mainnet" | "testnet";
}) => {
  return env === "testnet"
    ? BitcoinTestnetExplorerUrl.replace("{txHash}", txHash)
    : BitcoinMainnetExplorerUrl.replace("{txHash}", txHash);
};
