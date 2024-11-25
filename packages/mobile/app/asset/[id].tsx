import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "~/components/ui/text";

const AssetRoute = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log(id);

  return (
    <SafeAreaView>
      <Stack.Screen options={{ headerShown: false }} />
      <Text>Asset ID: {id}</Text>
    </SafeAreaView>
  );
};

export default AssetRoute;
