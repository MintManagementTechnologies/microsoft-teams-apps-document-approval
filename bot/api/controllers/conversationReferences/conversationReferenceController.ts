import {
    IConversationReferenceEntity
} from '../../repositories/conversationReferences/conversationReferenceEntity';
import {
    IConversationReferenceRepo
} from '../../repositories/conversationReferences/conversationReferenceRepo';
import { IConversationReferenceModel } from './conversationReferenceModel';

export default interface IConversationReferenceController {
   createSingleItem(model: IConversationReferenceModel): Promise<void>,
   createManyItems(models: IConversationReferenceModel[]): Promise<void>,
   readSingleItem(rowKey: string, partitionKey: string): Promise<IConversationReferenceModel>,
   readManyItems(partitionKey: string, rowKeys?: string[]): Promise<IConversationReferenceModel[]>,
}

export class ConversationReferenceController implements IConversationReferenceController {
   private static repo: IConversationReferenceRepo;

   constructor(_repo: IConversationReferenceRepo) {
      ConversationReferenceController.repo = _repo;
   }

   async createSingleItem(model: IConversationReferenceModel): Promise<void> {
      try {
         const newEntity = ConversationReferenceController.mapModelToEntity(model);
         await ConversationReferenceController.repo.createOrUpdateEntity(newEntity);
      }
      catch (error) {
         debugger;
      }
      finally {
         return;
      }
   }
   async createManyItems(models: IConversationReferenceModel[]): Promise<void> {
      try {
         const newEntities =  models.map(x => ConversationReferenceController.mapModelToEntity(x));
         await ConversationReferenceController.repo.createManyConversationReferences(newEntities);
      }
      catch (error) {
         debugger;
      }
      finally {
         return;
      }
   }
   
   async readSingleItem(rowKey: string, partitionKey: string = null): Promise<IConversationReferenceModel> {
      let entity:IConversationReferenceEntity;
      try {
         if(partitionKey){
            entity = await ConversationReferenceController.repo.getEntity(partitionKey, rowKey);
         } else {
            entity = await ConversationReferenceController.repo.getEntityWithRowKey(rowKey);
         }
         const model:IConversationReferenceModel = ConversationReferenceController.mapEntityToModel(entity);
         return model;
      }
      catch (error) {
         debugger;
         return;
      }
      finally {
         //return;
      }
   }
   async readManyItems(partitionKey: string, rowKeys?: string[]): Promise<IConversationReferenceModel[]> {
      try {
         const entities:IConversationReferenceEntity[] = await ConversationReferenceController.repo.getAllWithPartition(partitionKey); 
         const models:IConversationReferenceModel[] = entities.map(x => ConversationReferenceController.mapEntityToModel(x));
         const result = rowKeys ? models.filter(x => rowKeys.includes(x.id)) : models;
         return result;
      }
      catch (error) {
         debugger;
         return [];
      }
      finally {
         //return [];
      }
   }

   private static mapEntityToModel(entity: IConversationReferenceEntity): IConversationReferenceModel {
      let item: IConversationReferenceModel = {
         partitionId: entity.partitionKey,
         id: entity.rowKey,
         upn: entity.upn || '',
         conversationReference: {
            bot: {
                id: entity.partitionKey,
            },
            conversation: {
                conversationType: entity.conversationType,
                tenantId: entity.tenantId,
                id: entity.chatId,
            },
            channelId: entity.channelId,
            serviceUrl: entity.serviceUrl,
         }
      }
      return item;
   }

   private static mapModelToEntity(model: IConversationReferenceModel): IConversationReferenceEntity {
      let item: IConversationReferenceEntity = {
         conversationType: model.conversationReference.conversation.conversationType,
         botId: model.conversationReference.bot.id,
         tenantId: model.conversationReference.conversation.tenantId,
         chatId: model.conversationReference.conversation.id,
         channelId: model.conversationReference.channelId,
         serviceUrl: model.conversationReference.serviceUrl,
         upn: model.upn || '',
         partitionKey: model.partitionId || model.conversationReference.bot.id,
         rowKey: model.id,
         createdTimestamp: new Date().getTime(),
      }
      return item;
   }
}