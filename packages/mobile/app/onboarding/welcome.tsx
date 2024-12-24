import { useRouter } from "expo-router";

import { WelcomeScreen } from "../../components/onboarding/welcome-screen";

export default function Welcome() {
  const router = useRouter();

  const handleLinkDesktop = () => {
    router.push("/onboarding/security");
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <WelcomeScreen onLinkDesktop={handleLinkDesktop} onSkip={handleSkip} />
  );
}
