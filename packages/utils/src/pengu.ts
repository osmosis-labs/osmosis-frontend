export const getInt3PENGUMinimalDenom = ({
  env,
}: {
  env: "mainnet" | "testnet";
}) => {
  return env === "mainnet"
    ? "ibc/2C5CB5DB3D86F64FDE6155A3A94D7543A126DA55490309EEDF59A0765873DA1C" // PENGU.int3
    : ""; // there is no Testnet PENGU.int3
};
