import { odata, TableClient } from '@azure/data-tables';
import { setLogLevel } from '@azure/logger';

import BaseRepo, { IBaseRepo, TableClientOptions } from '../baseRepo';
import { IUserEntity } from './userEntity';

export interface IUserRepo extends IBaseRepo<IUserEntity> {
   getUser: (id: string) => Promise<IUserEntity>;
   getAllUsers: () => Promise<IUserEntity[]>;
   createOrUpdateUser: (user: IUserEntity) => Promise<IUserEntity>;
   createManyUsers: (users: IUserEntity[]) => Promise<IUserEntity[]>;
   updateManyUsers: (users: IUserEntity[]) => Promise<IUserEntity[]>;
   deleteUser: (id: string) => Promise<boolean>;
}

export default class UserRepo extends BaseRepo<IUserEntity> implements IUserRepo {
   constructor(options: TableClientOptions, ensureTableExists: boolean = true) {
      super({
         serviceAccountUrl: options.serviceAccountUrl,
         credentials: options.credentials,
         tableName: 'Users',
         ensureTableExists: ensureTableExists
      });
   }

   async getUser(id: string): Promise<IUserEntity> {
      try {
         const entity = await super.getEntity('users', id);
         return entity;
      }
      catch (error) {
         throw error;
      }
   }

   async getAllUsers(): Promise<IUserEntity[]> {
      const results = await super.getAllWithPartition('users');
      const finalResult = [];
      results.forEach(x => {
         let item = x as IUserEntity;
         finalResult.push(item);
      });
      return results;
   }

   async createOrUpdateUser(entity: IUserEntity) {
      try {
         return await super.createOrUpdateEntity(entity as IUserEntity);
      }
      catch (error) {
         throw error;
      }
   }

   async createManyUsers(entities: IUserEntity[]) {
      try {
         const results = await super.batchUpdate(entities);
         const finalResult = [];
         results.forEach((x, index) => {
            // if(results.subResponses[index].rowKey === x.rowKey)
            // {
            //     console.log('results.subResponses');
            //     console.log(results.subResponses[index]);
            //     console.warn('-----results.subResponses-----');
            // }
            let item = x as IUserEntity;
            finalResult.push(item);
         });
         return finalResult;
      }
      catch (error) {
         throw error;
      }
   }

   async updateManyUsers(entities: IUserEntity[]) {
      try {
         const results = await super.batchUpdate(entities);
         const finalResult = [];
         results.forEach((x, index) => {
            let item = x as IUserEntity;
            finalResult.push(item);
         });
         return finalResult;
      }
      catch (error) {
         throw error;
      }
   }

   async deleteUser(id: string) {
      try {
         await super.deleteEntity('users', id);
         return true;
      }
      catch (error) {
         throw error;
      }
   }
}