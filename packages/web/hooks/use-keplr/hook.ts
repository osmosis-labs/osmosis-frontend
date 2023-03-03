import { useContext } from "react";

import { GetKeplrContext } from "./context";

export const useKeplr = () => {
  const context = useContext(GetKeplrContext);
  if (!context) {
    throw new Error("You forgot to use GetKeplrProvider");
  }

  return context;
};
