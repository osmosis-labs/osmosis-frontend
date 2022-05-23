import { useContext } from "react";
import { GetKeplrContext } from "./context";

export const useKeplr = () => {
  const context = useContext(GetKeplrContext);
  if (!context) {
    throw new Error("You forgot yo use GetKeplrProvider");
  }

  return context;
};
