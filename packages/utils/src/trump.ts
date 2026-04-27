export const getInt3TRUMPMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "ibc/51BFF64A432CBBA08A1ED95609BF0255EC4BBF699BFCDFF267F66CCD664CA350" // TRUMP.int3
    : ""; // there is no Testnet TRUMP.int3
};
