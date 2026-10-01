import { queryGithubFile } from "@osmosis-labs/server";

import { queryLatestPositionMigrations } from "../use-position-migrations";

jest.mock("@osmosis-labs/server", () => ({
  queryGithubFile: jest.fn(),
}));

jest.mock("~/hooks", () => ({
  useFeatureFlags: jest.fn(),
}));

describe("queryLatestPositionMigrations", () => {
  it("reads live main without the configured CMS commit pin or browser cache", async () => {
    (queryGithubFile as jest.Mock).mockResolvedValue({ migrations: [] });

    await queryLatestPositionMigrations();

    expect(queryGithubFile).toHaveBeenCalledWith({
      repo: "osmosis-labs/fe-content",
      filePath: "cms/position-migrations.json",
      defaultBranch: "main",
      cache: "no-store",
    });
  });
});
