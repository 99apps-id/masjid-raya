module.exports = {
  apps: [
    {
      name: 'masjid-raya',
      script: 'npm',
      args: 'start',
      cwd: '/home/admin/masjid-raya',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};
