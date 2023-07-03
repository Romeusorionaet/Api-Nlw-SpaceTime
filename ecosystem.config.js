/* eslint-disable prettier/prettier */
module.exports = {
  apps: [
    {
      name: 'app',
      script: './node_modules/.bin/ts-node',
      args: '-P ./tsconfig.json src/server.ts',
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

