import { FunctionComponent } from "react";
import { ModalBase, ModalBaseProps } from "./base";
import { TabBox } from "../components/control/tab-box";
import {
  AddLiquidity,
  Props as AddLiquidityProps,
} from "../components/complex/pool/add-liquidity";
import {
  RemoveLiquidity,
  Props as RemoveLiquidityProps,
} from "../components/complex/pool/remove-liquidity";

export interface Props
  extends ModalBaseProps,
    AddLiquidityProps,
    RemoveLiquidityProps {}

export const ManageLiquidityModal: FunctionComponent<Props> = (props) => {
  return (
    <ModalBase {...props}>
      <TabBox
        className="w-full"
        tabs={[
          {
            title: "Add Liquidity",
            content: (
              <AddLiquidity
                {...props}
                onAddLiquidity={() => {
                  props.onAddLiquidity();
                }}
              />
            ),
          },
          {
            title: "Remove Liquidity",
            content: (
              <RemoveLiquidity
                {...props}
                onRemoveLiquidity={() => {
                  props.onRemoveLiquidity();
                }}
              />
            ),
          },
        ]}
      />
    </ModalBase>
  );
};
