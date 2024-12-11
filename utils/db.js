import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const uri = `mongodb://${host}:${port}`;

    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    this.database = null;

    this.client
      .connect()
      .then(() => {
        this.database = this.client.db(database);
        console.log(`Connected to MongoDB at ${uri}`);
      })
      .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
      });
  }

  isAlive() {
    return this.client?.topology?.isConnected() || false;
  }

  async nbUsers() {
    try {
      const usersCollection = this.database.collection('users');
      return await usersCollection.countDocuments();
    } catch (err) {
      console.error('Error counting users:', err);
      return 0;
    }
  }

  async nbFiles() {
    try {
      const filesCollection = this.database.collection('files');
      return await filesCollection.countDocuments();
    } catch (err) {
      console.error('Error counting files:', err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
