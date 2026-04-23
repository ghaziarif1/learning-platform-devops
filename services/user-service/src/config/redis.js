const redis = require('redis');

let client = null;

const connectRedis = async () => {
  try {
    client = redis.createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.error('❌ Redis error:', err));
    await client.connect();
    console.log('✅ Redis connecté');
  } catch (error) {
    console.error(`❌ Erreur Redis : ${error.message}`);
  }
};

const getRedisClient = () => client;

module.exports = { connectRedis, getRedisClient };