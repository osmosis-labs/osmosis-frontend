export const openTab = (poolType: string) => {
  if (poolType === "transmuter") {
    return "_blank";
  }
  return "";
};
