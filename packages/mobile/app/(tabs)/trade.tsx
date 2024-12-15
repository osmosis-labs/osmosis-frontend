import { SafeAreaView } from "react-native-safe-area-context";

import { TradeInterface } from "~/components/trade/trade-interface";

export default function TradeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TradeInterface />
    </SafeAreaView>
  );
}
