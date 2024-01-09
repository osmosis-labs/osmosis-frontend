import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

export const AllPoolsTable: FunctionComponent<{
  topOffset: number;
  quickAddLiquidity: (poolId: string) => void;
  quickRemoveLiquidity: (poolId: string) => void;
  quickLockTokens: (poolId: string) => void;
}> = observer(() => {
  return <div></div>;
});
