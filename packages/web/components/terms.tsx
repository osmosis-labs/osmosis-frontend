import { FunctionComponent, useEffect, useState } from "react";
import { TermsModal } from "../modals/terms";

const TERMS_KEY = "terms_agreement";

export const Terms: FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(TERMS_KEY) === null) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, []);

  return (
    <TermsModal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      onAgree={() => {
        setIsOpen(false);
        localStorage.setItem(TERMS_KEY, "accepted");
      }}
    />
  );
};
