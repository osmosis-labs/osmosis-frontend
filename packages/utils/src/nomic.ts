export function getNomicRelayerUrl({ env }: { env: "mainnet" | "testnet" }) {
  return env === "testnet"
    ? ["https://testnet-relayer.nomic.io:8443"]
    : ["https://relayer.nomic.mappum.io:8443"];
}
