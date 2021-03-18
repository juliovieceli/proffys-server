import { compare } from 'bcryptjs';
import authConfig from '../config/auth';
import { sign } from 'jsonwebtoken';
import AppError from '../errors/AppError';
import db from '../database/connection';
import { Request, Response } from 'express';

export interface User {
   id: string;
   name: string;
   surname:string
   avatar: string;
   bio: string;
   whatsapp: string;
   email: string;
   password: string;
}

class AuthenticateUserController {
   public async execute(request:Request,response:Response){

      const {email, password} = request.body
      
      const user: User = await db('users')
      .where('email', '=', email).first()
      
      if (!user) {
         throw new AppError('incorrect email/password combination.', 401);
      }


      const passwordMatched = await compare(password, user.password);
      
      
      if (!passwordMatched) {
         throw new AppError('incorrect email/password combination.', 401);
      }
      
      const { expiresIn,secret } = authConfig.jwt;

      const token = sign({}, secret, {
         expiresIn,
         subject: String(user.id),
      });
      
      return response.json({ user, token });
   }
}

export default AuthenticateUserController;
