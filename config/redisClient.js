// redisClient.js
const redis = require('redis');

// Create a Redis client with promise support
const client = redis.createClient();

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.connect().catch(console.error);

// Function to delete cache keys, including support for patterns
const delCache = async (keyPattern) => {
    if (keyPattern.includes('*')) {
        // For pattern-based deletion
        const keys = await client.keys(keyPattern);
        for (const key of keys) {
            await client.del(key);
        }
    } else {
        // For exact key match
        await client.del(keyPattern);
    }
};

// Example of setting a key with an expiration time (TTL)
async function setCache(key, value, ttl) {
  try {
    await client.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  } catch (err) {
    console.error('Error setting cache', err);
  }
}

// Example of getting a key from cache
async function getCache(key) {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error getting cache', err);
    return null;
  }
}

module.exports = { setCache, getCache, delCache };
