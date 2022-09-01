import { removeLocalnet } from "./test-env";

module.exports = async () => {
  await removeLocalnet();
};
