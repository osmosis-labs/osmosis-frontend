export type ResponsePixels = {
  [x: number]:
    | {
        [y: number]: number | undefined;
      }
    | undefined;
};

export type ResponseStatus = {
  initialBlock: number;
  numDots: number;
  numAccounts: number;
};

export type ResponsePermission = {
  permission: "not_eligible" | "none" | "gray_color" | "multi_color";
  remainingBlocks: number;
};
