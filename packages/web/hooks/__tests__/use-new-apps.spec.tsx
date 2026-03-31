/* eslint-disable import/no-extraneous-dependencies */
import { AppStoreApp } from "@osmosis-labs/server";
import { waitFor } from "@testing-library/react";
import dayjs from "dayjs";

import { server, trpcMsw } from "~/__tests__/msw";
import {
  renderHookWithProviders,
  resetQueryClient,
} from "~/__tests__/test-utils";
import { useNewApps } from "~/hooks/use-new-apps";

function makeApp(title: string, projectListingDate: string): AppStoreApp {
  return {
    title,
    subtitle: `${title} subtitle`,
    external_URL: `https://example.com/${title}`,
    thumbnail_image_URL: `https://example.com/${title}.png`,
    hero_image_URL: `https://example.com/${title}-hero.png`,
    internal_data: {
      thumbnail_size: 1,
      hero_size: 1,
      project_listing_date: projectListingDate,
    },
  };
}

describe("useNewApps", () => {
  beforeEach(() => {
    resetQueryClient();
  });

  it("returns all apps and filters apps listed within the last 31 days", async () => {
    server.use(
      trpcMsw.local.cms.getAppStore.query((_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            applications: [
              makeApp("Fresh App", dayjs().subtract(1, "day").toISOString()),
              makeApp(
                "Boundary App",
                dayjs().subtract(31, "day").toISOString()
              ),
              makeApp("Old App", dayjs().subtract(32, "day").toISOString()),
            ],
          })
        )
      )
    );

    const { result } = renderHookWithProviders(() => useNewApps());

    await waitFor(() => expect(result.current.allApps).toHaveLength(3));
    expect(result.current.newApps.map(({ title }) => title)).toEqual([
      "Fresh App",
      "Boundary App",
    ]);
  });

  it("reuses cached app data across remounts", async () => {
    const requestSpy = jest.fn();
    server.use(
      trpcMsw.local.cms.getAppStore.query((_req, res, ctx) => {
        requestSpy();
        return res(
          ctx.status(200),
          ctx.data({
            applications: [makeApp("Cached App", dayjs().toISOString())],
          })
        );
      })
    );

    const firstRender = renderHookWithProviders(() => useNewApps());
    await waitFor(() =>
      expect(firstRender.result.current.allApps[0]?.title).toBe("Cached App")
    );
    firstRender.unmount();

    const secondRender = renderHookWithProviders(() => useNewApps());
    await waitFor(() =>
      expect(secondRender.result.current.allApps[0]?.title).toBe("Cached App")
    );

    expect(requestSpy).toHaveBeenCalledTimes(1);
  });
});
