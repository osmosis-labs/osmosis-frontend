import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

import { TradeInterface } from "~/components/trade/trade-interface";

export default function TradeScreen() {
  const bottomTabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView
      style={{ flex: 1, paddingBottom: bottomTabBarHeight }}
      edges={["top"]}
    >
      <TradeInterface />
    </SafeAreaView>
  );
}
