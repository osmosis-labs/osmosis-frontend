import { KeyboardEvent, useEffect } from "react";

export type EventKeys =
  | "arrowdown"
  | "arrowup"
  | "arrowleft"
  | "arrowright"
  | "enter"
  | "space"
  | "tab"
  | "delete"
  | "escape"
  | " "
  | "shift"
  | "shifttab";

/**
 * Get the normalized event key across all browsers
 * @param event keyboard event
 */
export function normalizeEventKey(
  event: Pick<KeyboardEvent, "key" | "keyCode" | "shiftKey">
) {
  const { key, keyCode } = event;

  const lowercaseKey = key.toLowerCase();

  const isArrowKey =
    keyCode >= 37 && keyCode <= 40 && lowercaseKey.indexOf("arrow") !== 0;

  let eventKey = isArrowKey ? `arrow${lowercaseKey}` : lowercaseKey;

  if (event.shiftKey && lowercaseKey === "tab") {
    eventKey = "shifttab";
  }

  return eventKey as EventKeys;
}

export const useWindowKeyActions = (
  actions: Partial<Record<EventKeys, (event: globalThis.KeyboardEvent) => void>>
) => {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const eventKey = normalizeEventKey(event);

      if (eventKey === "enter" && event.shiftKey) {
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
