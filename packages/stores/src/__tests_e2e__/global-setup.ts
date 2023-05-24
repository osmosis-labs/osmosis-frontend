import Axios from "axios";
import { exec as execSync } from "child_process";
import util from "util";

const exec = util.promisify(execSync);
const delay = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

module.exports = async () => {
  try {
    const { stdout } = await exec("bash ./src/__tests_e2e__/start-osmosisd.sh");
    console.log(`\n`, "Started osmosisd container:", stdout);

    // poll for blocks so we know it's initialized and ready to receive test txs
    const instance = Axios.create({
      baseURL: "http://127.0.0.1:1317",
    });

    // Wait for blocks to start being produced
    while (true) {
      await delay(5000);
      console.log("Waiting for block production...");
      try {
        const result = await instance.get<{
          block: any;
        }>("/blocks/latest");
        if (!Boolean(result?.data?.block)) {
          throw new Error("Chain started, but not yet initialized");
        }
      } catch {
        continue;
      }

      return stdout;
    }
  } catch (error) {
    console.error("Failed to start osmosisd container:", error);
    throw error;
  }
};
