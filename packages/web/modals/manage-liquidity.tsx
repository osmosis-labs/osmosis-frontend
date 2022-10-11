import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ModalBase, ModalBaseProps } from "./base";
import { TabBox } from "../components/control/";
import { AddLiquidity } from "../components/complex/add-liquidity";
import { RemoveLiquidity } from "../components/complex/remove-liquidity";
import { useConnectWalletModalRedirect } from "../hooks";
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
                <RemoveLiquidity
                  removeLiquidityConfig={removeLiquidityConfig}
                  actionButton={accountActionButton}
                />
              ),
            },
          ]}
        />
      </ModalBase>
    );
  }
);
