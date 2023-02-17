import { observer } from "mobx-react-lite";

import { Button } from "~/components/buttons";
import { useDisclosure } from "~/hooks";
import { WalletSelectModal } from "~/modals";
import { useStore } from "~/stores";

const CosmosKitTest = observer(() => {
  const { newAccountStore } = useStore();

  const walletRepo = newAccountStore.getWalletRepo("osmosis");
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      {walletRepo.current ? (
        <p>Connected! Address: {walletRepo.current?.address}</p>
      ) : (
        <Button onClick={() => onOpen()}>Connect</Button>
      )}
      <WalletSelectModal
        isOpen={isOpen}
        onRequestClose={onClose}
        wallets={walletRepo.wallets}
      />
    </div>
  );
});

export default CosmosKitTest;
