import {
  deserializeWebRTCMessage,
  MobileSessionEncryptedDataSchema,
  serializeWebRTCMessage,
  STUN_SERVER,
} from "@osmosis-labs/utils";
import MaskedView from "@react-native-masked-view/masked-view";
import { BarcodeScanningResult, CameraView, FocusMode } from "expo-camera";
import { getRandomBytes } from "expo-crypto";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RTCIceCandidate, RTCPeerConnection } from "react-native-webrtc";

import { ConnectionProgressModal } from "~/components/connection-progress-modal";
import { RouteHeader } from "~/components/route-header";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { useOsBiometricAuthEnabled } from "~/hooks/biometrics";
import { useStateRef } from "~/hooks/use-state-ref";
import { useCurrentWalletStore } from "~/stores/current-wallet";
import { decryptAES } from "~/utils/encryption";
import { api } from "~/utils/trpc";
import { WalletFactory } from "~/utils/wallet-factory";

const CAMERA_ASPECT_RATIO = 4 / 3;
const SCAN_ICON_WIDTH_RATIO = 0.7;

// Define a type for the statuses
type WebRTCStatus =
  | "Init"
  | "NoOffer"
  | "AwaitingConnection"
  | "AwaitingVerification"
  | "Verifying"
  | "Verified"
  | "Error";

// Move functions outside before the hook
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateSecureSecret = () => {
  const rawKey = getRandomBytes(32); // 32 bytes = 256 bits
  const base64Key = btoa(String.fromCharCode(...rawKey));
  return base64Key;
};

