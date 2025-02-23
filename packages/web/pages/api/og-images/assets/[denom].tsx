import { getAsset, getAssetPrice } from "@osmosis-labs/server";
import { ImageResponse } from "next/og";

import { AssetLists } from "~/config/generated/asset-lists";
import { loadGoogleFont } from "~/utils/og-images";
import { getBaseUrl } from "~/utils/url";

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
  if (tokenDetails.coinGeckoId) {
    try {
      tokenPrice = await getAssetPrice({
        chainList: [],
        assetLists: AssetLists,
        asset: {
          coinDenom: tokenDetails.coinMinimalDenom,
          coinGeckoId: tokenDetails.coinGeckoId,
        },
        currency: "usd",
      });
    } catch (error) {
      console.error("Failed to get asset price", error);
    }
  }
  const token = tokenDetails;
  const title = token.coinName;
  const formattedTokenPrice = tokenPrice ? tokenPrice.toString(2) : "";
  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: "Inter",
        }}
        tw="flex h-screen w-screen px-6 py-8 bg-[#090524]"
      >
        <div tw="flex w-2/5 mr-7">
          {token.coinImageUrl ? (
            <img
              src={`${baseUrl}${token.coinImageUrl}`}
              alt={token.coinName}
              tw="h-auto"
            />
          ) : null}
        </div>
        <div tw="flex flex-col justify-center w-3/5">
          <div tw="flex flex-col mb-2">
            <h6
              style={{
                fontSize: "70px",
                lineHeight: "60px",
              }}
              tw={`m-0 mb-1 text-white`}
            >
              {token.coinDenom}
            </h6>
            {title ? (
              <h6
                style={{
                  fontSize: "24px",
                }}
                tw={`${textOsmoverse300} m-0 ml-3`}
              >
                {title}
              </h6>
            ) : null}
          </div>
          {tokenPrice ? (
            <h6
              style={{
                fontSize: "54px",
                lineHeight: "30px",
              }}
              tw={`m-0 ml-2 text-white`}
            >
              ${formattedTokenPrice}
            </h6>
          ) : null}
        </div>
      </div>
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
