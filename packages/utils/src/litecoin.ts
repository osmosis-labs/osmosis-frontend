export const getInt3LTCMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "ibc/905326586AE1C86AC8B1CDB20BE957DE5FB23963EDD2C9ADD3E835CC22115A46" // LTC.int3
    : "ibc/713D13C42B4EC1327AAD87602393D8870089B59005F552289E46141ABCF79F4C"; // Testnet LTC.int3
};

export const LitecoinChainInfo = {
  prettyName: "Litecoin",
  chainId: "litecoin",
  chainName: "Litecoin",
  color: "#345D9D",
  logoUri: "/networks/litecoin.svg",
};
