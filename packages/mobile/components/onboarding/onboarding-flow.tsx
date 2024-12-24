import { useRouter } from "expo-router";
import { useState } from "react";

import { ConnectWalletScreen } from "./connect-wallet-screen";
import { ConnectionStatusScreen } from "./connection-status-screen";
import { DeviceSecurityScreen } from "./device-security-screen";
import { WelcomeScreen } from "./welcome-screen";

type OnboardingScreen =
  | "welcome"
  | "security"
  | "connect"
  | "connecting"
  | "success"
  | "failure";

export const OnboardingFlow = () => {
  const [currentScreen, setCurrentScreen] =
    useState<OnboardingScreen>("welcome");
  const router = useRouter();

  const handleLinkDesktop = () => {
    setCurrentScreen("security");
  };

  const handleSkip = () => {
    // Navigate to main app
    router.replace("/(tabs)");
  };

  const handleUseFaceID = async () => {
    // Implement FaceID setup logic here
    setCurrentScreen("connect");
  };

  const handleUseDevicePin = () => {
    // Implement PIN setup logic here
    setCurrentScreen("connect");
  };

  const handleConnect = async (code: string) => {
    setCurrentScreen("connecting");
    try {
      // Implement wallet connection logic here
      // For now, simulate a delay and success
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCurrentScreen("success");
    } catch (error) {
      setCurrentScreen("failure");
    }
  };

  const handleRetry = () => {
    setCurrentScreen("connect");
  };

  const handleContinue = () => {
    // Navigate to main app
    router.replace("/(tabs)");
  };

  switch (currentScreen) {
    case "welcome":
      return (
        <WelcomeScreen onLinkDesktop={handleLinkDesktop} onSkip={handleSkip} />
      );
    case "security":
      return (
        <DeviceSecurityScreen
          onUseFaceID={handleUseFaceID}
          onUseDevicePin={handleUseDevicePin}
        />
      );
    case "connect":
      return (
        <ConnectWalletScreen
          onConnect={handleConnect}
          onBack={() => setCurrentScreen("security")}
        />
      );
    case "connecting":
      return (
        <ConnectionStatusScreen
          status="connecting"
          onRetry={handleRetry}
          onContinue={handleContinue}
        />
      );
    case "success":
      return (
        <ConnectionStatusScreen
          status="success"
          onRetry={handleRetry}
          onContinue={handleContinue}
        />
      );
    case "failure":
      return (
        <ConnectionStatusScreen
          status="failure"
          onRetry={handleRetry}
          onContinue={handleContinue}
        />
      );
    default:
      return null;
  }
};
