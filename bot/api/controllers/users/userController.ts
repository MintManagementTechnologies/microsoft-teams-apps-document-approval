import { IUserEntity } from '../../repositories/users/userEntity';
import { IUserRepo } from '../../repositories/users/userRepo';
import { IBaseController } from '../baseController';
import { IApiResponse } from '../baseModel';
import { IUserModel } from './userModel';

export default interface IUserController extends IBaseController<IUserModel> {
}

export class UserController implements IUserController {
   private static repo: IUserRepo;

   constructor(_repo: IUserRepo) {
      UserController.repo = _repo;
      
   }
   async createSingleItem(req, res, next): Promise<IApiResponse> {
      const model = req.body as IUserModel;
      try {
         const newEntity = UserController.mapModelToEntity(model);
         await UserController.repo.createOrUpdateUser(newEntity);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: true
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error createSingleItem',
            data: false
         });
      }
      finally {
         return next();
      }
   }
   async createManyItems(req, res, next): Promise<IApiResponse> {
      const models = req.body as IUserModel[];
      try {
         const newEntities =  models.map(x => UserController.mapModelToEntity(x));
         await UserController.repo.createManyUsers(newEntities);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: true
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error createManyItems',
            data: false
         });
      }
      finally {
         return next();
      }
   }
   async readManyItems(req, res, next): Promise<IUserModel[]> {
      const upn = req.params.upn as string;
      try {
         const entities:IUserEntity[] = await UserController.repo.getAllUsers(); 
         const models:IUserModel[] = entities.map(x => UserController.mapEntityToModel(x));
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: models
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error readManyItems',
            data: []
         });
      }
      finally {
         return next();
      }
   }
   async readSingleItem(req, res, next): Promise<IUserModel> {
      const id = req.params.id as string;
      try {
         const entity:IUserEntity = await UserController.repo.getUser(id); 
         const model:IUserModel = UserController.mapEntityToModel(entity);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: model
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error readSingleItem',
            data: null
         });
      }
      finally {
         return next();
      }
   }
   async updateManyItems(req, res, next): Promise<IApiResponse> {
      res.send({
         status: 'success',
         statusCode: 200,
         message: 'OK',
         data: true
      });
      return next();
   }
   async updateSingleItem(req, res, next): Promise<IApiResponse> {
      const id = req.params.id as string;
      const model = req.body as IUserModel;
      try {
         const newEntity = UserController.mapModelToEntity(model);
         await UserController.repo.createOrUpdateUser(newEntity);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: true
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error updateSingleItem',
            data: false
         });
      }
      finally {
         return next();
      }
   }
   async deleteManyItems(req, res, next): Promise<IApiResponse> {
      res.send({
         status: 'success',
         statusCode: 200,
         message: 'OK',
         data: true
      });
      return next();
   }
   async deleteSingleItem(req, res, next): Promise<IApiResponse> {
      const rowKey = req.params.id as string;
      await UserController.repo.deleteUser(rowKey);
      res.send({
         status: 'success',
         statusCode: 200,
         message: 'OK',
         data: true
      });
      return next();
   }

   private static mapEntityToModel(entity: IUserEntity): IUserModel {
      let item: IUserModel = {
         ...entity,
         personaTypes: entity.personaTypes ? entity.personaTypes.split(';') : [],
         id: entity.rowKey,
         modifiedTimestamp: new Date(entity.timestamp).getTime(),
      }
      delete (item as any).rowKey;
      delete (item as any).partitionKey;
      delete (item as any).timestamp;
      return item;
   }

   private static mapModelToEntity(model: IUserModel): IUserEntity {
      let item: IUserEntity = {
         ...model,
         personaTypes: model.personaTypes ? model.personaTypes.join(';').toLowerCase() : "",
         partitionKey: 'users',
         rowKey: model.id,
         createdTimestamp: model.createdTimestamp ? model.createdTimestamp : new Date().getTime(),
      }
      delete (item as any).id;
      delete (item as any).modifiedTimestamp;
      return item;
   }
}