import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import crypto from 'crypto';

class AuthController {
  // GET /connect
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode Basic auth credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
      const user = await dbClient.database.collection('users').findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate and store token
      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error during authentication:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /disconnect
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

export default AuthController;
