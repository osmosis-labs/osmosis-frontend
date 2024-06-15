export const useOrderbookPool = ({
  baseDenom,
  quoteDenom,
}: {
  baseDenom: string;
  quoteDenom: string;
}) => {
  return {
    poolId: "1",
    baseDenom,
    quoteDenom,
    orderbookContractAddress:
      "osmo1svmdh0ega4jg44xc3gg36tkjpzrzlrgajv6v6c2wf0ul8m3gjajs0dps9w",
  };
};
