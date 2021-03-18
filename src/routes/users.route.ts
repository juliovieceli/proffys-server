import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';

import UserController from '../controllers/UserController';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

interface User {
   password: string;
   name: string;
   surname: string;
   email: string;
}
interface UpdateUser {
   userId: string;
   name: string;
   surname: string;
   password: string;
   whatsapp: string;
   bio: string;
   email: string;
   avatar: string;
}
const usersRouter = Router();

const upload = multer(uploadConfig);

const userController = new UserController();

usersRouter.post('/', async (request, response) => {
   const { name, surname, email, password }: User = request.body;

   const user = await userController.create({
      name,
      surname,
      email,
      password,
   });

   delete user.password;

   return response.json(user);
});

usersRouter.patch(
   '/avatar',
   ensureAuthenticated,
   upload.single('avatar'),
   async (request, response) => {
      const user = await userController.updateAvatar({
         userId: request.body.id,
         avatarFilename: request.file.filename,
      });

      delete user.password;

      return response.json(user);
   },
);
usersRouter.patch('/users', ensureAuthenticated, async (request, response) => {
   const {
      userId,
      name,
      surname,
      password,
      whatsapp,
      bio,
   }: UpdateUser = request.body;

   const user = await userController.updateUser({
      userId,
      name,
      surname,
      password,
      whatsapp,
      bio,
      email: '',
      avatar: '',
   });

   return response.json(user);
});

usersRouter.get('/users', async (request, response) => {
   const { userId } = request.params;

   // const user = await userController.index();
   const user = await userController.index(userId);

   return response.json(user);
});
export default usersRouter;
