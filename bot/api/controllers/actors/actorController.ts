import { IActorEntity } from '../../repositories/actors/actorEntity';
import { IActorRepo } from '../../repositories/actors/actorRepo';
import { IBaseController } from '../baseController';
import { IApiResponse } from '../baseModel';
import { IActorModel } from './actorModel';

export default interface IActorController extends IBaseController<IActorModel> {
}

export class ActorController implements IActorController {
   private static repo: IActorRepo;

   constructor(_repo: IActorRepo) {
      ActorController.repo = _repo;

   }
   async createSingleItem(req, res, next): Promise<IApiResponse> {
      const model = req.body as IActorModel;
      try {
         const newEntity = ActorController.mapModelToEntity(model);
         await ActorController.repo.createOrUpdateActor(newEntity);
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
      const models = req.body as IActorModel[];
      try {
         const newEntities = models.map(x => ActorController.mapModelToEntity(x));
         await ActorController.repo.createManyActors(newEntities);
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
   async readManyItems(req, res, next): Promise<IActorModel[]> {
      const rowKey = req.params.id as string;
      try {
         const entities: IActorEntity[] = await ActorController.repo.getAllRequestActors(rowKey);
         const models: IActorModel[] = entities.map(x => ActorController.mapEntityToModel(x));
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
   async readSingleItem(req, res, next): Promise<IActorModel> {
      const rowKey = req.params.id as string;
      try {
         const entity: IActorEntity = await ActorController.repo.getEntityWithRowKey(rowKey);
         const model: IActorModel = ActorController.mapEntityToModel(entity);
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
      const models = req.body as IActorModel[];
      try {
         const newEntities = models.map(x => ActorController.mapModelToEntity(x));
         await ActorController.repo.updateManyActors(newEntities);
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
            message: 'Error updateManyItems',
            data: false
         });
      }
      finally {
         return next();
      }
   }
   async updateSingleItem(req, res, next): Promise<IApiResponse> {
      const model = req.body as IActorModel;
      try {
         const newEntity = ActorController.mapModelToEntity(model);
         await ActorController.repo.createOrUpdateActor(newEntity);
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
      const partitionKey = req.params.requestId as string;
      const rowKey = req.params.id as string;
      await ActorController.repo.deleteEntity(partitionKey, rowKey);
      res.send({
         status: 'success',
         statusCode: 200,
         message: 'OK',
         data: true
      });
      return next();
   }

   private static mapEntityToModel(entity: IActorEntity): IActorModel {
      let item: IActorModel = {
         ...entity,
         requestId: entity.partitionKey,
         id: entity.rowKey,
         modifiedTimestamp: new Date(entity.timestamp).getTime(),
      }
      delete (item as any).rowKey;
      delete (item as any).partitionKey;
      delete (item as any).timestamp;
      return item;
   }

   private static mapModelToEntity(model: IActorModel): IActorEntity {
      let item: IActorEntity = {
         ...model,
         partitionKey: model.requestId,
         rowKey: model.id,
         createdTimestamp: model.createdTimestamp ? model.createdTimestamp : new Date().getTime(),
      }
      delete (item as any).id;
      delete (item as any).requestId;
      delete (item as any).modifiedTimestamp;
      return item;
   }
}