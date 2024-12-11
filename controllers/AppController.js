import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class AppController {
  static async getStatus(req, res) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();
    return res.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();
      return res.status(200).json({ users: usersCount, files: filesCount });
    } catch (err) {
      console.error('Error fetching stats:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AppController;
