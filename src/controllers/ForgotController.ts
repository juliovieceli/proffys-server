import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { sign, verify } from 'jsonwebtoken';
import { hash } from 'bcryptjs';

import db from '../database/connection';
import AppError from '../errors/AppError';
import { User } from './AuthenticateUserController';
import forgotConfig from '../config/email';

const transport = nodemailer.createTransport(forgotConfig.config);

interface TokenPayload {
   iat: number;
   exp: number;
   sub: string;
}

export default class ForgotController {
   async sendEmail(request: Request, response: Response): Promise<void> {
      const { toEmail } = request.body;

      const user: User = await db('users').where('email', '=', toEmail).first();

      if (!user) {
         throw new AppError('Email not found', 404);
      }

      const { expiresIn, secret } = forgotConfig.jwt;

      const token = sign({}, String(secret), {
         expiresIn,
         subject: String(toEmail),
      });

      const link = `${process.env.WEB_URL}/redefine?id=${token}`;

      const message = {
         from: forgotConfig.senderEmail,
         to: toEmail,
         subject: 'Proffy - redefinição de senha', // Subject line
         text: `Recentemente você solicitou alteração de sua senha.${'\n'}
         Clique no link ou copie esse texto e cole em seu navegador favorito para efetuar a redefinição da senha.${'\n\n'}
         ${link}`,
         html: `<p>Recentemente você solicitou alteração de sua senha.</p>
         <p>Clique no link abaixo para efetuar a alteração da senha</p>
         <br/>
         <button>
           <a href= "${link}" target="_blank">Clique aqui para alterar sua senha!</a>
         </button>
         <br/>
         <small>
           Se você não solicitou alteração de sua senha, desconsidere este e-mail.
         </small>`,
      };

      transport.sendMail(
         {
            ...message,
            priority: 'high',
         },
         error => {
            if (error) {
               throw new AppError('Error while sending email', 500);
            }
            return response.status(200).send('Email successfully sent');
         },
      );
   }

   async redefine(request: Request, response: Response): Promise<Response> {
      const { token } = request.query;
      const { password } = request.body;

      try {
         const decoded = verify(String(token), String(forgotConfig.jwt.secret));

         const { sub } = decoded as TokenPayload;

         const hashedPassword = await hash(password, 8);

         await db('users').where({ email: sub }).update({
            password: hashedPassword,
         });

         return response.status(201).json({
            message: 'Successfully changed',
         });
      } catch {
         throw new AppError('Invalid Token. Try again', 403);
      }
   }

   async show(request: Request, response: Response): Promise<Response> {
      return response.status(200).send();
   }
}
