import { EOL } from "node:os";

/** Escape message data so a test title cannot inject another workflow command. */
export function notice(message: string): void {
  const escaped = message
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A");
  process.stdout.write(`::notice::${escaped}${EOL}`);
}
