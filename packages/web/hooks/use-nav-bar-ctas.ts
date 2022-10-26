import { useEffect } from "react";
import { CallToAction } from "../stores/nav-bar";
import { useStore } from "../stores";

export function useNavBarCtas(ctas: CallToAction[]) {
  const { navBarStore } = useStore();

  useEffect(() => {
    navBarStore.callToActionButtons = ctas;
    return () => {
      navBarStore.callToActionButtons = [];
    };
  }, []);
}
