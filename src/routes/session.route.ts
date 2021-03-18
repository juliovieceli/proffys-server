/* import { Router } from 'express';

import authenticateUserController from '../controllers/AuthenticateUserController';

const sessionRouter = Router();

sessionRouter.post('/', async (request, response) => {
   const { email, password } = request.body;

   const authenticateUser = new authenticateUserController();

   const { user, token } = await authenticateUser.execute({
      email,
      password,
   });

   delete user.password;

   return response.json({ user, token });
});

export default sessionRouter;

 */