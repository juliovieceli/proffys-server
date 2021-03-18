declare namespace Express {
   // o export nao sobreescreve as tipagens ja existentes no express, apenas anexa novas
   export interface Request {
      user: {
         id: string;
      };
   }
}
