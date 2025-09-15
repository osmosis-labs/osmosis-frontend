export const getInt3TONMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "ibc/DDE1238DCBC338C0FD0700A72CBD64C017B7A646C4A46789ADFB5D47F1E52E38" // TON.int3
    : "ibc/17993F75F724B0CB68D0C26642007CDD62286010974B843F86507F383E9F19F3"; // Testnet TON.int3
};

export const TonChainInfo = {
  prettyName: "Ton",
  chainId: "ton",
  chainName: "Ton",
  color: "#0088CC",
  logoUri: "/networks/ton.svg",
};
