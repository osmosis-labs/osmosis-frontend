export const getInt3XRPMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "ibc/013DE940BE791C79142EAD4DF071E1ED280DFEAB8A9DCB5932A4603A74C25CBB" // XRP.int3
    : "ibc/9D44B9A113D449A16FAB9F639FF5B074CAB6D33D049056AB6B4DCE6E3891DD55"; // Testnet XRP.int3
};

export const XrplChainInfo = {
  prettyName: "Xrpl",
  chainId: "xrpl",
  chainName: "Xrpl",
  color: "#000000",
  logoUri: "/networks/xrpl.svg",
};
