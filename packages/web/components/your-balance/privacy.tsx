import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";

import { useStore } from "~/stores";
import { HideBalancesState } from "~/stores/user-settings";

export const PrivateText: FunctionComponent<{
  text: string | ReactElement;
}> = observer(({ text }) => {
  const { userSettings } = useStore();

  const hideBalancesSetting =
    userSettings.getUserSettingById<HideBalancesState>("hide-balances");

  const shouldHideBalances = hideBalancesSetting?.state.hideBalances;

  if (shouldHideBalances) {
    text = "***";
  }

  return <div>{text}</div>;
});
