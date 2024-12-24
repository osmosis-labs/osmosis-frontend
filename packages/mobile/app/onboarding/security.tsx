import { useRouter } from "expo-router";

import { DeviceSecurityScreen } from "../../components/onboarding/device-security-screen";

export default function Security() {
  const router = useRouter();

  const handleUseFaceID = async () => {
    // Implement FaceID setup logic here
    router.push("/onboarding/connect");
  };

  const handleUseDevicePin = () => {
    // Implement PIN setup logic here
    router.push("/onboarding/connect");
  };

  return (
    <DeviceSecurityScreen
      onUseFaceID={handleUseFaceID}
      onUseDevicePin={handleUseDevicePin}
    />
  );
}
