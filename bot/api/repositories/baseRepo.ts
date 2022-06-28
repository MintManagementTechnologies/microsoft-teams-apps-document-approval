import { v4 as uuid } from 'uuid';

import {
    AzureNamedKeyCredential, odata, TableClient, TableEntity, TransactionAction
} from '@azure/data-tables';
import { setLogLevel } from '@azure/logger';

import { IBaseEntity } from './baseEntity';

export type TableClientOptions = {
    serviceAccountUrl: string,
    credentials: AzureNamedKeyCredential
}

export type BaseRepoOptions = {
    tableName: string,
    ensureTableExists?: boolean
} & TableClientOptions;

export interface IBaseRepo<T> {
    getEntityWithRowKey(rowKey: string): Promise<T>;
    getEntityWithFilter(_filter: string): Promise<T>;
    getEntityWithField(fieldName: string, fieldValue: string): Promise<T>;
    getEntity(partitionKey: string, rowKey: string): Promise<T>;
    getAll: () => Promise<T[]>;
    getAllWithPartition: (partitionKey: string) => Promise<T[]>;
    createOrUpdateEntity: (entity: T) => Promise<T>;
    insertOrMergeEntity: (entity: T) => Promise<T>;
    deleteEntity(rowKey: string): Promise<boolean>;
    deleteEntity(partitionKey: string, rowKey: string): Promise<boolean>;
}

export default class BaseRepo<T extends IBaseEntity> implements IBaseRepo<T> {
    client: TableClient;
    tableName: string;

    constructor(options: BaseRepoOptions) {
        //setLogLevel("verbose");
        this.client = new TableClient(options.serviceAccountUrl, options.tableName, options.credentials);
        this.tableName = options.tableName;
        if (options.ensureTableExists) {
            this.createTableIfNotExists();
        }
    }

    public async createTableIfNotExists() {
        const _tableName = this.tableName;
        await this.client.createTable();
    }

    public async createOrUpdateEntity(entity: T) {
        try {
            return await this.client.upsertEntity(entity as TableEntity<T>).then((result) => {
                return {
                    ...entity,
                    timestamp: result.date.toUTCString()
                };
            });
        }
        catch (error) {
            throw error;
        }
    }

    public async insertOrMergeEntity(entity: T) {
        try {
            return new Promise<T>((resolve, reject) => {
                const newEntity = {} as T;
                resolve(newEntity);
            });
        }
        catch (error) {
            throw error;
        }
    }

    async deleteEntity(partitionKey: string, rowKey: string): Promise<boolean>;
    async deleteEntity(rowKey: string): Promise<boolean>;
    async deleteEntity(partitionKey: any, rowKey?: any): Promise<boolean> {
        try {
            let _pKey = partitionKey;
            if (partitionKey === undefined) {
                const results = await this.client.listEntities({ queryOptions: { filter: odata`RowKey eq '${rowKey}'` } });
                for await (const result of results) {
                    _pKey = result.partitionKey;
                }
            }
            await this.client.deleteEntity(_pKey, rowKey);
            return new Promise<boolean>((resolve, reject) => {
                resolve(true);
            });
        }
        catch (error) {
            throw error;
        }
    }

    async getEntity(partitionKey: string, rowKey: string): Promise<T> {
        try {
            let finalResult;
            const result = await this.client.getEntity(partitionKey, rowKey);
            finalResult = result;
            return finalResult as T;
        }
        catch (error) {
            throw error;
        }
    }

    
    async getEntityWithRowKey(rowKey: string): Promise<T> {
        try {
            let finalResult;
            const results = await this.client.listEntities({ queryOptions: { filter: odata`RowKey eq '${rowKey}'` } });
            for await (const result of results) {
                finalResult = result;
            }
            return finalResult as T;
        }
        catch (error) {
            throw error;
        }
    }

    
    async getEntityWithField(fieldName: string, fieldValue: string): Promise<T> {
        try {
            let finalResult;
            const results = await this.client.listEntities({ queryOptions: { filter: odata`${fieldName} eq '${fieldValue}'` } });
            for await (const result of results) {
                finalResult = result;
            }
            return finalResult as T;
        }
        catch (error) {
            throw error;
        }
    }
    
