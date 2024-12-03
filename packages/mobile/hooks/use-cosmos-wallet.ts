export const useCosmosWallet = () => {
  if (process.env.EXPO_PUBLIC_OSMOSIS_ADDRESS) {
    return {
      address: process.env.EXPO_PUBLIC_OSMOSIS_ADDRESS,
    };
  }

  return {
    address: undefined,
  };
};
