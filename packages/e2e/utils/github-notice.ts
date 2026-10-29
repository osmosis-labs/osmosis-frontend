import { EOL } from "node:os";

/** Escape message data so a test title cannot inject another workflow command. */
function workflowCommand(command: "notice" | "warning", message: string): void {
  const escaped = message
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A");
  process.stdout.write(`::${command}::${escaped}${EOL}`);
}

export function notice(message: string): void {
  workflowCommand("notice", message);
}

export function warning(message: string): void {
  workflowCommand("warning", message);
}
