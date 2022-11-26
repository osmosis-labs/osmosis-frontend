import { useEffect } from "react";
import { EventKeys, normalizeEventKey } from "../use-key-actions";

export const useWindowKeyActions = (
  actions: Partial<Record<EventKeys, (event: globalThis.KeyboardEvent) => void>>
) => {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const eventKey = normalizeEventKey(event);

      if (eventKey === "Enter" && event.shiftKey) {
        return;
      }

      const action = actions[eventKey];

      if (action) {
        return action(event);
      }
    };

    window.addEventListener("keydown", (event) => handleKeyDown(event));

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });
};
