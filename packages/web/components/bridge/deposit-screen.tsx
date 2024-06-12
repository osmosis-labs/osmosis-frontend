import classNames from "classnames";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { Button } from "~/components/ui/button";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const DepositScreen = () => {
  const {
    accountStore,
    chainStore: {
      osmosis: { chainId },
    },
  } = useStore();
  const wallet = accountStore.getWallet(chainId);

  const { data: asset, isLoading } = api.edge.assets.getUserAsset.useQuery({
    findMinDenomOrSymbol: "USDC",
  });

  if (isLoading || !asset) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col items-center justify-center p-4 text-white-full">
      <h5 className="mb-6 flex items-center justify-center gap-3">
        <span>Deposit</span>{" "}
        <img className="h-8 w-8" src={asset.coinImageUrl} alt="token image" />{" "}
        <span>{asset.coinDenom}</span>
      </h5>

      <div className="mb-6 flex w-full flex-col gap-2">
        <div className="flex w-full gap-2">
          <span className="body1 flex-1 text-osmoverse-300">From network</span>
          {/* Render to match the height of the right arrow for the network selectors */}
          <Icon id="arrow-right" className="invisible" />
          <span className="body1 flex-1 text-osmoverse-300">To network</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="subtitle1 flex-1 rounded-[48px] bg-osmoverse-825 py-2 px-4">
            Noble
          </div>

          <Icon id="arrow-right" className="text-osmoverse-300" />

          <div className="subtitle1 flex-1 rounded-[48px] border border-osmoverse-700 py-2 px-4 text-osmoverse-200">
            Osmosis
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="relative flex items-center justify-center">
          <div className="justify-self-center">
            <div className="text-center text-4xl font-bold">$0</div>
            <div className="text-center text-sm">0 {asset.coinDenom}</div>
          </div>

          <button className="body2 absolute right-0 rounded-5xl border border-osmoverse-700 py-2 px-3 text-wosmongton-200">
            Max
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-osmoverse-1000">
          {[
            {
              label: "USDC.e",
              amount: "$80.00 available",
              active: true,
            },
            { label: "USDC", amount: "$30.00", active: false },
            { label: "USDC.axl", amount: "$10.00", active: false },
          ].map(({ label, amount, active }, index) => (
            <button
              key={index}
              className={classNames(
                "subtitle1 flex w-full flex-col items-center rounded-lg p-2",
                {
                  "bg-osmoverse-825 text-wosmongton-100": active,
                  "text-osmoverse-100": !active,
                }
              )}
            >
              <span>{label}</span>
              <span className="body2 text-osmoverse-300">{amount}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="body1 text-osmoverse-300">Transfer with</span>
          <div className="flex items-center gap-2 rounded-lg">
            <img
              src={wallet?.walletInfo.logo}
              alt={wallet?.walletInfo.prettyName}
              className="h-6 w-6"
            />
            <span>{wallet?.walletInfo.prettyName}</span>
            <Icon
              id="chevron-down"
              width={12}
              height={12}
              className="text-osmoverse-300"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Spinner className="text-wosmongton-500" />
            <span className="body1 text-osmoverse-300">Estimating time</span>
          </div>

          <span className="body1 text-osmoverse-300">Calculating fees</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button className="w-full">Review deposit</Button>

          <button className="text-lg font-h6 text-wosmongton-200">
            More deposit options
          </button>
        </div>
      </div>
    </div>
  );
};
