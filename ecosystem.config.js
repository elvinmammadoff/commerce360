/** @type {import('pm2').ProcessDescription[]} */
module.exports = {
  apps: [
    {
      name: "c360-next",
      script: "node_modules/.bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "c360-worker",
      script: "dist/worker/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        REDIS_URL: "redis://127.0.0.1:6379",
        API_URL: "https://api.orbittify.com",
        API_SERVICE_TOKEN: process.env.API_SERVICE_TOKEN ?? "",
      },
    },
  ],
};
