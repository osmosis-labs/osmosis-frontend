import { useRouter } from "expo-router";
import { useState } from "react";

import { ConnectWalletScreen } from "../../components/onboarding/connect-wallet-screen";
import { ConnectionStatusScreen } from "../../components/onboarding/connection-status-screen";

export default function Connect() {
  const router = useRouter();
  const [status, setStatus] = useState<"connecting" | "success" | "failure">();

  const handleConnect = async (code: string) => {
    setStatus("connecting");
    try {
      // Implement wallet connection logic here
      // For now, simulate a delay and success
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus("success");
    } catch (error) {
      setStatus("failure");
    }
  };

  const handleRetry = () => {
    setStatus(undefined);
  };

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  if (status) {
    return (
      <ConnectionStatusScreen
        status={status}
        onRetry={handleRetry}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <ConnectWalletScreen
      onConnect={handleConnect}
      onBack={() => router.back()}
    />
  );
}
