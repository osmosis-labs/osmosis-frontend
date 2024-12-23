import { Stack } from "expo-router";

import { OnboardingFlow } from "../components/onboarding";

export default function OnboardingScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <OnboardingFlow />
    </>
  );
}
