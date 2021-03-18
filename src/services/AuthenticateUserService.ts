import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import authConfig from '../config/auth';
import AppError from '../errors/AppError';
import db from '../database/connection';

interface Request {
   email: string;
   password: string;
}
export interface User {
   id: string;
   name: string;
   surname: string;
   avatar: string;
   bio: string;
   whatsapp: string;
   email: string;
   password: string;
}
interface Response {
   user: User;
   token: string;
}

class AuthenticateUserService {
   public async execute({ email, password }: Request): Promise<Response> {
      const user: User = await db('classes')
         .where('users.email', '=', email)
         .select('users.*');

      if (!user) {
         throw new AppError('incorrect email/password combination.', 401);
      }

      const passwordMatched = await compare(password, user.password);

      if (!passwordMatched) {
         throw new AppError('incorrect email/password combination.', 401);
      }

      const { expiresIn, secret } = authConfig.jwt;

      const token = sign({}, String(secret), {
         subject: user.id,
         expiresIn,
      });
      return {
         user,
         token,
      };
   }
}

export default AuthenticateUserService;
