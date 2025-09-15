export const getInt3BCHMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "ibc/869E01805EBBDDCAEA588666CD5149728B7DC7D69F30D92F77AD67F77CEB3FDA" // BCH.int3
    : "ibc/B746CC188C8315EE135101C7F77D361AF6A62A4740EEDBB99A8AC5A80246D719"; // Testnet BCH.int3
};

export const BitcoinCashChainInfo = {
  prettyName: "Bitcoin Cash",
  chainId: "bitcoin-cash",
  chainName: "Bitcoin Cash",
  color: "#0AC18E",
  logoUri: "/networks/bitcoin-cash.svg",
};
