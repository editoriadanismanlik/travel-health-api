export const environments = {
  development: {
    api: {
      url: 'http://localhost:3000',
      wsUrl: 'ws://localhost:3000'
    },
    database: {
      uri: 'mongodb+srv://editoriadanismanlik:Graf2021@cluster0.u0oyr.mongodb.net/travel-health',
      options: {
        maxPoolSize: 10,
        retryWrites: true
      }
    },
    redis: {
      username: 'default',
      password: 'c0WA1DFGk3QCl3SmWPbAeJoJuNA85VHn',
      host: 'redis-11296.c280.us-central1-2.gce.redns.redis-cloud.com',
      port: 11296
    }
  },
  production: {
    api: {
      url: 'https://travel-health-api.onrender.com',
      wsUrl: 'wss://travel-health-api.onrender.com'
    },
    database: {
      uri: process.env.MONGODB_URI,
      options: {
        maxPoolSize: 50,
        retryWrites: true,
        ssl: true
      }
    },
    redis: {
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '11296')
    }
  }
}; 