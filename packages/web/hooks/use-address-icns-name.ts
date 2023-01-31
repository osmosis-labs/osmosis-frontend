import { useStore } from "../stores";

export function useAddressICNSName(bech32Address: string) {
  const { queriesExternalStore } = useStore();

  const icnsQuery =
    queriesExternalStore.queryICNSNames.getQueryContract(bech32Address);

  return icnsQuery;
}
