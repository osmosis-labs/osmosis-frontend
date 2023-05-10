import { useEffect, useState } from "react";

/**
 * Return current `document.visibilityState`.
 * Listen for "visibilitychange" event and update state whenever event emitted.
 * In nextjs, there is no `visibilityState` because `document` does not exist on the server.
 * In this case, it unconditionally returns "visible".
 */
export const useVisibilityState = () => {
  const [state, setState] = useState<"hidden" | "visible">(() => {
    if (typeof document === "undefined") {
      return "visible";
    }

    return document.visibilityState;
  });

  useEffect(() => {
    const handler = () => {
      setState(() => {
        if (typeof document === "undefined") {
          return "visible";
        }

        return document.visibilityState;
      });
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handler);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handler);
      }
    };
  }, []);

  return state;
};
