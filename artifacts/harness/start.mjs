import { createServer } from "vite";

const port = parseInt(process.env.PORT);
if (!port) {
  console.error("PORT environment variable required");
  process.exit(1);
}

const server = await createServer({
  configFile: new URL("./vite.config.ts", import.meta.url).pathname,
});

await server.listen(port);

console.log(JSON.stringify({ level: 30, pid: process.pid, port, msg: "Server listening" }));

process.on("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});
