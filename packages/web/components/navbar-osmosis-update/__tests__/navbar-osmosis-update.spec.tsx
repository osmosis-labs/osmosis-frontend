import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

import NavbarOsmosisUpdate from "~/components/navbar-osmosis-update";
import { server } from "~/utils/msw";
import { renderWithProviders } from "~/utils/test-utils";

it("should display osmosis updates and allow to close", async () => {
  server.use(
    rest.get(
      "https://raw.githubusercontent.com/osmosis-labs/fe-content/main/cms/osmosis-update.json",
      (_req, res, ctx) => {
        return res(ctx.json({ iframeUrl: "localhost.localdomain" }));
      }
    )
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
  server.use(
    rest.get(
      "https://raw.githubusercontent.com/osmosis-labs/fe-content/main/cms/osmosis-update.json",
      (_req, res, ctx) => {
        return res.once(ctx.json({ iframeUrl: "localhost.localdomain" }));
      }
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
    rest.get(
      "https://raw.githubusercontent.com/osmosis-labs/fe-content/main/cms/osmosis-update.json",
      (_req, res, ctx) => {
        return res(ctx.json({ iframeUrl: "localhost.localdomain-new" }));
      }
    )
  );

  renderWithProviders(<NavbarOsmosisUpdate />);

  await screen.findByText("Osmosis updates!");
});
