import { createGlobalState } from "react-use";

type Screens = "intro" | "settings" | "settings-no-back-button";

export const useGlobalIs1CTIntroModalScreen = createGlobalState<Screens | null>(
  null
);
