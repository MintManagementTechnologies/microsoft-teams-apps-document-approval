import { odata, TableClient } from "@azure/data-tables";
import { setLogLevel } from "@azure/logger";

import BaseRepo, { TableClientOptions, IBaseRepo } from "../baseRepo";
import { CommentEntity, ICommentEntity } from "./commentEntity";

export interface ICommentRepo extends IBaseRepo<ICommentEntity> {
    getAllRequestComments: (requestId: string) => Promise<ICommentEntity[]>;
    getAllMyComments: (commentUPN: string) => Promise<ICommentEntity[]>;
    getAllComments: () => Promise<ICommentEntity[]>;
    createOrUpdateComment: (request: ICommentEntity) => Promise<ICommentEntity>;
    createManyComments: (requests: ICommentEntity[]) => Promise<ICommentEntity[]>;
    updateManyComments: (requests: ICommentEntity[]) => Promise<ICommentEntity[]>;
    deleteManyComments: (requestId: string) => Promise<boolean>;
}

//constructor(serviceAccountUrl: string, tableName: string, credentials: AzureNamedKeyCredential, ensureTableExists: boolean = true)

export default class CommentRepo extends BaseRepo<CommentEntity> implements ICommentRepo {
    constructor(options: TableClientOptions, ensureTableExists: boolean = true) {
        super({
            serviceAccountUrl: options.serviceAccountUrl, 
            credentials: options.credentials,
            tableName: 'Comments',  
            ensureTableExists: ensureTableExists
        });
    }
    
    async getAllRequestComments(requestId: string): Promise<CommentEntity[]> {
        const results = await super.getAllWithPartition(requestId);
        const finalResult = [];
        results.forEach(x => {
            let item = x as ICommentEntity;
            finalResult.push(item);
        });
        return results;
    }

    async getAllMyComments(upn: string): Promise<CommentEntity[]> {
        let filter = odata`upn eq '${upn}'`;
        const results = await super.getAllWithFilter(filter);
        const finalResult = [];
        results.forEach(x => {
            let item = x as ICommentEntity;
            finalResult.push(item);
        });
        return results;
    }

    async getAllComments(): Promise<CommentEntity[]> {
        const results = await super.getAll();
        const finalResult = [];
        results.forEach(x => {
            let item = x as ICommentEntity;
            finalResult.push(item);
        });
        return results;
    }

    async createOrUpdateComment(entity: ICommentEntity) {
        try {
            return await super.createOrUpdateEntity(entity as CommentEntity);
        }
        catch (error) {
            throw error;
        }
    }

    async createManyComments(entities: ICommentEntity[]) {
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
                let item = x as ICommentEntity;
                finalResult.push(item);
            });
            return finalResult;
        }
        catch (error) {
            throw error;
        }
    }

    async updateManyComments(entities: ICommentEntity[]) {
        try {
            const results = await super.batchUpdate(entities);
            const finalResult = [];
            results.forEach((x, index) => {
                let item = x as ICommentEntity;
                finalResult.push(item);
            });
            return finalResult;
        }
        catch (error) {
            throw error;
        }
    }

    async deleteManyComments(requestId: string) {
        try {
            const results = await super.batchDelete(requestId);
            return true;
        }
        catch (error) {
            throw error;
        }
    }
}