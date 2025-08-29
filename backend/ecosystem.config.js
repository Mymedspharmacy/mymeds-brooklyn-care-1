module.exports = {
  apps: [
    {
      name: "mymeds-backend",
      script: "backend/dist/index.js", // Use compiled JavaScript
      interpreter: "node", // Use Node.js directly
      instances: 2, // Run 2 instances for load balancing
      exec_mode: "cluster", // Use cluster mode for scalability
      env: {
        NODE_ENV: "production",
        PORT: 4000,
        // VPS-specific optimizations
        UV_THREADPOOL_SIZE: 64, // Increase thread pool size
        NODE_OPTIONS: "--max-old-space-size=1024 --optimize-for-size", // Memory optimization
      },
      // VPS-optimized settings
      max_memory_restart: "1G", // Restart if memory exceeds 1GB
      min_uptime: "10s", // Minimum uptime before considering stable
      max_restarts: 10, // Maximum restart attempts
      restart_delay: 4000, // Delay between restarts
      // Performance monitoring
      pmx: true,
      // Logging
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      // Health checks
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: "root",
      host: "your-vps-ip",
      ref: "origin/main",
      repo: "your-git-repo",
      path: "/var/www/mymeds-backend",
      "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.js --env production"
    }
  }
};
