import { screen } from "@testing-library/react";

import { SwapAdBannerResponse } from "~/pages";
import { renderWithProviders } from "~/tests/test-utils";

import { AdBannerContent } from "../ad-banner";

test("renders ad banner content correctly", () => {
  const mockAd: SwapAdBannerResponse["banners"][number] = {
    name: "Mock Ad",
    startDate: "2023-08-01",
    endDate: "2023-08-31",
    headerOrTranslationKey: "Mock Header",
    subheaderOrTranslationKey: "Mock Subheader",
    externalUrl: "https://example.com",
    iconImageUrl: "https://example.com/icon.png",
    iconImageAltOrTranslationKey: "Mock Icon",
    gradient: "linear-gradient(90deg, #FF0000, #00FF00)",
    fontColor: "#333",
    arrowColor: "#555",
    featured: true,
  };

  renderWithProviders(<AdBannerContent {...mockAd} localization={{}} />);
  const headerElement = screen.getByText(mockAd.headerOrTranslationKey);
  const subheaderElement = screen.getByText(mockAd.subheaderOrTranslationKey);
  const imageElement = screen.getByAltText(mockAd.iconImageAltOrTranslationKey);
  const linkElement = screen.getByRole("link");

  expect(headerElement).toBeInTheDocument();
  expect(subheaderElement).toBeInTheDocument();
  expect(imageElement).toBeInTheDocument();
  expect(linkElement).toHaveAttribute("href", mockAd.externalUrl);
});

test("renders ad banner content with localization correctly", () => {
  const mockAdResponseWithLocalization: SwapAdBannerResponse = {
    banners: [
      {
        name: "Mock Ad",
        startDate: "2023-08-01",
        endDate: "2023-08-31",
        headerOrTranslationKey: "MockHeader",
        subheaderOrTranslationKey: "MockSubheader",
        externalUrl: "https://example.com",
        iconImageUrl: "https://example.com/icon.png",
        iconImageAltOrTranslationKey: "MockIcon",
        gradient: "linear-gradient(90deg, #FF0000, #00FF00)",
        fontColor: "#333",
        arrowColor: "#555",
        featured: true,
      },
    ],
    localization: {
      en: {
        MockHeader: "Mock Header",
        MockSubheader: "Mock Subheader",
        MockIcon: "Mock Icon",
      },
    },
  };

  const ad = mockAdResponseWithLocalization.banners[0];

  renderWithProviders(
    <AdBannerContent
      {...ad}
      localization={mockAdResponseWithLocalization.localization}
    />
  );
  const headerElement = screen.getByText("Mock Header");
  const subheaderElement = screen.getByText("Mock Subheader");
  const imageElement = screen.getByAltText("Mock Icon");
  const linkElement = screen.getByRole("link");

  expect(headerElement).toBeInTheDocument();
  expect(subheaderElement).toBeInTheDocument();
  expect(imageElement).toBeInTheDocument();
  expect(linkElement).toHaveAttribute("href", ad.externalUrl);
});
