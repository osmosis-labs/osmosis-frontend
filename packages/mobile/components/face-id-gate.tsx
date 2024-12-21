import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { Colors } from "~/constants/theme-colors";
import { useFaceId } from "~/hooks/use-face-id";
import { useSettingsStore } from "~/stores/settings";

import { Text } from "./ui/text";

interface FaceIDGateProps {
  children: React.ReactNode;
}

export const FaceIDGate: React.FC<FaceIDGateProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { authenticateAppAccess } = useFaceId();
  const faceIdForAppAccess = useSettingsStore(
    (state) => state.faceIdForAppAccess
  );

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!faceIdForAppAccess) {
        setIsAuthenticated(true);
        return;
      }

      const success = await authenticateAppAccess();
      setIsAuthenticated(success);
    };

    checkAuthentication();
  }, [authenticateAppAccess, faceIdForAppAccess]);

  if (!isAuthenticated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <Text
          style={{
            color: Colors.wosmongton["500"],
            fontSize: 16,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Please authenticate with Face ID to access the app
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};
