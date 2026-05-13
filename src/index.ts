import { createApp } from "./server.js";

const RAW_PORT = process.env.PORT ?? "7000";
const PORT = Number.parseInt(RAW_PORT, 10);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`invalid PORT: ${JSON.stringify(RAW_PORT)} — expected integer 1-65535`);
  process.exit(1);
}

const app = createApp();
const server = app.listen(PORT, () => {
  console.log(`torrentio-stream-curator listening on http://0.0.0.0:${PORT}`);
});

let shuttingDown = false;
function shutdown(signal: NodeJS.Signals): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`received ${signal} — closing server`);
  // Give in-flight probes a few seconds to finish; force-exit otherwise so
  // the orchestrator (Beamup/Docker) doesn't have to SIGKILL.
  const force = setTimeout(() => {
    console.warn("graceful shutdown timed out — exiting");
    process.exit(0);
  }, 10_000);
  force.unref();
  server.close(() => {
    clearTimeout(force);
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
