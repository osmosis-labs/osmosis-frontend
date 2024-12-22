import { execSync } from "child_process";
import { basename } from "path";
import { chdir } from "process";

function runCommand(command: string) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
    process.exit(1);
  }
}

function main() {
  const currentDir = basename(process.cwd());

  if (currentDir !== "mobile") {
    console.log("You are not in the mobile directory");
    process.exit(-1);
  }

  chdir("..");
  chdir("..");

  console.log("Running npm build...");
  runCommand("yarn build:packages");

  chdir("./packages/mobile");
  console.log("Back to mobile directory");
}

main();
