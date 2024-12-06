import { getAsset, getAssetPrice } from "@osmosis-labs/server";
import { ImageResponse } from "next/og";

import { AssetLists } from "~/config/generated/asset-lists";
import { loadGoogleFont } from "~/utils/og-images";

// App router includes @vercel/og.
// No need to install it.

// We're using the edge-runtime
export const config = {
  runtime: "edge",
};

const imageHeight = 240;
const imageAspectRatio = 1.97;
const textOsmoverse300 = "text-[#B0AADC]";
const baseUrl = getBaseUrl();

export default async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenDenom = searchParams.get("denom");
  if (!tokenDenom) {
    return new Response("Denom is required", { status: 400 });
  }
  const tokenDetails = getAsset({
    assetLists: AssetLists,
    anyDenom: tokenDenom,
  });
  let tokenPrice = undefined;
  if (tokenDetails.coinGeckoId)
    tokenPrice = await getAssetPrice({
      chainList: [],
      assetLists: AssetLists,
      asset: {
        coinDenom: tokenDetails.coinMinimalDenom,
        coinGeckoId: tokenDetails.coinGeckoId,
      },
      currency: "usd",
    });
  const token = tokenDetails;
  const title = token.coinName;
  const formattedTokenPrice = tokenPrice ? tokenPrice.toString(2) : "";
  return new ImageResponse(
    (
      <>
        <div tw="flex flex-wrap items-center gap-4">
          <div tw="flex flex-wrap items-center gap-4">
            {token.coinImageUrl ? (
              <img
                src={`${process.env.VERCEL_URL}${token.coinImageUrl}`}
                alt={token.coinName}
                width={40}
                height={40}
              />
            ) : null}
            <div tw="flex flex-wrap gap-2">
              {title ? <h6 tw="font-h6">{title}</h6> : null}
              <h6 tw="font-h6 text-osmoverse-300">{token.coinDenom}</h6>
              {tokenPrice ? (
                <h6 tw="font-h6 text-osmoverse-300">{tokenPrice.toString()}</h6>
              ) : null}
            </div>
          </div>
        </div>
      </>
    ),
    {
      width: imageHeight * imageAspectRatio,
      height: imageHeight,
      fonts: [
        {
          name: "Geist",
          data: await loadGoogleFont(
            "Inter",
            token.coinDenom.toString() + title + formattedTokenPrice
          ),
          style: "normal",
        },
      ],
    }
  );
}
