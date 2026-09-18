module.exports = {
  apps: [
    {
      name: 'minimarket-pos',
      script: 'build/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ORIGIN: 'http://localhost:3000'
      }
    }
  ]
};
