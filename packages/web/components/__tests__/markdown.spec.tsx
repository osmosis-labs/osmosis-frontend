import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { Markdown } from "~/components/markdown";

describe("asset description Markdown", () => {
  it("preserves paragraph/link styles, content and titles", () => {
    const { container } = render(
      <Markdown>
        {'An **asset** with [details](https://osmosis.zone "Docs").'}
      </Markdown>
    );
    expect(container.querySelector("p")).toHaveClass(
      "text-body1",
      "font-body1",
      "text-osmoverse-300"
    );
    expect(container.querySelector("strong")).toHaveTextContent("asset");
    const link = screen.getByRole("link", { name: "details" });
    expect(link).toHaveClass("text-white-high");
    expect(link).toHaveAttribute("href", "https://osmosis.zone");
    expect(link).toHaveAttribute("title", "Docs");
    expect(container.querySelector("[node]")).toBeNull();
  });

  it("keeps raw HTML inert and rejects javascript links", () => {
    const { container } = render(
      <Markdown>
        {"<img src=x onerror=alert(1)>\n\n[unsafe](javascript:alert(1))"}
      </Markdown>
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("a")).toHaveAttribute("href", "");
    expect(container).toHaveTextContent("<img src=x onerror=alert(1)>");
  });

  it("renders empty descriptions and synchronous SSR without DOM APIs", () => {
    const { container } = render(<Markdown />);
    expect(container).toBeEmptyDOMElement();
    expect(renderToStaticMarkup(<Markdown>{"A **token**."}</Markdown>)).toBe(
      '<p class="text-body1 font-body1 text-osmoverse-300">A <strong>token</strong>.</p>'
    );
  });
});
