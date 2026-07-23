const { execSync } = require("child_process");

function readEnvLocal() {
  try {
    const out = execSync('grep -v "^#" /var/www/commerce360/.env.local 2>/dev/null || true').toString();
    return Object.fromEntries(
      out.split("\n")
        .filter((l) => l.includes("="))
        .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
    );
  } catch { return {}; }
}

const envLocal = readEnvLocal();

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
      name: "laravel-queue",
      script: "php",
      args: "/var/www/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      env: {
        APP_ENV: "production",
      },
    },
    {
      name: "c360-worker",
      script: "dist/worker/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        REDIS_URL: "redis://127.0.0.1:6379",
        API_URL: "https://api.orbittify.com",
        API_SERVICE_TOKEN: envLocal.API_SERVICE_TOKEN ?? process.env.API_SERVICE_TOKEN ?? "",
        REPLICATE_API_TOKEN: envLocal.REPLICATE_API_TOKEN ?? process.env.REPLICATE_API_TOKEN ?? "",
        HF_CREDENTIALS: envLocal.HF_CREDENTIALS ?? process.env.HF_CREDENTIALS ?? "",
      },
    },
  ],
};
