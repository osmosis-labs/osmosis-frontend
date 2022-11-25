import { KeyboardEvent, useCallback } from "react";
import { EventKeys, normalizeEventKey } from "../utils/dom";

export const useKeyActions = (
  actions: Partial<Record<EventKeys, (event: KeyboardEvent) => void>>
) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const eventKey = normalizeEventKey(event);

    if (eventKey === "Enter" && event.shiftKey) {
      return;
    }

    const action = actions[eventKey];

    if (action) {
      return action(event);
    }
  }, []);

  return { handleKeyDown };
};
