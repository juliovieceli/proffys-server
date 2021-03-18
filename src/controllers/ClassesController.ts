import { Request, Response } from 'express';
import convertHourToMinutes from '../utils/convertHourToMinutes';
import db from '../database/connection';
import AppError from '../errors/AppError';

interface ScheduleItem {
   weekDay: string;
   from: string;
   to: string;
}

export default class ClassesController {
   async index(request: Request, response: Response): Promise<Response> {
      const filters = request.query;

      const subject = filters.subject as string;
      const weekDay = filters.weekDay as string;
      const time = filters.time as string;

      if (!weekDay || !subject || !time) {
         return response.status(400).json({
            error: 'Missing filters',
         });
      }

      const timeInMinutes = convertHourToMinutes(time);

      const classes = await db('classes')
         .whereExists(function () {
            this.select('classSchedule.*')
               .from('classSchedule')
               .whereRaw('`classSchedule`.`classId` = `classes`.`id`')
               .whereRaw('`classSchedule`.`weekDay` = ??', [Number(weekDay)])
               .whereRaw('`classSchedule`.`from` <= ??', [
                  Number(timeInMinutes),
               ])
               .whereRaw('`classSchedule`.`to` > ??', [Number(timeInMinutes)]);
         })
         .where('classes.subject', '=', subject)
         .join('users', 'classes.userId', '=', 'users.id')
         .select(['classes.*', 'users.*']);

      return response.status(200).json(classes);
   }

   async create(request: Request, response: Response): Promise<Response> {
      const { userId, subject, cost, schedule } = request.body;

      const verifyUser = await db('users').where('id', userId).first();

      if (!verifyUser) {
         throw new AppError('User not found', 400);
      }

      const trx = await db.transaction();

      try {
         const insertedClassesId = await trx('classes').insert({
            subject,
            cost,
            userId,
         });

         const classId = insertedClassesId[0];

         const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
            return {
               weekDay: scheduleItem.weekDay,
               from: convertHourToMinutes(scheduleItem.from),
               to: convertHourToMinutes(scheduleItem.to),
               classId,
            };
         });

         await trx('classSchedule').insert(classSchedule);

         await trx.commit();

         return response.status(201).send();
      } catch (error) {
         await trx.rollback();
         return response
            .status(400)
            .json({ message: 'Unexpected error while creating new class.' });
      }
   }
}
