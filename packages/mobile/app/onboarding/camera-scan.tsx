import { STUN_SERVER } from "@osmosis-labs/utils";
import MaskedView from "@react-native-masked-view/masked-view";
import { BarcodeScanningResult, CameraView, FocusMode } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RTCIceCandidate, RTCPeerConnection } from "react-native-webrtc";

import { RouteHeader } from "~/components/route-header";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { api } from "~/utils/trpc";

const CAMERA_ASPECT_RATIO = 4 / 3;
const SCAN_ICON_WIDTH_RATIO = 0.7;

// Define a type for the statuses
type WebRTCStatus =
  | "Init"
  | "FetchingOffer"
  | "NoOffer"
  | "CreatingPC"
  | "ChannelOpen"
  | "CreatingAnswer"
  | "PostingAnswer"
  | "AwaitingConnection"
  | "Error";

const useWebRTC = () => {
  const [status, setStatus] = useState<WebRTCStatus>("Init");
  const [connected, setConnected] = useState(false);

  const apiUtils = api.useUtils();
  const postCandidateMutation =
    api.osmosisFe.webRTC.postCandidate.useMutation();
  const postAnswerMutation = api.osmosisFe.webRTC.postAnswer.useMutation();

  // Keep a reference to the peer connection
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleSession = useCallback(
    async (sessionToken: string) => {
      try {
        setStatus("FetchingOffer");
        // 1) Fetch the offer
        const offerRes = await apiUtils.osmosisFe.webRTC.fetchOffer.ensureData({
          sessionToken,
        });
        if (!offerRes.offerSDP) {
          setStatus("NoOffer");
          return;
        }

        setStatus("CreatingPC");
        // 2) Create peer connection
        const pc = new RTCPeerConnection({ iceServers: [STUN_SERVER] });
        peerConnectionRef.current = pc;

        // 3) When we get local ICE candidates, post them to the server
        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            await postCandidateMutation.mutate({
              sessionToken,
              candidate: JSON.stringify(event.candidate),
            });
          }
        };

        // 4) If the desktop created a data channel, handle it
        pc.ondatachannel = (ev) => {
          const channel = ev.channel;
          channel.onopen = () => {
            console.log("[Mobile] Data channel open, can receive data.");
            setStatus("ChannelOpen");
            setConnected(true);
          };
          channel.onmessage = (msgEvent) => {
            console.log("[Mobile] Received data:", msgEvent.data);
            // If the desktop sends the private key, you'd handle it here
          };
        };

        // 5) Set remote description (the desktop’s offer)
        await pc.setRemoteDescription({
          type: "offer",
          sdp: offerRes.offerSDP,
        });

        setStatus("CreatingAnswer");
        // 6) Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        setStatus("PostingAnswer");
        await postAnswerMutation.mutate({
          sessionToken,
          answerSDP: answer.sdp ?? "",
        });

        // 7) Start polling for desktop ICE candidates
        const intervalId = setInterval(async () => {
          const candRes =
            await apiUtils.osmosisFe.webRTC.fetchCandidates.ensureData({
              sessionToken,
            });
          const candidates = candRes.candidates || [];
          for (const cStr of candidates) {
            try {
              const candidate = new RTCIceCandidate(JSON.parse(cStr));
              await pc.addIceCandidate(candidate);
            } catch (err) {
              console.warn("[Mobile] Failed to add ICE candidate:", err);
            }
          }
        }, 3000);
        intervalIdRef.current = intervalId;
        setStatus("AwaitingConnection");
      } catch (err: any) {
        console.error(err);
        setStatus("Error");
      }
    },
    [
      apiUtils.osmosisFe.webRTC.fetchCandidates,
      apiUtils.osmosisFe.webRTC.fetchOffer,
      postAnswerMutation,
      postCandidateMutation,
    ]
  );

  useEffect(() => {
    return () => {
      peerConnectionRef.current?.close();
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  const handleSendTest = () => {
    // If we created our own data channel, you could send from here
    // Or if the desktop created the channel, we handle ondatachannel
    // This is optional, depending on your flow
    const pc = peerConnectionRef.current;
    if (!pc) return;
    const sendChannel = pc.createDataChannel("mobileChannel");
    sendChannel.onopen = () => {
      sendChannel.send("Hello from Mobile!");
    };
  };

  return {
    status,
    handleSendTest,
    handleSession,
    connected,
  };
};

export default function Welcome() {
  const { top, bottom } = useSafeAreaInsets();
  const [autoFocus, setAutoFocus] = useState<FocusMode>("off");
  const [shouldFreezeCamera, setShouldFreezeCamera] = useState(false);

  const { status, handleSendTest, handleSession, connected } = useWebRTC();

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

    setShouldFreezeCamera(true);
    const parsedData = JSON.parse(data);
    await handleSession(parsedData.sessionToken);
    setShouldFreezeCamera(false);
  };

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
        <CameraView
          style={{ flex: 1 }}
          onBarcodeScanned={onScanCode}
          autofocus={autoFocus}
        />
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
      {shouldFreezeCamera && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            gap: 12,
          }}
        >
          <ActivityIndicator color={Colors.white.full} />
          <Text style={{ fontSize: 20, fontWeight: 600 }}>Loading...</Text>
        </View>
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
        {connected && (
          <Button
            title="Send test message"
            onPress={() => {
              handleSendTest();
            }}
          />
        )}
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
