const Queue = require('bull');
const { setCache, getCache, delCache } = require('./redisClient');

// Create a queue for processing CSV files
const csvQueue = new Queue('csvProcessingQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

module.exports = { csvQueue, setCache, getCache, delCache };
