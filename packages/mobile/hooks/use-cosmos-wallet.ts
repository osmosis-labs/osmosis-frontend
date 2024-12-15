export const useCosmosWallet = () => {
  if (!!process.env.EXPO_PUBLIC_OSMOSIS_ADDRESS) {
    return {
      walletName: "Wallet 1",
      address: process.env.EXPO_PUBLIC_OSMOSIS_ADDRESS,
    };
  }

  return {
    walletName: undefined,
    address: undefined,
  };
};
