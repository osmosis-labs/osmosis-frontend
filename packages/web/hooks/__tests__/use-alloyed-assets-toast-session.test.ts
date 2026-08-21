/* eslint-disable import/no-extraneous-dependencies -- @testing-library/react is a
   devDependency of this package; other hook tests here import it the same way. */
import { act, renderHook, waitFor } from "@testing-library/react";

import {
  AlloyedAssetsToastSeenThisSessionKey,
  useAlloyedAssetsToastSession,
} from "~/hooks/use-alloyed-assets-toast-session";

describe("useAlloyedAssetsToastSession", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("hydrates as unseen for a new browser-tab session", async () => {
    const { result } = renderHook(() => useAlloyedAssetsToastSession());

    await waitFor(() => expect(result.current.isSessionHydrated).toBe(true));
    expect(result.current.hasSeenToastThisSession).toBe(false);
  });

  it("remains seen after the hook remounts in the same session", async () => {
    const firstMount = renderHook(() => useAlloyedAssetsToastSession());
    await waitFor(() =>
      expect(firstMount.result.current.isSessionHydrated).toBe(true)
    );

    act(() => firstMount.result.current.markToastSeenThisSession());

    expect(firstMount.result.current.hasSeenToastThisSession).toBe(true);
    expect(
      window.sessionStorage.getItem(AlloyedAssetsToastSeenThisSessionKey)
    ).toBe("true");

    firstMount.unmount();

    const secondMount = renderHook(() => useAlloyedAssetsToastSession());
    await waitFor(() =>
      expect(secondMount.result.current.isSessionHydrated).toBe(true)
    );

    expect(secondMount.result.current.hasSeenToastThisSession).toBe(true);
  });
});
