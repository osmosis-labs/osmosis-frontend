import { useAsync } from "react-use";

import { useStore } from "~/stores";

export const useOneCLickTradingInfo = () => {
  const { accountStore } = useStore();
  const { value } = useAsync(
    async () => accountStore.getOneClickTradingInfo(),
    [accountStore.oneClickTradingInfo]
  );

  return { oneClickTradingInfo: value };
};
