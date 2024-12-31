import MaskedView from "@react-native-masked-view/masked-view";
import { CameraView, FocusMode } from "expo-camera";
import { useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RouteHeader } from "~/components/route-header";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

const SCAN_ICON_RADIUS_RATIO = 0.05;
const SCAN_ICON_MASK_OFFSET_RATIO = 0.02; // used for mask to match spacing in CameraScan SVG
const CAMERA_ASPECT_RATIO = 4 / 3;
const SCAN_ICON_WIDTH_RATIO = 0.7;

export default function Welcome() {
  const { top, bottom } = useSafeAreaInsets();
  const [autoFocus, setAutoFocus] = useState<FocusMode>("off");

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

  const overlayWidth = Dimensions.get("window").height / CAMERA_ASPECT_RATIO;
  const cameraWidth = Dimensions.get("window").width;
  const cameraHeight = CAMERA_ASPECT_RATIO * cameraWidth;
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
          </View>
        }
      >
        <CameraView
          style={{ flex: 1 }}
          onBarcodeScanned={({ data }) => {
            console.log(data);
          }}
          autofocus={autoFocus}
        />
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
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={resetCameraAutoFocus}
        />
      </MaskedView>
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
