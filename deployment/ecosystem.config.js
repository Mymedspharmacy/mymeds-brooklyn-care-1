module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'dist/index.js',
    cwd: '/var/www/mymeds/current/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/www/mymeds/logs/error.log',
    out_file: '/var/www/mymeds/logs/out.log',
    log_file: '/var/www/mymeds/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};