    async getEntityWithFilter(_filter: string): Promise<T> {
        try {
            let finalResult;
            const results = await this.client.listEntities({ queryOptions: { filter: _filter } });
            for await (const result of results) {
                finalResult = result;
            }
            return finalResult as T;
        }
        catch (error) {
            throw error;
        }
    }

    public async getAll() {
        try {
            let finalResult: any[] = [];
            const results = this.client.listEntities();
            for await (const result of results) {
                finalResult.push(result);
            }
            return finalResult;
        }
        catch (error) {
            throw error;
        }
    }

    public async getAllWithPartition(partition: string) {
        try {
            let finalResult: T[] = [];
            const results = this.client.listEntities({ queryOptions: { filter: odata`PartitionKey eq '${partition}'` } });
            for await (const result of results) {
                finalResult.push(result as T);
            }
            return finalResult;
        }
        catch (error) {
            throw error;
        }
    }

    public async getAllWithFilter(_filter: string) {
        try {
            let finalResult: T[] = [];
            const results = this.client.listEntities({ queryOptions: { filter: _filter } });
            for await (const result of results) {
                finalResult.push(result as T);
            }
            return finalResult;
        }
        catch (error) {
            throw error;
        }
    }

    public async batchCreate(entities: T[]) {
        try {
            const partitionKey = entities[0].partitionKey;
            const actions = entities.map(x => ["create", {...x, rowKey: uuid()}] as TransactionAction);
            await this.client.submitTransaction(actions);
            return await this.getAllWithPartition(partitionKey);
        }
        catch (error) {
            throw error;
        }
    }

    public async batchUpdate(entities: T[]) {
        try {
            const partitionKey = entities[0].partitionKey;
            const actions = entities.map(x => ["upsert", x] as TransactionAction);
            await this.client.submitTransaction(actions);
            return await this.getAllWithPartition(partitionKey);
        }
        catch (error) {
            throw error;
        }
    }

    public async batchDelete(partitionKey: string) {
        try {
            let actions: TransactionAction[] = [];
            const results = this.client.listEntities({ queryOptions: { filter: odata`PartitionKey eq '${partitionKey}'`, select: [`PartitionKey`, `RowKey`] } });
            for await (const result of results) {
                actions.push(["delete", result] as TransactionAction);
            }
            if(actions.length > 0)
               return await this.client.submitTransaction(actions);
        }
        catch (error) {
            throw error;
        }
    }
}



		//const client = new TableClient(`https://${account}.table.core.windows.net`, tableName, credential);
		// Example 1
		//const results = client.listEntities({ queryOptions: { filter: odata`PartitionKey eq 'abrie'` } });

		// Example 2
		// const results = tableClient.listEntities({ queryOptions: { filter: odata`PartitionKey eq 'Stanford' and Major eq 'Business' or Major eq 'Robotic'` } });

		// Example 3
		// const results = tableClient.listEntities({ queryOptions: { filter: odata`PartitionKey eq 'Stanford' and (Major eq 'Business' or Major eq 'Robotic')` } });

		// Example 4
		// const results = tableClient.listEntities({
		//   queryOptions:
		//   {
		//     filter: odata`PartitionKey eq 'Stanford' and (Major eq 'Business' or Major eq 'Robotic')`,
		//     select: [`FirstName`, `Major`]
		//   }
		// });

		// Example 5
		// const results = tableClient.listEntities({
		//   queryOptions:
		//   {
		//     select: [`FirstName`, `Email`]
		//   }
		// });
		//let finalResult:RequestEntity[] = [];
		// for await (const result of results) {
		// 	const newEntity = new RequestEntity(result as ITableEntity);
		// 	newEntity.updateStatusAndOutcome('newValue');
		// 	finalResult.push(newEntity);
		// }
		// return {
		// 	message: "getAction.",
		// 	data: finalResult
		// }