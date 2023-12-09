import { exec as execSync } from "child_process";
import util from "util";

const exec = util.promisify(execSync);

/** `containerID` is returned from global-setup script and forwarded by Jest. */
module.exports = async (containerID: string) => {
  try {
    const { stdout } = await exec(
      `bash ./src/tests/stop-osmosisd.sh ${containerID}`
    );
    console.info("Stopped osmosisd container:", stdout);
  } catch (error) {
    console.error("Failed to stop osmosisd container:", error);
    throw error;
  }
};
