import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { createWriteStream } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const binary = process.env.OSMOSISD_BINARY ?? "osmosisd";
const expectedVersion = "31.0.1";
const directory = await mkdtemp(join(tmpdir(), "wallet-local-chain-"));
const chainHome = join(directory, "chain");
const chainId = "wallet-ci";
const logPath = join(directory, "node.log");
const logs = createWriteStream(logPath);
let node;
let tests;

async function cli(...args) {
  const { stdout, stderr } = await exec(
    binary,
    [...args, "--home", chainHome],
    {
      timeout: 30_000,
      maxBuffer: 8 * 1024 * 1024,
    }
  );
  return stdout.trim() || stderr.trim();
}
async function unusedPort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}
async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, "exit");
  child.kill("SIGTERM");
  const timeout = setTimeout(() => child.kill("SIGKILL"), 5_000);
  try {
    await exited;
  } finally {
    clearTimeout(timeout);
  }
}
process.on("SIGINT", () => {
  void stop(tests).then(() => stop(node));
});
process.on("SIGTERM", () => {
  void stop(tests).then(() => stop(node));
});

try {
  const version = (
    await exec(binary, ["version"], { timeout: 10_000 })
  ).stdout.trim();
  if (version !== expectedVersion)
    throw new Error(`Expected osmosisd ${expectedVersion}, got ${version}`);
  const [rpcPort, restPort, grpcPort, p2pPort] = await Promise.all(
    Array.from({ length: 4 }, unusedPort)
  );
  await cli("init", "wallet-ci", "--chain-id", chainId);
  const genesisPath = join(chainHome, "config/genesis.json");
  const genesis = JSON.parse(
    await readFile(genesisPath, "utf8"),
    (_key, value) => (value === "stake" ? "uosmo" : value)
  );
  genesis.app_state.concentratedliquidity.params.is_permissionless_pool_creation_enabled = true;
  await writeFile(genesisPath, JSON.stringify(genesis));
  const accounts = {};
  for (const name of ["validator", "amino", "direct"]) {
    const account = JSON.parse(
      await cli(
        "keys",
        "add",
        name,
        "--keyring-backend",
        "test",
        "--output",
        "json"
      )
    );
    accounts[name] = { address: account.address, mnemonic: account.mnemonic };
    await cli(
      "add-genesis-account",
      account.address,
      "1000000000000uosmo,1000000000000uion"
    );
  }
  await cli(
    "gentx",
    "validator",
    "100000000uosmo",
    "--keyring-backend",
    "test",
    "--chain-id",
    chainId
  );
  await cli("collect-gentxs");
  const configPath = join(chainHome, "config/config.toml");
  const config = (await readFile(configPath, "utf8"))
    .replace(/timeout_commit = ".*"/, 'timeout_commit = "500ms"')
    .replace(/^seeds = ".*"/m, 'seeds = ""')
    .replace(/^persistent_peers = ".*"/m, 'persistent_peers = ""')
    .replace(/^pprof_laddr = ".*"/m, 'pprof_laddr = ""');
  await writeFile(configPath, config);
  node = spawn(
    binary,
    [
      "start",
      "--home",
      chainHome,
      "--rpc.laddr",
      `tcp://127.0.0.1:${rpcPort}`,
      "--p2p.laddr",
      `tcp://127.0.0.1:${p2pPort}`,
      "--api.enable",
      "--api.address",
      `tcp://127.0.0.1:${restPort}`,
      "--grpc.address",
      `127.0.0.1:${grpcPort}`,
      "--grpc-web.enable=false",
      "--minimum-gas-prices",
      "0uosmo",
      "--log_level",
      "error",
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );
  node.stdout.pipe(logs);
  node.stderr.pipe(logs);
  const rpc = `http://127.0.0.1:${rpcPort}`;
  const rest = `http://127.0.0.1:${restPort}`;
  const deadline = Date.now() + 60_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (node.exitCode !== null)
      throw new Error(`Node exited during startup (${node.exitCode})`);
    try {
      const response = await fetch(`${rpc}/status`, {
        signal: AbortSignal.timeout(1_000),
      });
      const status = await response.json();
      const account = await fetch(
        `${rest}/cosmos/auth/v1beta1/accounts/${accounts.amino.address}`,
        { signal: AbortSignal.timeout(1_000) }
      );
      if (
        Number(status.result?.sync_info?.latest_block_height) > 1 &&
        account.ok
      ) {
        ready = true;
        break;
      }
    } catch {
      /* The node's RPC and REST servers start independently. */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready)
    throw new Error(
      "Local chain did not produce blocks and serve REST within 60s"
    );
  const fixturePath = join(directory, "fixture.json");
  await writeFile(
    fixturePath,
    JSON.stringify({ chainId, rpc, rest, accounts }),
    { mode: 0o600 }
  );
  console.info(`Local wallet chain ready. Node logs: ${logPath}`);
  tests = spawn(
    "yarn",
    [
      "workspace",
      "@osmosis-labs/web",
      "exec",
      "jest",
      "--config",
      "jest.wallet-local-chain.config.js",
      "--runInBand",
      "--detectOpenHandles",
      "--silent",
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        WALLET_LOCAL_CHAIN_FIXTURE: fixturePath,
        NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE: chainId,
      },
    }
  );
  const timeout = setTimeout(() => {
    void stop(tests);
  }, 300_000);
  try {
    const [code] = await once(tests, "exit");
    if (code !== 0)
      throw new Error(`Wallet local-chain tests failed (${code})`);
  } finally {
    clearTimeout(timeout);
  }
} catch (error) {
  console.error(error.message);
  console.error(`Local-chain artifacts: ${directory}`);
  const output = await readFile(logPath, "utf8").catch(() => "");
  console.error(output.split("\n").slice(-120).join("\n"));
  process.exitCode = 1;
} finally {
  await stop(tests);
  await stop(node);
  logs.end();
}
