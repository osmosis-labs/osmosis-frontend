import { FaceId } from "~/components/icons/face-id";
import { Fingerprint } from "~/components/icons/fingerprint";
import { useDeviceSupportsBiometricAuth } from "~/hooks/biometrics";

export function BiometricsIcon(): JSX.Element | null {
  const { touchId: isTouchIdSupported, faceId: isFaceIdSupported } =
    useDeviceSupportsBiometricAuth();

  if (isTouchIdSupported) {
    return <Fingerprint color="white" />;
  }

  if (isFaceIdSupported) {
    return <FaceId color="white" />;
  }

  return null;
}

export function useBiometricsText(): string {
  const { touchId: isTouchIdSupported, faceId: isFaceIdSupported } =
    useDeviceSupportsBiometricAuth();

  if (isTouchIdSupported) {
    return "Touch ID";
  }

  if (isFaceIdSupported) {
    return "Face ID";
  }

  return "";
}
