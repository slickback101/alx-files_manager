import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class UsersController {
  // Existing methods (e.g., postNew)

  // GET /users/me
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.database.collection('users').findOne({ _id: dbClient.ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
