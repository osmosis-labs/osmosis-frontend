import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resetLDMocks } from "jest-launchdarkly-mock";
// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";

import { server } from "~/__tests__/msw";
import {
  mockFeatureFlags,
  renderWithProviders,
  resetQueryClient,
} from "~/__tests__/test-utils";
import { NavbarOsmosisUpdate } from "~/components/navbar-osmosis-update";

const osmosisUpdatesUrl =
  "https://raw.githubusercontent.com/osmosis-labs/fe-content/main/cms/osmosis-update.json";

beforeEach(() => {
  resetLDMocks();
  resetQueryClient();
  localStorage.removeItem("osmosis-updates-closed-url");
  server.use(
    http.get(osmosisUpdatesUrl, () =>
      HttpResponse.json({ iframeUrl: "localhost.localdomain" })
    )
  );
});

it("should display osmosis updates and allow to close", async () => {
  mockFeatureFlags({
    osmosisUpdatesPopUp: true,
  });

  server.use(
    http.get(osmosisUpdatesUrl, () => {
      return HttpResponse.json({ iframeUrl: "localhost.localdomain" });
    })
  );

  const user = userEvent.setup();
  renderWithProviders(<NavbarOsmosisUpdate />);

  const heading = "Osmosis updates!";

  // Osmosis updates should not be visible while loading
  expect(screen.queryByText(heading)).not.toBeInTheDocument();

  // Osmosis updates should be visible after loading
  await screen.findByText(heading);

  // Button to see what's more should be visible
  expect(
    screen.getByRole("button", { name: "See what's new" })
  ).toBeInTheDocument();

  user.click(screen.getByRole("button", { name: "See what's new" }));

  // Should open modal
  await waitFor(() => {
    expect(screen.getAllByLabelText("Close")).toHaveLength(2);
  });
});

it("should allow to close osmosis updates and not display them until a new url is available", async () => {
  mockFeatureFlags({
    osmosisUpdatesPopUp: true,
  });

  server.use(
    http.get(
      osmosisUpdatesUrl,
      () => {
        return HttpResponse.json({ iframeUrl: "localhost.localdomain" });
      },
      { once: true }
    )
  );

  const user = userEvent.setup();
  let { unmount } = renderWithProviders(<NavbarOsmosisUpdate />);

  expect(await screen.findByLabelText("Close")).toBeVisible();
  user.click(screen.getByLabelText("Close"));

  // Osmosis updates should not be visible after closing
  await waitFor(() => {
    expect(screen.queryByText("Osmosis updates!")).not.toBeInTheDocument();
  });

  unmount();

  unmount = renderWithProviders(<NavbarOsmosisUpdate />).unmount;

  // Even after re-mounting osmosis updates should not be visible
  expect(screen.queryByText("Osmosis updates!")).not.toBeInTheDocument();

  unmount();

  // Osmosis updates should be visible after loading since url is different
  server.use(
    http.get(osmosisUpdatesUrl, () => {
      return HttpResponse.json({ iframeUrl: "localhost.localdomain-new" });
    })
  );

  resetQueryClient();
  renderWithProviders(<NavbarOsmosisUpdate />);

  await screen.findByText("Osmosis updates!");
});

it("should not display osmosis updates if feature flag is disabled", async () => {
  mockFeatureFlags({
    osmosisUpdatesPopUp: true,
  });

  const { rerender } = renderWithProviders(<NavbarOsmosisUpdate />);

  const heading = "Osmosis updates!";

  // Osmosis updates should be visible after loading
  await screen.findByText(heading);

  mockFeatureFlags({
    osmosisUpdatesPopUp: false,
  });

  rerender(<NavbarOsmosisUpdate />);

  expect(screen.queryByText("Osmosis updates!")).not.toBeInTheDocument();
});
