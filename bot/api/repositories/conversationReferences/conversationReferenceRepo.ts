import { odata, TableClient } from "@azure/data-tables";
import { setLogLevel } from "@azure/logger";

import BaseRepo, { TableClientOptions, IBaseRepo } from "../baseRepo";
import { IConversationReferenceEntity } from "./conversationReferenceEntity";

export interface IConversationReferenceRepo extends IBaseRepo<IConversationReferenceEntity> {
   //  getMyConversationReference: (upn: string) => Promise<IConversationReferenceEntity>;
   //  getAllConversationReferences: () => Promise<IConversationReferenceEntity[]>;
   //  createOrUpdateConversationReference: (request: IConversationReferenceEntity) => Promise<IConversationReferenceEntity>;
   createManyConversationReferences: (entities: IConversationReferenceEntity[]) => Promise<IConversationReferenceEntity[]>;
}

//constructor(serviceAccountUrl: string, tableName: string, credentials: AzureNamedKeyCredential, ensureTableExists: boolean = true)

export default class ConversationReferenceRepo extends BaseRepo<IConversationReferenceEntity> implements IConversationReferenceRepo {
    constructor(options: TableClientOptions, ensureTableExists: boolean = true) {
        super({
            serviceAccountUrl: options.serviceAccountUrl, 
            credentials: options.credentials,
            tableName: 'ConversationReferences',  
            ensureTableExists: ensureTableExists
        });
    }

    async createManyConversationReferences(entities: IConversationReferenceEntity[]) {
        try {
            const results = await super.batchCreate(entities);
            const finalResult = [];
            results.forEach((x, index) => {
                // if(results.subResponses[index].rowKey === x.rowKey)
                // {
                //     console.log('results.subResponses');
                //     console.log(results.subResponses[index]);
                //     console.warn('-----results.subResponses-----');
                // }
                let item = x as IConversationReferenceEntity;
                finalResult.push(item);
            });
            return finalResult;
        }
        catch (error) {
            throw error;
        }
    }
}