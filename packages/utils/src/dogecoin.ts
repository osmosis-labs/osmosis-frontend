export const getInt3DOGEMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "ibc/B3DFDC2958A2BE482532DA3B6B5729B469BE7475598F7487D98B1B3E085245DE" // DOGE.int3
    : "ibc/FCB9537564D517E821D0438AB6CA3BBE03B9E2B2C661B89311181329DFD331C4"; // Testnet DOGE.int3
};

export const DogecoinChainInfo = {
  prettyName: "Dogecoin",
  chainId: "dogecoin",
  chainName: "Dogecoin",
  color: "#C2A63D",
  logoUri: "/networks/dogecoin.svg",
};
