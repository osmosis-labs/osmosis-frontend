import { apiClient } from "@osmosis-labs/utils";

import { KEYBASE_BASE_URL } from "../../env";

interface KeybaseResult {
  status: {
    code: number;
    name: string;
  };
  them?: [
    {
      id?: string;
      pictures?: {
        primary?: {
          url?: string;
        };
      };
    }
  ];
}

export function queryValidatorThumbnail({
  identity,
}: {
  identity: string;
}): Promise<string> {
  const url = new URL(
    `_/api/1.0/user/lookup.json?fields=pictures&key_suffix=${identity}`,
    KEYBASE_BASE_URL
  );
  return apiClient<KeybaseResult>(url.toString()).then((res) => {
    if (res.status.code === 0) {
      if (res.them && res.them.length > 0) {
        return res.them[0].pictures?.primary?.url ?? "";
      }
    }

    return "";
  });
}
