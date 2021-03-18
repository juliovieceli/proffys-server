import { hash } from 'bcryptjs';

import AppError from '../errors/AppError';
import db from '../database/connection';

interface User {
   name: string;
   surname: string;
   email: string;
   password: string;
}

class CreateUserService {
   public async execute({
      name,
      surname,
      email,
      password,
   }: User): Promise<User> {
      const checkUserExists: User = await db('users')
         .where('users.email', '=', email)
         .select('users.*');

      if (checkUserExists) {
         throw new AppError('Email address already used.');
      }

      const hashedPassword = await hash(password, 8);

      const user = {
         name,
         surname,
         email,
         password: hashedPassword,
         avatar: '',
         whatsapp: '',
         bio: '',
      };

      const trx = await db.transaction();

      await trx('users').insert(user);

      await trx.commit();

      delete user.password;

      return user;
   }
}

export default CreateUserService;
