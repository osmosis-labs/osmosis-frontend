import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { WalletSelectModal } from "~/modals";
import { useStore } from "~/stores";
import { createContext } from "~/utils/react-context";

const [WalletSelectInnerProvider, useWalletSelect] = createContext<{
  onOpenWalletSelect: (chainName: string) => void;
}>({
  strict: true,
  name: "WalletSelectContext",
});

export { useWalletSelect };

export const WalletSelectProvider: FunctionComponent = observer(
  ({ children }) => {
    const { accountStore } = useStore();
    const [chainName, setChainName] = useState<string | null>(null);

    const [isWalletSelectOpen, setIsWalletSelectOpen] = useState(false);

    const onOpenWalletSelect = useCallback((chainName: string) => {
      setIsWalletSelectOpen(true);
      setChainName(chainName);
    }, []);

    const context = useMemo(
      () => ({ onOpenWalletSelect }),
      [onOpenWalletSelect]
    );

    return (
      <WalletSelectInnerProvider value={context}>
        {Boolean(chainName) && (
          <WalletSelectModal
            walletRepo={accountStore.getWalletRepo(chainName!)}
            isOpen={isWalletSelectOpen}
            onRequestClose={() => {
              setIsWalletSelectOpen(false);
              setChainName(null);
            }}
          />
        )}
        {children}
      </WalletSelectInnerProvider>
    );
  }
);
