/** @jest-environment node */
import { renderToString } from "react-dom/server";

import { AutosizeInput } from "../autosize-input";

it("renders deterministic SSR markup without DOM access or layout-effect warnings", () => {
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    const render = () =>
      renderToString(
        <AutosizeInput
          value=""
          placeholder="0.5%"
          minWidth={30}
          inputMode="decimal"
          onChange={() => {}}
        />
      );
    const markup = render();
    expect(markup).toBe(render());
    expect(markup).toContain("width:30px");
    expect(markup).toContain('inputMode="decimal"');
    expect(markup).toContain('aria-hidden="true"');
    expect(error).not.toHaveBeenCalled();
  } finally {
    error.mockRestore();
  }
});
