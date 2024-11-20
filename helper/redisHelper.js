const redis = require("redis");
const logger = require("loglevel");
const constant = require("../config/constant");

// connect to redis
const redis_client = redis.createClient({
  socket: {
    host: constant.DEPLOYED_REDIS_HOST,
    port: constant.DEPLOYED_REDIS_PORT,
  },
  password: constant.DEPLOYED_REDIS_PASSWORD,
});

redis_client.on("error", (e) => {
  logger.error("redis:::error");
});
redis_client.connect().then(() => {
  logger.info("redis is connected");
});
module.exports = redis_client;
