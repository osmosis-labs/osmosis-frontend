import { queryAppStore } from "@osmosis-labs/server";

import {
  createCallerFactory,
  createInnerTRPCContext,
  createTRPCRouter,
} from "..";
import { cmsRouter } from "../cms";

jest.mock("@osmosis-labs/server", () => {
  const actual = jest.requireActual("@osmosis-labs/server");

  return {
    ...actual,
    queryAppStore: jest.fn(),
  };
});

const mockedQueryAppStore = jest.mocked(queryAppStore);

describe("cmsRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the app-store CMS payload from the server query", async () => {
    mockedQueryAppStore.mockResolvedValue({
      applications: [
        {
          title: "Astroport",
          subtitle: "Swap and LP",
          external_URL: "https://astroport.fi",
          thumbnail_image_URL: "https://example.com/astroport.png",
          hero_image_URL: "https://example.com/astroport-hero.png",
          featured: true,
          internal_data: {
            thumbnail_size: 1,
            hero_size: 1,
            project_listing_date: "2026-03-01T00:00:00.000Z",
          },
        },
      ],
    });

    const router = createTRPCRouter({
      cms: cmsRouter,
    });
    const caller = createCallerFactory(router)(
      createInnerTRPCContext({
        assetLists: [],
        chainList: [],
      })
    );

    await expect(caller.cms.getAppStore()).resolves.toEqual({
      applications: [
        {
          title: "Astroport",
          subtitle: "Swap and LP",
          external_URL: "https://astroport.fi",
          thumbnail_image_URL: "https://example.com/astroport.png",
          hero_image_URL: "https://example.com/astroport-hero.png",
          featured: true,
          internal_data: {
            thumbnail_size: 1,
            hero_size: 1,
            project_listing_date: "2026-03-01T00:00:00.000Z",
          },
        },
      ],
    });
    expect(mockedQueryAppStore).toHaveBeenCalledTimes(1);
  });
});
