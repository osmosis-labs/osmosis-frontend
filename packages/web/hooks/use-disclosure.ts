import { useCallback, useState } from "react";

export interface UseDisclosureProps {
  isOpen?: boolean;
  defaultIsOpen?: boolean;
}

/**
 * `useDisclosure` is a custom hook used to help handle common open, close, or toggle scenarios.
 * It can be used to control feedback component such as `Modal`, `AlertDialog`, `Drawer`, etc.
 */
export function useDisclosure(props: UseDisclosureProps = {}) {
  const [isOpen, setIsOpen] = useState(props.defaultIsOpen || false);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onToggle = useCallback(() => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  }, [isOpen, onOpen, onClose]);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
}

export type UseDisclosureReturn = ReturnType<typeof useDisclosure>;
