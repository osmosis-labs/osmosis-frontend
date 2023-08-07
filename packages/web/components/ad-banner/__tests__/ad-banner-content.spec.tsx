import { render, screen } from "@testing-library/react";

import { AdBannerContent } from "./ad-banner-content";
import { Ad } from "./ad-banner-types";

const mockAd: Ad = {
  name: "Mock Ad",
  start_date: "2023-08-01",
  end_date: "2023-08-31",
  header: "Mock Header",
  subheader: "Mock Subheader",
  external_url: "https://example.com",
  icon_image_url: "https://example.com/icon.png",
  icon_image_alt: "Mock Icon",
  gradient: "linear-gradient(90deg, #FF0000, #00FF00)",
  font_color: "#333",
  arrow_color: "#555",
  featured: true,
};

test("renders ad banner content correctly", () => {
  render(<AdBannerContent {...mockAd} />);
  const headerElement = screen.getByText(mockAd.header);
  const subheaderElement = screen.getByText(mockAd.subheader);
  const imageElement = screen.getByAltText(mockAd.icon_image_alt);
  const linkElement = screen.getByRole("link");

  expect(headerElement).toBeInTheDocument();
  expect(subheaderElement).toBeInTheDocument();
  expect(imageElement).toBeInTheDocument();
  expect(linkElement).toHaveAttribute("href", mockAd.external_url);
});
