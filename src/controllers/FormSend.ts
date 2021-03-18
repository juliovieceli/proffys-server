import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import emailConfig from '../config/email';

export default class FormSend {
   async sendEmail(request: Request, response: Response): Promise<Response> {
      const { toEmail, subject, text } = request.body;
      sgMail.setApiKey(emailConfig.api_key);

      const { expiresIn, secret } = emailConfig.jwt;

      const token = sign({}, secret, {
         expiresIn,
         subject: String(toEmail),
      });

      const link = `${process.env.WEB_URL}/redefine?id=${token}`;

      const message = {
         from: emailConfig.senderEmail,
         to: toEmail,
         subject, // Subject line
         text: `${text} ${link}`,
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

      try {
         const resp = await sgMail.send(message);

         return response.json({ resp });
      } catch (error) {
         console.error(error);

         if (error.response) {
            console.error(error.response.body);
         }
      }
      return response.status(201).json({ ok: true });
   }
}
