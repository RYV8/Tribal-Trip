const env = require("./config/env");

async function start() {
  const { default: app } = await import("./app.js");

  app.listen(env.port, () => {
    console.log(`Tribe Trip API listening on http://localhost:${env.port}`);
    console.log(`Health check: http://localhost:${env.port}/api/health`);
  });
}

start().catch((error) => {
  console.error("Failed to start Tribe Trip API:", error);
  process.exit(1);
});
