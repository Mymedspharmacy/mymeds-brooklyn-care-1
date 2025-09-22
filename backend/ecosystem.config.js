module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        DATABASE_URL: 'mysql://mymeds_user:MyMedsSecurePassword2024!@localhost:3306/mymeds_production',
        JWT_SECRET: 'DOSMTw5frDK/1OvogpVCgq0vOaZTzugIqm8tlbc2K8sMxN+GgBjXbuO5AaJ2ou7xWKrn uVcZ5scf1atJV6NiPQ==',
        JWT_REFRESH_SECRET: 'uaGHoo9cMIuo0njL8JVNHwDsvJYRI2k5Ku97Rwjti8es12FmJwQB9y3KG47+ xeMT8w3rQW7MFH15XXO9NUe8yQ==',
        NEW_RELIC_ENABLED: 'false',
        NEW_RELIC_APP_NAME: 'mymeds-backend'
      },
      // Logging
      log_file: '/var/log/mymeds/combined.log',
      out_file: '/var/log/mymeds/out.log',
      error_file: '/var/log/mymeds/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Performance
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Health check
      health_check_grace_period: 3000
    }
  ],
  
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-vps-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/mymeds-brooklyn-care.git',
      path: '/var/www/mymeds-backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
