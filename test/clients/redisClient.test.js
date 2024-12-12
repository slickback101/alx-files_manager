const redisMock = require('redis-mock');
const redisClient = require('../../utils/redisClient');

jest.mock('redis', () => redisMock);

describe('redisClient', () => {
  it('should connect to Redis', async () => {
    const isAlive = redisClient.isAlive();
    expect(isAlive).toBe(true);
  });

  it('should set and get a value', async () => {
    await redisClient.set('testKey', 'testValue', 10);
    const value = await redisClient.get('testKey');
    expect(value).toBe('testValue');
  });

  it('should expire a key', async () => {
    await redisClient.set('testKey', 'testValue', 1); // 1-second TTL
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const value = await redisClient.get('testKey');
    expect(value).toBe(null);
  });
});
