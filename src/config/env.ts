export const config = {
  database: {
    uri: 'mongodb+srv://editoriadanismanlik:Graf2021@cluster0.u0oyr.mongodb.net/travel-health',
  },
  redis: {
    username: 'default',
    password: 'c0WA1DFGk3QCl3SmWPbAeJoJuNA85VHn',
    host: 'redis-11296.c280.us-central1-2.gce.redns.redis-cloud.com',
    port: 11296
  },
  jwt: {
    secret: '3230fa30b35a03c3f5566188beb77d8f9dc69cc12c84084aa8958fd25ea863b1c4790de41edc3a4a8b64c9cdb407fc3bbd679dbd27ed78935cf78214f3ae7bb0',
    expiresIn: '24h'
  },
  server: {
    port: process.env.PORT || 3000,
    cors: {
      origin: [
        'https://travel-health-api.netlify.app',
        'http://localhost:3000'
      ]
    }
  }
}; 