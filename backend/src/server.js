const env = require("./config/env");
const app = require("./app.js");

async function start() {
  app.listen(env.port, () => {
    console.log(`Tribe Trip API listening on http://localhost:${env.port}`);
    console.log(`Health check: http://localhost:${env.port}/api/health`);
  });
}

start().catch((error) => {
  console.error("Failed to start Tribe Trip API:", error);
  process.exit(1);
});
