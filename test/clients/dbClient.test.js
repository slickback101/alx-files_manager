const { MongoMemoryServer } = require('mongodb-memory-server');
const MongoClient = require('mongodb').MongoClient;
const dbClient = require('../../utils/dbClient');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  dbClient.init(uri);
});

afterAll(async () => {
  await mongoServer.stop();
  await dbClient.client.close();
});

describe('dbClient', () => {
  it('should connect to the database', () => {
    expect(dbClient.isAlive()).toBe(true);
  });

  it('should insert and retrieve a document', async () => {
    const collection = dbClient.db.collection('test');
    await collection.insertOne({ key: 'value' });
    const doc = await collection.findOne({ key: 'value' });
    expect(doc.key).toBe('value');
  });
});
