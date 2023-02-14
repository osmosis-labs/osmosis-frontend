import { observer } from "mobx-react-lite";

import { Button } from "~/components/buttons";
import { useStore } from "~/stores";

function useChain(chainName: "osmosis") {
  const { walletManager } = useStore();
  const walletRepo = walletManager.getWalletRepo(chainName);
  walletRepo.isInUse = true;

  return walletRepo;
}

const CosmosKitTest = observer(() => {
  const { connect, current } = useChain("osmosis");

  return (
    <div>
      <Button onClick={() => connect()}>Connect</Button>
    </div>
  );
});

export default CosmosKitTest;
