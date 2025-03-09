import { router, Stack } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MobileSessionIcon } from "~/components/icons/mobile-session";
import { RouteHeader } from "~/components/route-header";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useWallets } from "~/hooks/use-wallets";

export default function EndSessionScreen() {
  const { currentWallet } = useWallets();
  const authenticatorId =
    currentWallet?.type === "smart-account"
      ? currentWallet.authenticatorId
      : "";

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <RouteHeader>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
            }}
          >
            End Session
          </Text>
        </RouteHeader>
      </View>

      <ScrollView style={{ flex: 1, padding: 24 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <MobileSessionIcon width={64} height={64} />
        </View>

        <Text style={{ fontSize: 16, marginBottom: 24, lineHeight: 24 }}>
          To end your current mobile session, you'll need to access the Osmosis
          web app and remove this session from your account.
        </Text>

        <View
          style={{
            backgroundColor: Colors.osmoverse[800],
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>
            Follow these steps:
          </Text>
          <View style={{ gap: 10 }}>
            <Text style={{ lineHeight: 20 }}>
              1. Go to the Osmosis web app on your computer
            </Text>
            <Text style={{ lineHeight: 20 }}>
              2. Click on your Profile in the top right
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ lineHeight: 20 }}>3. Select</Text>
              <MobileSessionIcon width={16} height={16} />
              <Text>and head into Existing sessions.</Text>
            </View>
            <Text style={{ lineHeight: 20 }}>
              4. Find and delete the session with this ID:
            </Text>
            <View
              style={{
                backgroundColor: Colors.osmoverse[700],
                padding: 12,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "monospace",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {authenticatorId}
              </Text>
            </View>
          </View>
        </View>

        <Button
          variant="secondary"
          onPress={() => router.back()}
          buttonStyle={{ marginTop: 16 }}
          title="Back to Settings"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
