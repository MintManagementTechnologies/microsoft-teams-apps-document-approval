import { odata, TableClient } from "@azure/data-tables";
import { setLogLevel } from "@azure/logger";

import BaseRepo, { TableClientOptions, IBaseRepo } from "../baseRepo";
import { ActorEntity, IActorEntity } from "./actorEntity";

export interface IActorRepo extends IBaseRepo<IActorEntity> {
    getAllRequestActors: (requestId: string) => Promise<IActorEntity[]>;
    getAllMyActors: (actorUPN: string) => Promise<IActorEntity[]>;
    getAllActors: () => Promise<IActorEntity[]>;
    getLevelActors: (requestId: string, level: number) => Promise<ActorEntity[]>;
    createOrUpdateActor: (request: IActorEntity) => Promise<IActorEntity>;
    createManyActors: (requests: IActorEntity[]) => Promise<IActorEntity[]>;
    updateManyActors: (requests: IActorEntity[]) => Promise<IActorEntity[]>;
    deleteManyActors: (requestId: string) => Promise<boolean>;
}

//constructor(serviceAccountUrl: string, tableName: string, credentials: AzureNamedKeyCredential, ensureTableExists: boolean = true)

export default class ActorRepo extends BaseRepo<ActorEntity> implements IActorRepo {
    constructor(options: TableClientOptions, ensureTableExists: boolean = true) {
        super({
            serviceAccountUrl: options.serviceAccountUrl, 
            credentials: options.credentials,
            tableName: 'Actors',  
            ensureTableExists: ensureTableExists
        });
    }
    
    async getAllRequestActors(requestId: string): Promise<ActorEntity[]> {
        const results = await super.getAllWithPartition(requestId);
        const finalResult = [];
        results.forEach(x => {
            let item = x as IActorEntity;
            finalResult.push(item);
        });
        return results;
    }

    async getAllMyActors(actorUPN: string): Promise<ActorEntity[]> {
        let filter = odata`upn eq '${actorUPN}'`;
        const results = await super.getAllWithFilter(filter);
        const finalResult = [];
        results.forEach(x => {
            let item = x as IActorEntity;
            finalResult.push(item);
        });
        return results;
    }

    async getAllActors(): Promise<ActorEntity[]> {
        const results = await super.getAll();
        const finalResult = [];
        results.forEach(x => {
            let item = x as IActorEntity;
            finalResult.push(item);
        });
        return results;
    }

    async getLevelActors(requestId: string, level: number): Promise<ActorEntity[]> {
        let filter = odata`PartitionKey eq '${requestId}' and level eq ${level}`;
        const results = await super.getAllWithFilter(filter);
        const finalResult = [];
        results.forEach(x => {
            let item = x as IActorEntity;
            finalResult.push(item);
        });
        return results;
    }

    async createOrUpdateActor(entity: IActorEntity) {
        try {
            return await super.createOrUpdateEntity(entity as ActorEntity);
        }
        catch (error) {
            throw error;
        }
    }

    async createManyActors(entities: IActorEntity[]) {
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
                let item = x as IActorEntity;
                finalResult.push(item);
            });
            return finalResult;
        }
        catch (error) {
            throw error;
        }
    }

    async updateManyActors(entities: IActorEntity[]) {
        try {
            const results = await super.batchUpdate(entities);
            const finalResult = [];
            results.forEach((x, index) => {
                let item = x as IActorEntity;
                finalResult.push(item);
            });
            return finalResult;
        }
        catch (error) {
            throw error;
        }
    }

    async deleteManyActors(requestId: string) {
        try {
            const results = await super.batchDelete(requestId);
            return true;
        }
        catch (error) {
            throw error;
        }
    }
}