import { observer } from "mobx-react-lite";

import { Button } from "~/components/buttons";
import { useDisclosure } from "~/hooks";
import { WalletSelectModal } from "~/modals";
import { useStore } from "~/stores";

function useChain(chainName: "osmosis") {
  const { walletManager } = useStore();
  const walletRepo = walletManager.getWalletRepo(chainName);
  walletRepo.isInUse = true;

  return walletRepo;
}

const CosmosKitTest = observer(() => {
  const { wallets, current } = useChain("osmosis");

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <Button onClick={() => onOpen()}>Connect</Button>
      <WalletSelectModal
        isOpen={isOpen}
        onRequestClose={onClose}
        wallets={wallets}
      />
    </div>
  );
});

export default CosmosKitTest;
