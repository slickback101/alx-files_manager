import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
const fileId = req.params.id;
    try {
      const file = await dbClient.database.collection('files').findOne({
        _id: dbClient.ObjectId(fileId),
        userId: dbClient.ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json(file);
    } catch (err) {
      console.error('Error retrieving file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;

    try {
      const files = await dbClient.database.collection('files')
        .aggregate([
          { $match: { parentId: parentId === 0 ? 0 : dbClient.ObjectId(parentId), userId: dbClient.ObjectId(userId) } },
          { $skip: page * pageSize },
          { $limit: pageSize },
        ])
        .toArray();

      return res.status(200).json(files);
    } catch (err) {
      console.error('Error retrieving files:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Validate inputs
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const acceptedTypes = ['folder', 'file', 'image'];
    if (!type || !acceptedTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parent = await dbClient.database.collection('files').findOne({ _id: dbClient.ObjectId(parentId) });
      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Create new file/folder document
    const newFile = {
      userId: dbClient.ObjectId(userId),
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'folder') {
      const result = await dbClient.database.collection('files').insertOne(newFile);
      return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    }

    // Handle file/image creation
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const localPath = path.join(folderPath, uuidv4());

    try {
      await mkdir(folderPath, { recursive: true });
      await writeFile(localPath, Buffer.from(data, 'base64'));
      newFile.localPath = localPath;
    } catch (err) {
      console.error('Error storing file:', err);
      return res.status(500).json({ error: 'Cannot save the file' });
    }

    const result = await dbClient.database.collection('files').insertOne(newFile);

    return res.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  }
}

export default FilesController;
