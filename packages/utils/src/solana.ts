export const SolanaChainInfo = {
  prettyName: "Solana",
  chainId: "solana",
  chainName: "Solana",
  color: "#9945FF",
  logoUri: "/networks/solana.svg",
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

export const getInt3SOLMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "ibc/A1465DD6AF456FCD0D998869608DFEEDA4F4C11EC0A12AF92A994A3F8CBEE546" // SOL.int3
    : "ibc/931C1E953C5312AB6856BDE136EFBD43FAC52398E484CA2C344F623746BAC4BE"; // Testnet SOL.int3
};
