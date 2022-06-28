import { ICommentEntity } from '../../repositories/comments/commentEntity';
import { ICommentRepo } from '../../repositories/comments/commentRepo';
import { IBaseController } from '../baseController';
import { IApiResponse } from '../baseModel';
import { ICommentModel } from './commentModel';

export default interface ICommentController extends IBaseController<ICommentModel> {
}

export class CommentController implements ICommentController {
   private static repo: ICommentRepo;

   constructor(_repo: ICommentRepo) {
      CommentController.repo = _repo;
      
   }
   async createSingleItem(req, res, next): Promise<IApiResponse> {
      const model = req.body as ICommentModel;
      try {
         const newEntity = CommentController.mapModelToEntity(model);
         await CommentController.repo.createOrUpdateComment(newEntity);
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
      const models = req.body as ICommentModel[];
      try {
         const newEntities =  models.map(x => CommentController.mapModelToEntity(x));
         await CommentController.repo.createManyComments(newEntities);
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
   async readManyItems(req, res, next): Promise<ICommentModel[]> {
      const partitionKey = req.params.id as string;
      try {
         const entities:ICommentEntity[] = await CommentController.repo.getAllRequestComments(partitionKey); 
         const models:ICommentModel[] = entities.map(x => CommentController.mapEntityToModel(x));
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
   async readSingleItem(req, res, next): Promise<ICommentModel> {
      const rowKey = req.params.id as string;
      try {
         const entity:ICommentEntity = await CommentController.repo.getEntityWithRowKey(rowKey); 
         const model:ICommentModel = CommentController.mapEntityToModel(entity);
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
      const models = req.body as ICommentModel[];
      try {
         const newEntities =  models.map(x => CommentController.mapModelToEntity(x));
         await CommentController.repo.updateManyComments(newEntities);
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
      const model = req.body as ICommentModel;
      try {
         const newEntity = CommentController.mapModelToEntity(model);
         await CommentController.repo.createOrUpdateComment(newEntity);
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
      try {
         await CommentController.repo.deleteEntity(partitionKey, rowKey);
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
            message: 'Error deleteSingleItem',
            data: false
         });
      }
      finally {
         return next();
      }
   }

   private static mapEntityToModel(entity: ICommentEntity): ICommentModel {
      let item: ICommentModel = {
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

   private static mapModelToEntity(model: ICommentModel): ICommentEntity {
      let item: ICommentEntity = {
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