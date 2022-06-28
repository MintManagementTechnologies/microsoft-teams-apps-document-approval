import { IBaseEntity } from '../baseEntity';

export interface IConversationReferenceEntity extends IBaseEntity {
   upn?: string,
   botId: string,
   conversationType: string,
   tenantId: string,
   chatId: string,
   channelId: string,
   serviceUrl: string,
}