import { RefObject, useCallback } from "react";
import { useLatest } from "react-use";

import { useConst } from "./use-const";
import { useKeyActions } from "./use-key-actions";
import { useStateRef } from "./use-state-ref";

function getItemId(uniqueId: string, index: number) {
  return `item-selector-item-${uniqueId}-${index}`;
}

function getElement(
  dataAttributeName: string,
  uniqueId: string,
  index: number
) {
  return document.querySelector(
    `[${dataAttributeName}=${getItemId(uniqueId, index)}]`
  );
}

function getAllElements(dataAttributeName: string) {
  return document.querySelectorAll(`[${dataAttributeName}]`);
}

/** Navigate a list of items, with an optional search bar to accompany the selection. */
export function useKeyboardNavigation<TItem>({
  items,
  onSelectItem,
  searchBoxRef,
  dataAttributeName = "key-nav-item",
}: {
  items: TItem[];
  onSelectItem: (item: TItem) => void;
  searchBoxRef: RefObject<HTMLInputElement> | undefined;
  dataAttributeName?: string;
}) {
  /** Prevent global collision */
  const uniqueId = useConst(() => Math.random().toString(36).substring(2, 9));
  const itemsRef = useLatest(items);

  const [selectedIndex, setSelectedIndex, selectedIndexRef] = useStateRef(0);

  // Handle arrow key and enter events from the list item container and
  // scroll items into view and select items accordingly
  const { handleKeyDown: itemContainerKeyDown } = useKeyActions({
    ArrowDown: () => {
      setSelectedIndex((selectedIndex) =>
        selectedIndex === getAllElements(dataAttributeName).length - 1
          ? 0
          : selectedIndex + 1
      );

      getElement(
        dataAttributeName,
        uniqueId,
        selectedIndexRef.current
      )?.scrollIntoView({
        block: "nearest",
      });

      // Focus on search bar if user starts keyboard navigation
      searchBoxRef?.current?.focus();
    },
    ArrowUp: () => {
      setSelectedIndex((selectedIndex) =>
        selectedIndex === 0
          ? getAllElements(dataAttributeName).length - 1
          : selectedIndex - 1
      );

      getElement(
        dataAttributeName,
        uniqueId,
        selectedIndexRef.current
      )?.scrollIntoView({
        block: "nearest",
      });

      // Focus on search bar if user starts keyboard navigation
      searchBoxRef?.current?.focus();
    },
    Enter: () => {
      const item = itemsRef.current[selectedIndexRef.current];
      if (!item) return;
      onSelectItem(item);
    },
  });

  // Intercept keyboard events coming from search bar to avoid
  // navigating when trying to search
  const { handleKeyDown: searchBarKeyDown } = useKeyActions({
    ArrowDown: (event) => {
      event.preventDefault();
    },
    ArrowUp: (event) => {
      event.preventDefault();
    },
  });

  const setItemAttribute = useCallback(
    (index: number) => ({
      [dataAttributeName]: getItemId(uniqueId, index),
    }),
    [dataAttributeName, uniqueId]
  );

  return {
    selectedIndex,
    setSelectedIndex,
    itemContainerKeyDown,
    searchBarKeyDown,
    /**
     * Spread this return value into the selectable JSX element to set the attribute
     * that will be used with the query selector, with the index as the key.
     */
    setItemAttribute,
  };
}
