import { IRequestEntity } from '../../repositories/requests/requestEntity';
import { IRequestRepo } from '../../repositories/requests/requestRepo';
import { IBaseController } from '../baseController';
import { IApiResponse } from '../baseModel';
import { IRequestModel } from './requestModel';

export default interface IRequestController extends IBaseController<IRequestModel> {
}

export class RequestController implements IRequestController {
   private static repo: IRequestRepo;

   constructor(_repo: IRequestRepo) {
      RequestController.repo = _repo;
      
   }
   async createSingleItem(req, res, next): Promise<IApiResponse> {
      const model = req.body as IRequestModel;
      try {
         const newEntity = RequestController.mapModelToEntity(model);
         await RequestController.repo.createOrUpdateRequest(newEntity);
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
   async readManyItemsByOutcome(req, res, next): Promise<IRequestModel[]> {
      const outcome = req.params.outcome as string;
      try {
         const entities:IRequestEntity[] = await RequestController.repo.getAllRequestsByOutcome(outcome); 
         const models:IRequestModel[] = entities.map(x => RequestController.mapEntityToModel(x));
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
            message: 'Error readManyItemsByOutcome',
            data: []
         });
      }
      finally {
         return next();
      }
   }
   async readAllItems(req, res, next): Promise<IRequestModel[]> {
      const upn = req.params.upn as string;
      try {
         const entities:IRequestEntity[] = await RequestController.repo.getAll(); 
         const models:IRequestModel[] = entities.map(x => RequestController.mapEntityToModel(x));
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
            message: 'Error readAllItems',
            data: []
         });
      }
      finally {
         return next();
      }
   }
   async readManyItems(req, res, next): Promise<IRequestModel[]> {
      const upn = req.params.upn as string;
      try {
         const entities:IRequestEntity[] = await RequestController.repo.getAllUserRelatedRequests(upn); 
         const models:IRequestModel[] = entities.map(x => RequestController.mapEntityToModel(x));
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
   async readSingleItem(req, res, next): Promise<IRequestModel> {
      const requestId = req.params.id as string;
      try {
         const entity:IRequestEntity = await RequestController.repo.getEntityWithRowKey(requestId); 
         const model:IRequestModel = RequestController.mapEntityToModel(entity);
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
      const model = req.body as IRequestModel;
      try {
         const newEntity = RequestController.mapModelToEntity(model);
         await RequestController.repo.createOrUpdateRequest(newEntity);
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
      res.send({
         status: 'success',
         statusCode: 200,
         message: 'OK',
         data: true
      });
      return next();
   }

   private static mapEntityToModel(entity: IRequestEntity): IRequestModel {
      let item: IRequestModel = {
         ...entity,
         prevApproversUPN: entity.prevApproversUPN ? entity.prevApproversUPN.split(';') : [],
         currentApproversUPN: entity.currentApproversUPN ? entity.currentApproversUPN.split(';') : [],
         createdById: entity.partitionKey,
         id: entity.rowKey,
         modifiedTimestamp: new Date(entity.timestamp).getTime(),
      }
      delete (item as any).rowKey;
      delete (item as any).partitionKey;
      delete (item as any).timestamp;
      return item;
   }

   private static mapModelToEntity(model: IRequestModel): IRequestEntity {
      let item: IRequestEntity = {
         ...model,
         prevApproversUPN: model.prevApproversUPN ? model.prevApproversUPN.join(';').toLowerCase() : "",
         currentApproversUPN: model.currentApproversUPN ? model.currentApproversUPN.join(';').toLowerCase() : "",
         partitionKey: model.createdById,
         rowKey: model.id,
         createdTimestamp: model.createdTimestamp ? model.createdTimestamp : new Date().getTime(),
      }
      delete (item as any).id;
      delete (item as any).createdById;
      delete (item as any).modifiedTimestamp;
      return item;
   }
}