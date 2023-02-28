import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { WalletSelectModal } from "~/modals";
import { useStore } from "~/stores";
import { createContext } from "~/utils/react-context";

const [WalletSelectInnerProvider, useWalletSelect] = createContext<{
  onOpenWalletSelect: () => void;
}>({
  strict: true,
  name: "WalletSelectContext",
});

export { useWalletSelect };

export const WalletSelectProvider: FunctionComponent = observer(
  ({ children }) => {
    const { accountStore } = useStore();

    const [isWalletSelectOpen, setIsWalletSelectOpen] = useState(false);
    const walletRepo = accountStore.getWalletRepo("osmosis");

    const onOpenWalletSelect = useCallback(() => {
      setIsWalletSelectOpen(true);
    }, []);

    const context = useMemo(
      () => ({ onOpenWalletSelect }),
      [onOpenWalletSelect]
    );

    return (
      <WalletSelectInnerProvider value={context}>
        <WalletSelectModal
          walletRepo={walletRepo}
          isOpen={isWalletSelectOpen}
          onRequestClose={() => setIsWalletSelectOpen(false)}
        />
        {children}
      </WalletSelectInnerProvider>
    );
  }
);
