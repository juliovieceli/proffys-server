import AppError from '../errors/AppError';
import db from '../database/connection';

interface User {
   userId: string;
   name: string;
   surname: string;
   email: string;
   password: string;
   avatar: string;
   whatsapp: string;
   bio: string;
}
class UpdateUserService {
   public async execute({
      userId,
      name,
      surname,
      password,
      whatsapp,
      bio,
   }: User): Promise<User> {
      const verifyUser: User = await db('users')
         .where('users.id', '=', userId)
         .select('users.*');

      if (!verifyUser) {
         throw new AppError('Unexpected error', 500);
      }

      const user = {
         userId,
         name,
         surname,
         email: verifyUser.email,
         password,
         whatsapp,
         bio,
         avatar: verifyUser.avatar,
      };

      db('users').where({ id: userId }).update(
         {
            name,
            surname,
            password,
            whatsapp,
            bio,
         },
         ['id', 'avatar'],
      );

      delete user.password;
      return user;
   }
}

export default UpdateUserService;
