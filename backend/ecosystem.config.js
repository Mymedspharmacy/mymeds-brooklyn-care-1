module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      cwd: '/var/www/mymeds/backend',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        HOST: '0.0.0.0'
      },
      // Production optimization
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      
      // Logging
      error_file: '/var/log/pm2/mymeds-backend-error.log',
      out_file: '/var/log/pm2/mymeds-backend-out.log',
      log_file: '/var/log/pm2/mymeds-backend-combined.log',
      time: true,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Performance
      node_args: '--max-old-space-size=1024',
      instances: 2, // Start with 2 instances, scale based on CPU cores
      exec_mode: 'cluster'
    }
  ],
  
  deploy: {
    production: {
      user: 'root',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/mymeds-brooklyn-care-1.git',
      path: '/var/www/mymeds',
      'post-deploy': 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/log/pm2'
    }
  }
};
