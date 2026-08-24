// PM2 Ecosystem Config for aMenuVerse
// Usage: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "amenuverse",
      script: ".output/server/index.mjs",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
