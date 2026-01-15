import { ButtonHTMLAttributes, ReactNode } from "react";
import { create } from "zustand";

/**
 * Call to action button type - matches the original MobX NavBarStore
 */
export type CallToAction = {
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * NavBar store state interface
 */
interface NavBarState {
  /** Current page title displayed in the navbar */
  title: ReactNode | undefined;
  /** Call to action buttons displayed in the navbar */
  callToActionButtons: CallToAction[];
  /** Set the navbar title */
  setTitle: (title: ReactNode | undefined) => void;
  /** Set the call to action buttons */
  setCallToActionButtons: (buttons: CallToAction[]) => void;
  /** Reset the store to initial state */
  reset: () => void;
}

const initialState = {
  title: undefined as ReactNode | undefined,
  callToActionButtons: [] as CallToAction[],
};

/**
 * Zustand store for navbar state
 *
 * Migrated from MobX NavBarStore (packages/web/stores/nav-bar.ts)
 *
 * This store manages ephemeral UI state for the navbar, including:
 * - Page title
 * - Call to action buttons
 *
 * Note: This store does not persist to localStorage as navbar state
 * is ephemeral and should reset between page navigations.
 *
 * @example
 * ```tsx
 * import { useNavBarStore } from "~/stores/nav-bar-store";
 *
 * function MyPage() {
 *   const { setTitle, setCallToActionButtons } = useNavBarStore();
 *
 *   useEffect(() => {
 *     setTitle("My Page");
 *     setCallToActionButtons([
 *       { label: "Action", onClick: () => {} }
 *     ]);
 *     return () => {
 *       setTitle(undefined);
 *       setCallToActionButtons([]);
 *     };
 *   }, []);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export const useNavBarStore = create<NavBarState>()((set) => ({
  ...initialState,
  setTitle: (title) => set({ title }),
  setCallToActionButtons: (buttons) => set({ callToActionButtons: buttons }),
  reset: () => set(initialState),
}));
