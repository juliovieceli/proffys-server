import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '../config/auth';

import AppError from '../errors/AppError';

interface TokenPayload {
   iat: number;
   exp: number;
   sub: string;
}
export default function ensureAuthenticated(
   request: Request,
   response: Response,
   next: NextFunction,
): void {

   const authHeader = request.headers.authorization;
   
   if (!authHeader) {
      throw new AppError('JWT token is missing.', 401);
   }

   // se deixar o espaco do array em branco, o js entende que é pra despresar aquela variavel
   const [, token] = authHeader.split(' ');

   try {
      const decoded = verify(token, authConfig.jwt.secret);

      const { sub } = decoded as TokenPayload;
      // user foi inserido na tipagem do express atraves do arquivo @types/express.d.ts
      request.user = {
         id: sub,
      };
      return next();
   } catch {
      throw new AppError('Invalid JWT Token', 401);
   }
}
