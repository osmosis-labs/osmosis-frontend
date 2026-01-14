import { Fragment, FunctionComponent } from "react";
import { ReactElement } from "react-markdown/lib/react-markdown";

import { useUserSettingsStore } from "~/stores/user-settings-store";

const privateTextPlaceholder = "*****";

// Displays a placeholder when the user has enabled "Hide balances".
export const DesktopOnlyPrivateText: FunctionComponent<{
  text: string | ReactElement;
}> = ({ text }) => {
  const hideBalances = useUserSettingsStore((state) => state.hideBalances);

  let displayText = text;
  if (hideBalances) {
    displayText = privateTextPlaceholder;
  }

  return <Fragment>{displayText}</Fragment>;
};
