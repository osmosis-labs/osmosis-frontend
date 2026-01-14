import { Fragment, FunctionComponent, ReactNode } from "react";

import { useUserSettingsStore } from "~/stores/user-settings-store";

const privateTextPlaceholder = "*****";

// Displays a placeholder when the user has enabled "Hide balances".
export const PrivateText: FunctionComponent<{
  text: ReactNode;
}> = ({ text }) => {
  const hideBalances = useUserSettingsStore((state) => state.hideBalances);

  let displayText = text;
  if (hideBalances) {
    displayText = privateTextPlaceholder;
  }

  return <Fragment>{displayText}</Fragment>;
};
