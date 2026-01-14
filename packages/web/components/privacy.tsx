import { Fragment, FunctionComponent } from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";

import { useWindowSize } from "~/hooks";
import { useUserSettingsStore } from "~/stores/user-settings-store";

const privateTextPlaceholder = "***";

// DesktopOnlyPrivateText is hidden with the privateTextPlaceholder on desktop devices
// if hide-balances setting is on. For mobile devices, it is always shown.
export const DesktopOnlyPrivateText: FunctionComponent<{
  text: string | ReactElement;
}> = ({ text }) => {
  const hideBalances = useUserSettingsStore((state) => state.hideBalances);
  const { isMobile } = useWindowSize();

  let displayText = text;
  if (hideBalances && !isMobile) {
    displayText = privateTextPlaceholder;
  }

  return <Fragment>{displayText}</Fragment>;
};
