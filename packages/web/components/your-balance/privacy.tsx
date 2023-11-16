import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";

import { useWindowSize } from "~/hooks";
import { useStore } from "~/stores";
import { HideBalancesState } from "~/stores/user-settings";

const privateTextPlaceholder = "***";

// DesktopOnlyPrivateText is hidden with the privateTextPlaceholder on desktop devices
// if hide-balances setting is on. For mobile devices, it is always shown.
export const DesktopOnlyPrivateText: FunctionComponent<{
  text: string | ReactElement;
}> = observer(({ text }) => {
  const { userSettings } = useStore();
  const { isMobile } = useWindowSize();

  const hideBalancesSetting =
    userSettings.getUserSettingById<HideBalancesState>("hide-balances");

  const shouldHideBalances = hideBalancesSetting?.state.hideBalances;

  if (shouldHideBalances && !isMobile) {
    text = privateTextPlaceholder;
  }

  return <div>{text}</div>;
});
