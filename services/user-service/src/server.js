require('dotenv').config();
const app        = require('./app');
const connectDB  = require('./config/database');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 8002;

const start = async () => {
  await connectDB();
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`🚀 User Service démarré sur le port ${PORT}`);
  });
};

start();