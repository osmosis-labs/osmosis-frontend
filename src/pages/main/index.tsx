import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

export const MainPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  return <div>{accountInfo.bech32Address}</div>;
});
