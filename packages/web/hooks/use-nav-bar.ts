import { useEffect } from "react";
import { CallToAction } from "../stores/nav-bar";
import { useStore } from "../stores";

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
