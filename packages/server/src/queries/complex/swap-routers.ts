import { SIDECAR_BASE_URL } from "../../env";
import { OsmosisSidecarRemoteRouter } from "../sidecar/router";

export function getDefaultRouter() {
  return new OsmosisSidecarRemoteRouter(SIDECAR_BASE_URL);
}
