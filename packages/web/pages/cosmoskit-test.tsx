import { observer } from "mobx-react-lite";

import { Button } from "~/components/buttons";
import { useDisclosure } from "~/hooks";
import { WalletSelectModal } from "~/modals";
import { useStore } from "~/stores";

const CosmosKitTest = observer(() => {
  const { newAccountStore } = useStore();

  const walletRepo = newAccountStore.getWalletRepo("osmosis");
  const { isOpen, onOpen, onClose } = useDisclosure();

  console.log(walletRepo?.current?.walletStatus);

  return (
    <div>
      {walletRepo.current ? (
        <div>
          <p>Connected! Address: {newAccountStore.getAddress("osmosis")}</p>
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
        wallets={walletRepo.wallets}
      />
    </div>
  );
});

export default CosmosKitTest;
