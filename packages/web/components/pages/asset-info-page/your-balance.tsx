import { observer } from "mobx-react-lite";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useAssetInfo } from "~/hooks/use-asset-info";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface YourBalanceProps {
  className?: string;
}

export const YourBalance = observer(({ className }: YourBalanceProps) => {
  const { chainStore, accountStore } = useStore();
  const { bridgeAsset } = useBridge();
  const { token } = useAssetInfo();
  const { t } = useTranslation();

  const osmosisChainId = chainStore.osmosis.chainId;
  const account = accountStore.getWallet(osmosisChainId);

  const { data } = api.edge.assets.getUserAsset.useQuery(
    {
      findMinDenomOrSymbol: token.coinDenom,
      userOsmoAddress: account?.address,
    },
    { enabled: Boolean(account?.address) }
  );

  if (!account?.isWalletConnected) {
    return null;
  }

  return (
    <section
      className={`${className} rounded-3xl border border-osmoverse-700 p-6`}
    >
      <header className="mb-2">
        <h5 className="text-body2 font-body2 text-osmoverse-400">
          {t("tokenInfos.yourBalance")}
        </h5>
      </header>

      <p className="mb-2 text-h4 font-h4">
        {data?.usdValue?.toString() ?? "-"}
      </p>

      <p className="mb-6 text-body1 font-body1 text-osmoverse-300">
        {data?.amount?.toString() ?? "-"} {t("tokenInfos.onOsmosis")}
      </p>

      <div className="flex gap-3">
        <Button
          size="lg-full"
          className="flex flex-1 items-center"
          onClick={() => bridgeAsset(token.coinMinimalDenom, "deposit")}
        >
          <Icon className="mr-2" id="deposit" height={16} width={16} />
          {t("assets.historyTable.colums.deposit")}
        </Button>
        <Button
          size="lg-full"
          className="flex flex-1 items-center"
          variant="secondary"
          onClick={() => bridgeAsset(token.coinMinimalDenom, "withdraw")}
        >
          <Icon className="mr-2" id="withdraw" height={16} width={16} />
          {t("assets.historyTable.colums.withdraw")}
        </Button>
      </div>
    </section>
  );
});