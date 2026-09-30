// eslint-disable-next-line import/no-extraneous-dependencies
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config for measuring the Worker bundle. ISR/data caches (R2/KV/D1) are not wired up yet.
export default defineCloudflareConfig();
