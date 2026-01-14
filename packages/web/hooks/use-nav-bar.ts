import { ReactNode, useEffect } from "react";

import { CallToAction, useNavBarStore } from "~/stores/nav-bar-store";

export function useNavBar({
  title,
  ctas,
}: {
  title?: ReactNode;
  hideTitle?: boolean;
  ctas?: CallToAction[];
}) {
  useEffect(() => {
    const { setTitle, setCallToActionButtons } = useNavBarStore.getState();
    if (title) setTitle(title);
    if (ctas) setCallToActionButtons(ctas);
    return () => {
      setTitle(undefined);
      setCallToActionButtons([]);
    };
  }, [title, ctas]);
}
