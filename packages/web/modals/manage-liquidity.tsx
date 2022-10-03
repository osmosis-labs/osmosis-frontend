import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ModalBase, ModalBaseProps } from "./base";
import { TabBox, Slider } from "../components/control/";
import { AddLiquidity } from "../components/complex/add-liquidity";
import { useConnectWalletModalRedirect, useWindowSize } from "../hooks";
import {
  ObservableAddLiquidityConfig,
  ObservableRemoveLiquidityConfig,
} from "@osmosis-labs/stores";

export interface Props extends ModalBaseProps {
  addLiquidityConfig: ObservableAddLiquidityConfig;
  getFiatValue?: (coin: CoinPretty) => PricePretty | undefined;
  removeLiquidityConfig: ObservableRemoveLiquidityConfig;
  onAddLiquidity: () => void;
  onRemoveLiquidity: () => void;
  isSendingMsg?: boolean;
}

export const ManageLiquidityModal: FunctionComponent<Props> = observer(
  (props) => {
    const {
      addLiquidityConfig,
      getFiatValue,
      removeLiquidityConfig,
      onAddLiquidity,
      onRemoveLiquidity,
      isSendingMsg = false,
    } = props;

    const { isMobile } = useWindowSize();
    const [selectedTabIndex, setSelectedTabIndex] = useState<0 | 1>(0);

    const { showModalBase, accountActionButton } =
      useConnectWalletModalRedirect(
        {
          className: "h-14 md:w-full md:px-1 w-96 mt-3 mx-auto",
          size: "lg",
          loading: isSendingMsg,
          disabled:
            (selectedTabIndex === 0 &&
              addLiquidityConfig.error !== undefined) ||
            isSendingMsg ||
            (selectedTabIndex === 1 &&
              removeLiquidityConfig.poolShareWithPercentage
                .toDec()
                .equals(new Dec(0))),
          onClick: selectedTabIndex === 0 ? onAddLiquidity : onRemoveLiquidity,
          children:
            selectedTabIndex === 0 ? "Add Liquidity" : "Remove Liquidity",
        },
        props.onRequestClose
      );

    return (
      <ModalBase {...props} isOpen={props.isOpen && showModalBase}>
        <TabBox
          className="w-full"
          rerenderTabs
          tabSelection={{
            selectedTabIndex,
            onTabSelected: (index) => {
              if (index === 0 || index === 1) {
                setSelectedTabIndex(index);
              }
            },
          }}
          tabs={[
            {
              title: "Add Liquidity",
              content: (
                <AddLiquidity
                  addLiquidityConfig={addLiquidityConfig}
                  actionButton={accountActionButton}
                  getFiatValue={getFiatValue}
                />
              ),
            },
            {
              title: "Remove Liquidity",
              content: (
                <div className="flex flex-col text-center">
                  {isMobile ? (
                    <h5 className="mt-5">{`${removeLiquidityConfig.percentage}%`}</h5>
                  ) : (
                    <h2 className="mt-12">{`${removeLiquidityConfig.percentage}%`}</h2>
                  )}
                  <div className="caption text-white-disabled">
                    ~
                    {removeLiquidityConfig.poolShareAssetsWithPercentage.map(
                      (asset, index) => (
                        <span key={asset.currency.coinDenom}>
                          {asset.toString()}
                          {index !==
                            removeLiquidityConfig.poolShareAssetsWithPercentage
                              .length -
                              1 && " : "}
                        </span>
                      )
                    )}
                  </div>
                  <Slider
                    className="w-full my-8"
                    type="plain"
                    currentValue={removeLiquidityConfig.percentage}
                    onInput={(value) =>
                      removeLiquidityConfig.setPercentage(value.toString())
                    }
                    disabled={removeLiquidityConfig.poolShareWithPercentage
                      .toDec()
                      .equals(new Dec(0))}
                    min={0}
                    max={100}
                    step={1}
                  />
                  <div className="grid grid-cols-4 gap-5 h-9 w-full md:mb-6 mb-14">
                    <button
                      onClick={() => removeLiquidityConfig.setPercentage("25")}
                      disabled={removeLiquidityConfig.poolShareWithPercentage
                        .toDec()
                        .equals(new Dec(0))}
                      className="button w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
                    >
                      <p className="text-secondary-200">25%</p>
                    </button>
                    <button
                      onClick={() => removeLiquidityConfig.setPercentage("50")}
                      disabled={removeLiquidityConfig.poolShareWithPercentage
                        .toDec()
                        .equals(new Dec(0))}
                      className="button w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
                    >
                      <p className="text-secondary-200">50%</p>
                    </button>
                    <button
                      onClick={() => removeLiquidityConfig.setPercentage("75")}
                      disabled={removeLiquidityConfig.poolShareWithPercentage
                        .toDec()
                        .equals(new Dec(0))}
                      className="button w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
                    >
                      <p className="text-secondary-200">75%</p>
                    </button>
                    <button
                      onClick={() => removeLiquidityConfig.setPercentage("100")}
                      disabled={removeLiquidityConfig.poolShareWithPercentage
                        .toDec()
                        .equals(new Dec(0))}
                      className="button w-full h-full rounded-md border border-secondary-200 flex justify-center items-center hover:opacity-75 disabled:opacity-30"
                    >
                      <p className="text-secondary-200">MAX</p>
                    </button>
                  </div>
                  {accountActionButton}
                </div>
              ),
            },
          ]}
        />
      </ModalBase>
    );
  }
);
