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

export const getAllBtcMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC"
    : undefined; // No testnet allBTC for now.
};

export const getnBTCMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F" // nBTC
    : "ibc/72D483F0FD4229DBF3ACC78E648F0399C4ACADDFDBCDD9FE791FEE4443343422"; // Testnet nBTC
};
