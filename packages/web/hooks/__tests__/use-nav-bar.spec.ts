/* eslint-disable import/no-extraneous-dependencies */
import { renderHook } from "@testing-library/react";

import { useNavBarStore } from "../../stores/nav-bar-store";
import { useNavBar } from "../use-nav-bar";

describe("useNavBar", () => {
  beforeEach(() => {
    // Reset store to initial state
    useNavBarStore.setState({
      title: undefined,
      callToActionButtons: [],
    });
  });

  it("should set title in the store", () => {
    renderHook(() => useNavBar({ title: "Test Title" }));

    expect(useNavBarStore.getState().title).toBe("Test Title");
  });

  it("should set CTAs in the store", () => {
    const ctas = [
      { label: "Action 1", onClick: jest.fn() },
      { label: "Action 2", disabled: true },
    ];

    renderHook(() => useNavBar({ ctas }));

    expect(useNavBarStore.getState().callToActionButtons).toHaveLength(2);
    expect(useNavBarStore.getState().callToActionButtons[0].label).toBe(
      "Action 1"
    );
    expect(useNavBarStore.getState().callToActionButtons[1].label).toBe(
      "Action 2"
    );
  });

  it("should update when title prop changes", () => {
    const { rerender } = renderHook(({ title }) => useNavBar({ title }), {
      initialProps: { title: "Initial Title" },
    });

    expect(useNavBarStore.getState().title).toBe("Initial Title");

    rerender({ title: "Updated Title" });

    expect(useNavBarStore.getState().title).toBe("Updated Title");
  });

  it("should not set title if undefined", () => {
    renderHook(() => useNavBar({}));

    expect(useNavBarStore.getState().title).toBeUndefined();
  });

  it("should not set CTAs if undefined", () => {
    renderHook(() => useNavBar({ title: "Title" }));

    expect(useNavBarStore.getState().callToActionButtons).toEqual([]);
  });
});
