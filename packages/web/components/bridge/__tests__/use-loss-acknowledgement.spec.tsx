/* eslint-disable import/no-extraneous-dependencies */
import { Dec } from "@osmosis-labs/unit";
import { act, renderHook } from "@testing-library/react";

import { LossFigures } from "~/components/bridge/loss-acknowledgement";
import { useLossAcknowledgement } from "~/components/bridge/use-loss-acknowledgement";
import { AckReArmTolerance } from "~/config/trade-warnings";

import { baseFigures as figures, warnedSlippage } from "./loss-figures.fixture";

describe("useLossAcknowledgement", () => {
  it("requires acknowledgement while a warning is active and unticked", () => {
    const { result } = renderHook(() => useLossAcknowledgement(figures()));

    expect(result.current.hasAcknowledgedLoss).toBe(false);
    expect(result.current.warningNeedsAcknowledgement).toBe(true);
  });

  it("does not require acknowledgement when no warning is active", () => {
    const { result } = renderHook(() =>
      useLossAcknowledgement(
        figures({ warnSlippage: false, slippage: new Dec(0) })
      )
    );

    expect(result.current.warningNeedsAcknowledgement).toBe(false);
  });

  it("ticking freezes the current figures as the acknowledged basis", () => {
    const current = figures();
    const { result } = renderHook(() => useLossAcknowledgement(current));

    act(() => result.current.setLossAcknowledged(true));

    expect(result.current.hasAcknowledgedLoss).toBe(true);
    expect(result.current.warningNeedsAcknowledgement).toBe(false);
    expect(result.current.acknowledgedBasis).toBe(current);
  });

  it("unticking clears the basis", () => {
    const { result } = renderHook(() => useLossAcknowledgement(figures()));

    act(() => result.current.setLossAcknowledged(true));
    act(() => result.current.setLossAcknowledged(false));

    expect(result.current.hasAcknowledgedLoss).toBe(false);
    expect(result.current.warningNeedsAcknowledgement).toBe(true);
  });

  it("re-arms when the loss worsens beyond tolerance", () => {
    const { result, rerender } = renderHook(
      ({ current }) => useLossAcknowledgement(current),
      { initialProps: { current: figures() } }
    );

    act(() => result.current.setLossAcknowledged(true));
    expect(result.current.hasAcknowledgedLoss).toBe(true);

    rerender({
      current: figures({
        slippage: warnedSlippage.add(AckReArmTolerance).add(new Dec(0.0001)),
      }),
    });

    expect(result.current.hasAcknowledgedLoss).toBe(false);
    expect(result.current.warningNeedsAcknowledgement).toBe(true);
  });

  it("keeps the acknowledgement when the quote drifts within tolerance", () => {
    const { result, rerender } = renderHook(
      ({ current }) => useLossAcknowledgement(current),
      { initialProps: { current: figures() } }
    );

    act(() => result.current.setLossAcknowledged(true));
    rerender({
      current: figures({ slippage: warnedSlippage.add(AckReArmTolerance) }),
    });

    expect(result.current.hasAcknowledgedLoss).toBe(true);
    expect(result.current.warningNeedsAcknowledgement).toBe(false);
  });

  it("re-arms when the provider changes", () => {
    const { result, rerender } = renderHook(
      ({ current }) => useLossAcknowledgement(current),
      { initialProps: { current: figures() } }
    );

    act(() => result.current.setLossAcknowledged(true));
    rerender({ current: figures({ providerId: "Wormhole" }) });

    expect(result.current.hasAcknowledgedLoss).toBe(false);
  });

  it("clears the basis when all warnings clear, so a re-crossing warning needs a fresh tick", () => {
    const { result, rerender } = renderHook(
      ({ current }) => useLossAcknowledgement(current),
      { initialProps: { current: figures() } }
    );

    act(() => result.current.setLossAcknowledged(true));

    // warning clears entirely
    rerender({
      current: figures({ warnSlippage: false, slippage: new Dec(0) }),
    });
    expect(result.current.hasAcknowledgedLoss).toBe(false);
    expect(result.current.warningNeedsAcknowledgement).toBe(false);

    // same warning re-crosses — must be re-acknowledged
    rerender({ current: figures() });
    expect(result.current.warningNeedsAcknowledgement).toBe(true);
  });

  it("clears the basis when the quote disappears", () => {
    const { result, rerender } = renderHook(
      ({ current }) => useLossAcknowledgement(current),
      {
        initialProps: { current: figures() as LossFigures | undefined },
      }
    );

    act(() => result.current.setLossAcknowledged(true));
    rerender({ current: undefined });

    expect(result.current.hasAcknowledgedLoss).toBe(false);
    expect(result.current.warningNeedsAcknowledgement).toBe(false);
  });
});
