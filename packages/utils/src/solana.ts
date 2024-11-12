export const SolanaChainInfo = {
  prettyName: "Solana",
  chainId: "solana",
  chainName: "Solana",
  color: "#9945FF",
};

export function getSolanaExplorerUrl({
  hash,
  env = "mainnet",
}: {
  hash: string;
  env?: "mainnet" | "testnet";
}) {
  if (env === "testnet") return `https://solscan.io/tx/${hash}?cluster=testnet`;
  return `https://solscan.io/tx/${hash}`;
}
