import { useSyncExternalStore } from "react";

import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback);

  return () => {
    window.removeEventListener("scroll", callback);
  };
}

// https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store
function useGetScrollY() {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY, // value on the client
    () => 0 // value on the server
  );
}

// use within relative container
export const BackToTopButton = () => {
  const scrollY = useGetScrollY();

  const isVisible = scrollY > 1;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const { t } = useTranslation();

  return isVisible ? (
    <Button
      onClick={scrollToTop}
      className="z-99 sticky bottom-6 m-auto w-32 !rounded-full transition duration-200 ease-in"
      aria-label="Go to top"
    >
      {t("backToTop")}
    </Button>
  ) : null;
};
