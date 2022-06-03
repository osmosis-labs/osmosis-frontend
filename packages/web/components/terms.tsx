import { FunctionComponent } from "react";
import { TermsModal } from "../modals/terms";
import { useLocalStorageState } from "../hooks";

const TERMS_KEY = "show_terms_agreement";

export const Terms: FunctionComponent = () => {
  const [isOpen, setIsOpen] = useLocalStorageState(TERMS_KEY, true);

  return (
    <TermsModal
      isOpen={isOpen}
      onAgree={() => {
        setIsOpen(false);
      }}
    />
  );
};
