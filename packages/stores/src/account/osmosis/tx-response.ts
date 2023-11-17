import { DeliverTxResponse } from "../types";

/** Try to extract the create_position event from the raw log. */
export function findNewClPositionId(
  txResponse: DeliverTxResponse
): string | undefined {
  try {
    const events = JSON.parse(txResponse.rawLog ?? "{}");
    return events[0].events
      .find((event: any) => event.type === "create_position")
      .attributes.find((attr: any) => attr.key === "position_id").value;
  } catch (e: any) {
    console.error(e);
    return undefined;
  }
}
