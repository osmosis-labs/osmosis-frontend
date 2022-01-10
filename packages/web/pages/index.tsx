import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { TradeClipboard } from "../components/trade-clipboard";

const Home: NextPage = observer(function () {
  const { chainStore, accountStore, queriesOsmosisStore } = useStore();

  const chainInfo = chainStore.getChain("osmosis");
  const account = accountStore.getAccount(chainInfo.chainId);

  const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);

  return (
    <main className="max-w-container mx-auto">
      <TradeClipboard />
    </main>
  );
});

export default Home;
