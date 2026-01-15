/* eslint-disable import/no-extraneous-dependencies */
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";

import { mockStoreState } from "~/__tests__/zustand-utils";

import { CallToAction, useNavBarStore } from "../nav-bar-store";

describe("NavBarStore (Zustand)", () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useNavBarStore.setState({
      title: undefined,
      callToActionButtons: [],
    });
  });

  describe("Initial State", () => {
    it("should have undefined title by default", () => {
      const { result } = renderHook(() => useNavBarStore());
      expect(result.current.title).toBeUndefined();
    });

    it("should have empty callToActionButtons array by default", () => {
      const { result } = renderHook(() => useNavBarStore());
      expect(result.current.callToActionButtons).toEqual([]);
    });
  });

  describe("setTitle", () => {
    it("should update title with string", () => {
      const { result } = renderHook(() => useNavBarStore());

      act(() => {
        result.current.setTitle("Test Title");
      });

      expect(result.current.title).toBe("Test Title");
    });

    it("should update title with ReactNode", () => {
      const { result } = renderHook(() => useNavBarStore());
      const titleNode: ReactNode = "Complex Title";

      act(() => {
        result.current.setTitle(titleNode);
      });

      expect(result.current.title).toBe(titleNode);
    });

    it("should clear title when set to undefined", () => {
      const { result } = renderHook(() => useNavBarStore());

      act(() => {
        result.current.setTitle("Test Title");
      });
      expect(result.current.title).toBe("Test Title");

      act(() => {
        result.current.setTitle(undefined);
      });
      expect(result.current.title).toBeUndefined();
    });
  });

  describe("setCallToActionButtons", () => {
    it("should update callToActionButtons", () => {
      const { result } = renderHook(() => useNavBarStore());
      const buttons: CallToAction[] = [
        { label: "Button 1", onClick: () => {} },
        { label: "Button 2", disabled: true },
      ];

      act(() => {
        result.current.setCallToActionButtons(buttons);
      });

      expect(result.current.callToActionButtons).toHaveLength(2);
      expect(result.current.callToActionButtons[0].label).toBe("Button 1");
      expect(result.current.callToActionButtons[1].label).toBe("Button 2");
      expect(result.current.callToActionButtons[1].disabled).toBe(true);
    });

    it("should clear callToActionButtons when set to empty array", () => {
      const { result } = renderHook(() => useNavBarStore());
      const buttons: CallToAction[] = [{ label: "Button 1" }];

      act(() => {
        result.current.setCallToActionButtons(buttons);
      });
      expect(result.current.callToActionButtons).toHaveLength(1);

      act(() => {
        result.current.setCallToActionButtons([]);
      });
      expect(result.current.callToActionButtons).toEqual([]);
    });
  });

  describe("reset", () => {
    it("should reset store to initial state", () => {
      const { result } = renderHook(() => useNavBarStore());

      // Set some state
      act(() => {
        result.current.setTitle("Test Title");
        result.current.setCallToActionButtons([{ label: "Button" }]);
      });

      expect(result.current.title).toBe("Test Title");
      expect(result.current.callToActionButtons).toHaveLength(1);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.title).toBeUndefined();
      expect(result.current.callToActionButtons).toEqual([]);
    });
  });

  describe("mockStoreState helper", () => {
    it("should allow mocking store state for tests", () => {
      const restore = mockStoreState(useNavBarStore, {
        title: "Mocked Title",
        callToActionButtons: [{ label: "Mocked Button" }],
      });

      expect(useNavBarStore.getState().title).toBe("Mocked Title");
      expect(useNavBarStore.getState().callToActionButtons).toHaveLength(1);

      // Restore original state
      restore();
      expect(useNavBarStore.getState().title).toBeUndefined();
      expect(useNavBarStore.getState().callToActionButtons).toEqual([]);
    });
  });
});
