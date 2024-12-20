import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import { StyleSheet } from "react-native";

import { AssetImage } from "~/components/ui/asset-image";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";

interface UnverifiedAssetModalProps {
  onActivate: () => void;
  assetSymbol: string;
  assetImageUrl?: string;
}

export const UnverifiedAssetModal = forwardRef<
  BottomSheetModal,
  UnverifiedAssetModalProps
>(({ onActivate, assetSymbol, assetImageUrl }, ref) => {
  return (
    <BottomSheetModal
      ref={ref}
      enablePanDownToClose
      //   enableDynamicSizing={false}
      //   snapPoints={["50%"]}
      backdropComponent={useCallback(
        (props: BottomSheetBackdropProps) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        ),
        []
      )}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.container}>
        {assetImageUrl && (
          <AssetImage uri={assetImageUrl} style={styles.assetIcon} />
        )}
        <Text type="title" style={styles.title}>
          Activate unverified assets
        </Text>
        <Text type="subtitle" style={styles.description}>
          {assetSymbol} is an unverified token. Do you wish to activate it? Be
          sure to research thoroughly before trading.
        </Text>
        <Text type="caption" style={styles.note}>
          You can always deactivate this setting in the settings modal.
        </Text>
        <Button
          title="Activate"
          variant="primary"
          onPress={onActivate}
          buttonStyle={styles.button}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 5,
    paddingBottom: 42,
    flex: 1,
  },
  bottomSheetBackground: {
    backgroundColor: Colors.osmoverse[900],
  },
  indicator: {
    backgroundColor: Colors.osmoverse[400],
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    color: Colors.osmoverse[200],
    textAlign: "center",
    marginBottom: 12,
  },
  note: {
    color: Colors.osmoverse[300],
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
  },
});
