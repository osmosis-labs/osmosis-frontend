import { useState } from "react";
import { useEffect } from "react";

import { Button } from "~/components/ui/button";

// use within relative container
export const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 1) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return isVisible ? (
    <Button
      onClick={scrollToTop}
      className="z-99 fixed inset-x-1/2 bottom-6 m-auto w-32 !rounded-full transition duration-200 ease-in"
      aria-label="Go to top"
    >
      Back to top
    </Button>
  ) : null;
};
