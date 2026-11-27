import { parseAsBoolean, useQueryState } from "nuqs";

import { Breakpoint, useWindowSize } from "~/hooks";

/**
 * Whether the trade widget is expanded into the trade view. The state lives
 * in the URL (`expanded=true`) so it can be shared and survives reloads.
 * The expanded view is desktop only: at 1152px and narrower it is neither
 * offered nor shown, even if the URL asks for it.
 */
/**
 * The raw `expanded=true` URL flag, without the desktop check. For page
 * layout that applies the desktop rule in CSS, so it causes no extra state
 * update while the page hydrates.
 */
export function useTradeViewExpandedParam() {
  return useQueryState("expanded", parseAsBoolean.withDefault(false));
}

export function useTradeViewExpanded() {
  const [expandedParam, setExpanded] = useTradeViewExpandedParam();
  const { isMobile: isBelowDesktop } = useWindowSize(Breakpoint.xlg);

  return {
    expanded: expandedParam && !isBelowDesktop,
    expandedParam,
    isExpandable: !isBelowDesktop,
    setExpanded,
  };
}
