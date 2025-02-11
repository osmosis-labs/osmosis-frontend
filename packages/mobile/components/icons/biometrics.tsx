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
