import { StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";

import { Text } from "~/components/ui/text";
import { Colors } from "~/constants/theme-colors";
import { api, RouterOutputs } from "~/utils/trpc";

export const AssetDetails = ({
  asset,
}: {
  asset: RouterOutputs["local"]["assets"]["getMarketAsset"];
}) => {
  const { data: details } = api.local.cms.getTokenInfos.useQuery(
    {
      coinDenom: asset.coinDenom,
      langs: ["en"],
    },
    {
      select: (data) => data["en"],
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  if (!details) return null;

  return (
    <View style={styles.container}>
      <Text type="subtitle" style={styles.subtitle}>
        About {details?.name ?? asset.coinName}
      </Text>
      {details?.description ? (
        <View style={styles.descriptionContainer}>
          <View style={styles.markdownContainer}>
            <Markdown
              style={{
                body: {
                  color: Colors["osmoverse"][300],
                  fontSize: 16,
                  lineHeight: 24,
                },
              }}
            >
              {details.description}
            </Markdown>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 40,
  },
  subtitle: {
    fontWeight: "500",
  },
  descriptionContainer: {
    flex: 1,
    alignSelf: "stretch",
    position: "relative",
  },
  markdownContainer: {
    flex: 1,
    alignSelf: "stretch",
  },
});
