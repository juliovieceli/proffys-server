import path from 'path';
import fs from 'fs';
import uploadConfig from '../config/upload';

import AppError from '../errors/AppError';

import { User } from './AuthenticateUserService';
import db from '../database/connection';

interface Request {
   userId: string;
   avatarFilename: string;
}
class UpdateUserAvatarService {
   public async execute({ userId, avatarFilename }: Request): Promise<User> {
      const user: User = await db('users')
         .where('users.id', '=', userId)
         .select('users.*');

      if (!user) {
         throw new AppError('Only authenticated users can change avatar', 401);
      }
      if (user.avatar) {
         const userAvatarFilePath = path.join(
            uploadConfig.directory,
            user.avatar,
         );
         const userAvatarFileExists = await fs.promises.stat(
            userAvatarFilePath,
         );

         if (userAvatarFileExists) {
            await fs.promises.unlink(userAvatarFilePath);
         }
      }

      db('users')
         .where({ id: userId })
         .update({ avatar: avatarFilename }, ['id', 'avatar']);

      user.avatar = avatarFilename;
      delete user.password;

      return user;
   }
}

export default UpdateUserAvatarService;
