export const useOrderbook = ({ poolId }: { poolId: string }) => {
  const [baseDenom, quoteDenom] = useOrderbookDenoms(poolId);
  const address = useOrderbookAddress(poolId);
  return {
    baseDenom,
    quoteDenom,
    address,
  };
};

const useOrderbookDenoms = (_poolId: string) => {
  //TODO: Implement
  return ["ION", "OSMO"];
};

const useOrderbookAddress = (_poolId: string) => {
  // TODO: Implement
  return "osmo1svmdh0ega4jg44xc3gg36tkjpzrzlrgajv6v6c2wf0ul8m3gjajs0dps9w";
};
