import { observer } from "mobx-react-lite";

import { Button } from "~/components/buttons";
import { useDisclosure } from "~/hooks";
import { WalletSelectModal } from "~/modals";
import { useStore } from "~/stores";

const CosmosKitTest = observer(() => {
  const { accountStore: newAccountStore } = useStore();

  const walletRepo = newAccountStore.getWalletRepo("osmosis");
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      {walletRepo.current?.address ? (
        <div>
          <p>
            Connected! Address: {newAccountStore.getWallet("osmosis")?.address}
          </p>
          <Button className="max-w-xs" onClick={() => walletRepo.disconnect()}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button onClick={() => onOpen()}>Connect</Button>
      )}
      <WalletSelectModal
        isOpen={isOpen}
        onRequestClose={onClose}
        walletRepo={walletRepo}
      />
    </div>
  );
});

export default CosmosKitTest;
