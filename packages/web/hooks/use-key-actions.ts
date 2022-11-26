import { KeyboardEvent, useCallback } from "react";

export type EventKeys =
  | "ArrowDown"
  | "ArrowUp"
  | "ArrowLeft"
  | "ArrowRight"
  | "Enter"
  | "Space"
  | "Tab"
  | "Delete"
  | "Escape"
  | " "
  | "Shift"
  | "ShiftTab";

/**
 * Get the normalized event key across all browsers
 * @param event keyboard event
 */
export function normalizeEventKey(
  event: Pick<KeyboardEvent, "key" | "keyCode" | "shiftKey">
) {
  const { key, keyCode } = event;

  const isArrowKey =
    keyCode >= 37 && keyCode <= 40 && key.indexOf("Arrow") !== 0;

  let eventKey = isArrowKey ? `Arrow${key}` : key;

  if (event.shiftKey && key === "Tab") {
    eventKey = "ShiftTab";
  }

  return eventKey as EventKeys;
}

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