const useWalletCreationWebRTC = ({
  sessionToken,
}: {
  sessionToken: string;
}) => {
  const [status, setStatus] = useState<WebRTCStatus>("Init");
  const [connected, setConnected] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [_, setSecret, secretRef] = useStateRef<string>("");

  const apiUtils = api.useUtils();
  const postCandidateMutation =
    api.osmosisFe.webRTC.postCandidate.useMutation();
  const postAnswerMutation = api.osmosisFe.webRTC.postAnswer.useMutation();

  // Keep a reference to the peer connection
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Add a ref to store the data channel
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    if (!sessionToken) return;
    let intervalId: NodeJS.Timeout | null = null;
    let isCleanedUp = false;

    const startSession = async () => {
      try {
        if (isCleanedUp) return;

        // 1) Fetch the offer
        const offerRes = await apiUtils.osmosisFe.webRTC.fetchOffer.ensureData({
          sessionToken,
        });
        if (!offerRes.offerSDP) {
          setStatus("NoOffer");
          return;
        }

        setStatus("AwaitingConnection");

        // 2) Create peer connection
        const pc = new RTCPeerConnection({ iceServers: [STUN_SERVER] });
        peerConnectionRef.current = pc;

        // 3) Set remote description (the desktop's offer)
        await pc.setRemoteDescription({
          type: "offer",
          sdp: offerRes.offerSDP,
        });

        // 4) When we get local ICE candidates, post them to the server
        pc.addEventListener("icecandidate", async (event) => {
          if (event.candidate) {
            await postCandidateMutation.mutateAsync({
              sessionToken,
              candidate: JSON.stringify(event.candidate),
            });
          }
        });

        // 5) If the desktop created a data channel, handle it
        pc.addEventListener("datachannel", (ev) => {
          const channel = ev.channel;
          // @ts-ignore
          dataChannelRef.current = channel;

          channel.addEventListener("open", () => {
            console.log("[Mobile] Data channel open, can receive data.");
            setConnected(true);

            // Generate and send verification code and secret
            const code = generateVerificationCode();
            const secret = generateSecureSecret();
            setVerificationCode(code);
            setSecret(secret);
            channel.send(
              serializeWebRTCMessage({
                type: "verification",
                code,
                secret,
              })
            );
            setStatus("AwaitingVerification");
          });

          channel.addEventListener("message", async (msgEvent) => {
            console.log("[Mobile] Received from desktop:", msgEvent.data);
            try {
              const data = await deserializeWebRTCMessage(msgEvent.data);
              if (data.type === "verification_success") {
                // Decrypt the verification success data using the secret
                const decryptedData = decryptAES(
                  data.encryptedData,
                  secretRef.current
                );
                const {
                  address,
                  allowedMessages,
                  key,
                  accountOwnerPublicKey,
                  authenticatorId,
                } = MobileSessionEncryptedDataSchema.parse(
                  JSON.parse(decryptedData)
                );

                // Store the decrypted data in secure storage
                await new WalletFactory().createWallet({
                  keyInfo: {
                    type: "smart-account",
                    address,
                    allowedMessages,
                    privateKey: key,
                    accountOwnerPublicKey,
                    name: "Wallet 1",
                    version: data.version,
                    authenticatorId,
                  },
                });
                useCurrentWalletStore.setState({
                  currentSelectedWalletIndex: 0,
                });

                setStatus("Verified");
              }
              if (data.type === "verification_failed") {
                setStatus("Error");
              }
              if (data.type === "starting_verification") {
                setStatus("Verifying");
              }
            } catch (e) {
              console.error("Failed to parse message:", e);
              setStatus("Error");
            }
          });

          channel.addEventListener("close", () => {
            console.log("[Mobile] Data channel closed");
            setConnected(false);
            setStatus("Error");
          });
        });

        pc.addEventListener("connectionstatechange", () => {
          if (pc.connectionState === "disconnected") {
            console.log("[Mobile] Connection lost.");
            setConnected(false);
            setStatus("Error");
          }
        });

        // 6) Create answer
        if (isCleanedUp) return;
        const answer = await pc.createAnswer();
        if (isCleanedUp) return;
        await pc.setLocalDescription(answer);

        await postAnswerMutation.mutateAsync({
          sessionToken,
          answerSDP: answer.sdp ?? "",
        });

        // 7) Start polling for desktop ICE candidates
        intervalId = setInterval(async () => {
          const candRes =
            await apiUtils.osmosisFe.webRTC.fetchCandidates.ensureData({
              sessionToken,
            });
          const candidates = candRes.candidates || [];
          for (const c of candidates) {
            try {
              const candidate = new RTCIceCandidate(c);
              await pc.addIceCandidate(candidate);
            } catch (err) {
              console.warn("[Mobile] Failed to add ICE candidate:", err);
            }
          }
        }, 3000);
      } catch (err: any) {
        console.error(err);
        if (!isCleanedUp) setStatus("Error");
      }
    };
    startSession();

    return () => {
      isCleanedUp = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  const reset = () => {
    setStatus("Init");
    setConnected(false);
    setVerificationCode("");
  };

  return {
    status,
    connected,
    verificationCode,
    reset,
  };
};

export default function Welcome() {
  const { top, bottom } = useSafeAreaInsets();
  const [autoFocus, setAutoFocus] = useState<FocusMode>("off");
  const [sessionToken, setSessionToken] = useState("");
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const { isCheckingBiometricAvailability, isBiometricEnabled } =
    useOsBiometricAuthEnabled();

  const shouldFreezeCamera = !!sessionToken;

  const { status, verificationCode, reset } = useWalletCreationWebRTC({
    sessionToken,
  });

  const resetCameraAutoFocus = () => {
    const abortController = new AbortController();
    setAutoFocus("off");
    setTimeout(() => {
      if (!abortController.signal.aborted) {
        setAutoFocus("on");
      }
    }, 100);
    return () => abortController.abort();
  };

  const onScanCode = async ({ data }: BarcodeScanningResult) => {
    if (shouldFreezeCamera) {
      return;
    }

    const parsedData = JSON.parse(data);
    setSessionToken(parsedData.sessionToken);
    setShowConnectionModal(true);
  };

  const handleRetry = () => {
    setSessionToken("");
    setShowConnectionModal(false);
    reset();
  };

  const handleClose = () => {
    if (status === "Verified" && isBiometricEnabled) {
      router.replace("/onboarding/set-up-biometrics");
    } else if (status === "Verified" && !isBiometricEnabled) {
      router.replace("/(tabs)");
    } else {
      setShowConnectionModal(false);
      reset();
    }
  };

  const getConnectionState = () => {
    if (!showConnectionModal) return null;

    switch (status) {
      case "Init":
      case "AwaitingConnection":
        return "connecting";
      case "AwaitingVerification":
        return "input-code";
      case "Verified":
        return "success";
      case "Verifying":
        return "verifying";
      case "Error":
      case "NoOffer":
        return "failed";
      default:
        return "connecting";
    }
  };

  const connectionState = getConnectionState();

  const overlayWidth = Dimensions.get("window").height / CAMERA_ASPECT_RATIO;
  const cameraWidth = Dimensions.get("window").width;
  const scannerSize =
    Math.min(overlayWidth, cameraWidth) * SCAN_ICON_WIDTH_RATIO;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      }}
    >
      <View
        style={{
          position: "absolute",
          paddingHorizontal: 24,
          paddingTop: 12,
          marginTop: top,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <RouteHeader>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
            }}
          >
            Scan to Connect
          </Text>
        </RouteHeader>
      </View>
      <MaskedView
        style={{ flex: 1 }}
        key={String(shouldFreezeCamera)}
        maskElement={
          <View
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            {!shouldFreezeCamera && (
              <View
                style={{
                  backgroundColor: "#000",
                  borderRadius: 32,
                  width: scannerSize,
                  height: scannerSize,
                  position: "relative",
                  marginBottom: 48,
                }}
              />
            )}
          </View>
        }
      >
        {!connectionState && (
          <CameraView
            style={{ flex: 1 }}
            onBarcodeScanned={onScanCode}
            autofocus={autoFocus}
          />
        )}
        {!shouldFreezeCamera && (
          <View
            style={{
              position: "absolute",
              width: scannerSize,
              height: scannerSize,
              top: "47.25%",
              left: "50%",
              transform: [
                { translateX: -scannerSize / 2 },
                { translateY: -scannerSize / 2 },
              ],
            }}
          >
            <View style={{ position: "relative", flex: 1 }}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
          </View>
        )}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={resetCameraAutoFocus}
        />
      </MaskedView>
      {connectionState && (
        <ConnectionProgressModal
          state={connectionState}
          verificationCode={verificationCode}
          onRetry={handleRetry}
          onClose={handleClose}
          loading={isCheckingBiometricAvailability}
        />
      )}
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: bottom + 12,
          paddingTop: 32,
          borderTopStartRadius: 32,
          borderTopEndRadius: 32,
          backgroundColor: Colors.osmoverse[1000],
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Text style={styles.scanText}>Scan your QR Code</Text>
        <Text style={styles.instructionText}>
          With your wallet connected, navigate{"\n"}
          to &apos;Profile&apos; &gt; &apos;Link mobile device&apos; on{"\n"}
          Osmosis web app.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanArea: {
    backgroundColor: "transparent",
    borderRadius: 24,
    position: "relative",
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "white",
    borderTopLeftRadius: 32,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "white",
    borderTopRightRadius: 32,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 60,
    height: 60,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "white",
    borderBottomLeftRadius: 32,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "white",
    borderBottomRightRadius: 32,
  },
  scanText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  instructionText: {
    color: Colors.osmoverse[300],
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
