import express from 'express';
import multer from 'multer';

import AuthenticateUserController from '../controllers/AuthenticateUserController';
import ClassesController from '../controllers/ClassesController';
import ConnectionsController from '../controllers/ConnectionsController';
import UserController from '../controllers/UserController';
import ForgotController from '../controllers/ForgotController';
import FormSend from '../controllers/FormSend';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import uploadConfig from '../config/upload';

const routes = express.Router();
const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const userController = new UserController();
const authenticateUserController = new AuthenticateUserController();
const forgotController = new ForgotController();
const formSend = new FormSend();

const upload = multer(uploadConfig);

routes.post('/classes', classesController.create);
routes.get('/classes', classesController.index);

routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);

routes.post('/users', userController.create);
routes.get('/users/:userId', userController.index);
routes.patch(
   '/avatar',
   ensureAuthenticated,
   upload.single('avatar'),
   userController.updateAvatar,
);
routes.patch('/users', ensureAuthenticated, userController.updateUser);

routes.post('/sessions', authenticateUserController.execute);

routes.post('/forgot', forgotController.sendEmail);
routes.post('/redefine', forgotController.redefine);

routes.post('/formsend', formSend.sendEmail);
export default routes;
