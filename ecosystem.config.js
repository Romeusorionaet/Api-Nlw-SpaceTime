/* eslint-disable prettier/prettier */
module.exports = {
    apps: [
      {
        name: 'app',
        script: './src/server.ts',
        instances: 'max',
        env: {
          NODE_ENV: 'developement',
        },
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };