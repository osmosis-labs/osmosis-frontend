import { renderHook } from "@testing-library/react";

import { useDuplicateGate } from "~/hooks/use-duplicate-pool-check";

const match = (id: string) => ({ id }) as any;

type Props = Parameters<typeof useDuplicateGate>[0];
type Inputs = Pick<Props, "status" | "exactMatches" | "proposed">;

function setup(initial: Inputs) {
  const setDuplicateBlocking = jest.fn();
  const setDuplicateAcknowledged = jest.fn();
  const hook = renderHook(
    (props: Inputs) =>
      useDuplicateGate({
        setDuplicateBlocking,
        setDuplicateAcknowledged,
        ...props,
      }),
    { initialProps: initial }
  );
  return { setDuplicateBlocking, setDuplicateAcknowledged, ...hook };
}

describe("useDuplicateGate", () => {
  it("blocks while the check is pending and clears the acknowledgement without an exact match", () => {
    const { setDuplicateBlocking, setDuplicateAcknowledged } = setup({
      status: "loading",
      exactMatches: [],
      proposed: {} as any,
    });
    expect(setDuplicateBlocking).toHaveBeenLastCalledWith(true);
    expect(setDuplicateAcknowledged).toHaveBeenLastCalledWith(false);
  });

  it("does not block while loading when nothing is proposed", () => {
    const { setDuplicateBlocking } = setup({
      status: "loading",
      exactMatches: [],
      proposed: null,
    });
    expect(setDuplicateBlocking).toHaveBeenLastCalledWith(false);
  });

  it("blocks on an exact match", () => {
    const { setDuplicateBlocking } = setup({
      status: "ready",
      exactMatches: [match("1")],
      proposed: {} as any,
    });
    expect(setDuplicateBlocking).toHaveBeenLastCalledWith(true);
  });

  it("resets the acknowledgement only when the matched set changes, not on reorder", () => {
    const { setDuplicateAcknowledged, rerender } = setup({
      status: "ready",
      exactMatches: [match("1"), match("2")],
      proposed: {} as any,
    });
    setDuplicateAcknowledged.mockClear();

    rerender({
      status: "ready",
      exactMatches: [match("2"), match("1")],
      proposed: {} as any,
    });
    expect(setDuplicateAcknowledged).not.toHaveBeenCalled();

    rerender({
      status: "ready",
      exactMatches: [match("3")],
      proposed: {} as any,
    });
    expect(setDuplicateAcknowledged).toHaveBeenCalledWith(false);
  });

  it("clears both flags on unmount", () => {
    const { setDuplicateBlocking, setDuplicateAcknowledged, unmount } = setup({
      status: "ready",
      exactMatches: [match("1")],
      proposed: {} as any,
    });
    unmount();
    expect(setDuplicateBlocking).toHaveBeenLastCalledWith(false);
    expect(setDuplicateAcknowledged).toHaveBeenLastCalledWith(false);
  });
});
