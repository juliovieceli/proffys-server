export default {
   jwt: {
      secret: process.env.MAIL_JWT_SECRET || '',
      expiresIn: '300',
   },
   config: {
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
         user: 'cf98a3d25767bf',
         pass: 'ee425013e78b1d',
      },
   },
   senderEmail: 'juliovieceli@hotmail.com',
   api_key: process.env.MAIL_API_KEY || '',
};
