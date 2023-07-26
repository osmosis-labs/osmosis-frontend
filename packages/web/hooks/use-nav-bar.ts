import { useEffect } from "react";

import { useStore } from "../stores";
import { CallToAction } from "../stores/nav-bar";

export function useNavBar({
  title,
  ctas,
}: {
  title?: string;
  ctas?: CallToAction[];
}) {
  const { navBarStore } = useStore();

  useEffect(() => {
    if (title) navBarStore.title = title;
    if (ctas) navBarStore.callToActionButtons = ctas;
    return () => {
      navBarStore.title = undefined;
      navBarStore.callToActionButtons = [];
    };
  }, [title, ctas]);
}
