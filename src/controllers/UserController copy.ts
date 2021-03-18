import path from 'path';
import fs from 'fs';
import { hash } from 'bcryptjs';

import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';
import db from '../database/connection';
import { Request, Response } from 'express';

export interface RequestAvatar {
   userId: string;
   avatarFilename: string;
}

interface User {
   userId:string;
   name: string;
   surname:string;
   email: string;
   password: string;
   avatar:string;
   whatsapp:string;
   bio:string;
}



export default class UserController {
   async updateUser({userId,name,surname,password,whatsapp,bio}:User): Promise<User> {
      const verifyUser = await db('users').where('id', userId).first()

      if (!verifyUser) {
         throw new AppError('Unexpected error', 500);
      }

      db('users')
      .where({ id: userId })
      .update({
         name,
         surname,
         password,
         whatsapp,
         bio,
       }, ['id', 'avatar'])

       const user ={
         userId,
         name,
         surname,
         email:verifyUser.email,
         password,
         whatsapp,
         bio,
         avatar:verifyUser.avatar
      }
      return user
   }

   async updateAvatar({userId, avatarFilename}:RequestAvatar): Promise<User> {
      const user: User = await db('users')
      .where('users.id', '=', userId)
      .select('users.*')

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
      .update({ avatar: avatarFilename }, ['id', 'avatar'])
      
      user.avatar = avatarFilename;
      delete user.password

      return user;
   }

   async create({ name, surname, email, password }:User): Promise<User> {
      const checkUserExists = await db('users').where(email,'=',email).first()

      if (checkUserExists) {
         throw new AppError('Email address already used.');
      }
  
      const hashedPassword = await hash(password, 8);

      const user = {
         name,
         surname,
         email,
         password: hashedPassword,
         avatar:'',
         whatsapp:'',
         bio:''
      };

      const trx = await db.transaction()

      const insertedIds = await trx('users').insert(user)
      
      await trx.commit()
      
      const userId = String(insertedIds[0])
      delete user.password

      const insertedUser = {userId, ...user}

      return insertedUser;
   }

   //async index( userId :string): Promise<User> {
   async index(): Promise<User> {
      console.log('1')
      //const user: User = await db('users').where('id', userId).first()
      const user: User = await db('users').select('users.*')

      console.log(2)
      if(!user){
         throw new AppError('User not found', 404);
      }

      delete user.password
      return user;
   }  
}
