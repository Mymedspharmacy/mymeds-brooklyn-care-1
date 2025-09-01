module.exports = {
  apps: [
    {
      name: "mymeds-backend",
      script: "backend/src/index.ts",
      interpreter: "./node_modules/.bin/ts-node",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
} 