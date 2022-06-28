import { ConversationReference } from 'botbuilder';

export interface IConversationReference {
   bot: {
       id: string,
   },
   conversation: {
       conversationType: string,
       tenantId: string,
       id: string,
   },
   channelId: string,
   serviceUrl: string,
}

export interface IConversationReferenceModel {
   partitionId: string,
   id: string,
   upn?: string,
   conversationReference: IConversationReference, // | Partial<ConversationReference>,
}