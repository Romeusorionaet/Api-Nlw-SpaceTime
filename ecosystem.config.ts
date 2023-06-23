module.exports = {
  apps: [
    {
      name: 'api-nlw-spacetime',
      script: './src/server.ts',
      instances: 'max',
      autorestart: true,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
