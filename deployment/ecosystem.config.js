module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: 'dist/index.js',
      cwd: '/var/www/mymeds',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      env_file: '/var/www/mymeds/.env.production',
      log_file: '/var/log/mymeds/backend.log',
      error_file: '/var/log/mymeds/backend-error.log',
      out_file: '/var/log/mymeds/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
