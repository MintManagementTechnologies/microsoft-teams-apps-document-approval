import { odata, TableClient } from '@azure/data-tables';
import { setLogLevel } from '@azure/logger';

import BaseRepo, { IBaseRepo, TableClientOptions } from '../baseRepo';
import { IRequestEntity, RequestEntity } from './requestEntity';

export interface IRequestRepo extends IBaseRepo<IRequestEntity> {
   getAllRequestsByOutcome: (outcome: string) => Promise<RequestEntity[]>;
   getAllUserRequests: (requestorUPN: string) => Promise<IRequestEntity[]>;
   getAllUserRelatedRequests: (upn: string) => Promise<RequestEntity[]>;
   getAllApproverRequests: (approverUPN: string) => Promise<IRequestEntity[]>;
   createOrUpdateRequest: (request: IRequestEntity) => Promise<IRequestEntity>;
}

//constructor(serviceAccountUrl: string, tableName: string, credentials: AzureNamedKeyCredential, ensureTableExists: boolean = true)

export default class RequestRepo extends BaseRepo<RequestEntity> implements IRequestRepo {
   constructor(options: TableClientOptions, ensureTableExists: boolean = true) {
      super({
         serviceAccountUrl: options.serviceAccountUrl,
         credentials: options.credentials,
         tableName: 'Requests',
         ensureTableExists: ensureTableExists
      });
   }

   async getAllRequestsByOutcome(outcome: string): Promise<RequestEntity[]> {
      // Bug: Manualy filter, because substringof is not working anymore. It did though...
      let filter = odata`outcome eq '${outcome}'`;
      const results = await super.getAllWithFilter(filter);
      return results;
   }

   async getAllUserRequests(createdById: string): Promise<RequestEntity[]> {
      const results = await super.getAllWithPartition(createdById);
      const finalResult = [];
      results.forEach(x => {
         let item = x as IRequestEntity;
         finalResult.push(item);
      });
      return results;
   }

   async getAllUserRelatedRequests(upn: string): Promise<RequestEntity[]> {
      // Bug: Manualy filter, because substringof is not working anymore. It did though...
      // let filter = odata`createdByUPN eq '${upn}' or substringof(currentApproversUPN , '${upn}') or substringof(prevApproversUPN , '${upn}')`;
      let filter = odata`createdByUPN eq '${upn}' or currentApproversUPN eq '${upn}' or prevApproversUPN eq '${upn}'`;
      const results = await super.getAllWithFilter(filter);
      return results;
   }

   async getAllApproverRequests(approverUPN: string): Promise<RequestEntity[]> {
      // Bug: Manualy filter, because substringof is not working anymore. It did though...
      let filter = odata`substringof(currentApproversUPN , '${approverUPN}') or substringof(prevApproversUPN , '${approverUPN}')`;
      //   let filter = odata`active eq true`;
      const results = await super.getAllWithFilter(filter);

      const tmpFilteredResults = results.filter(x => x.currentApproversUPN.includes(approverUPN) || x.prevApproversUPN.includes(approverUPN));
      const finalResult = [];
      tmpFilteredResults.forEach(x => {
         let item = x as IRequestEntity;
         finalResult.push(item);
      });
      return finalResult;
   }

   public async createOrUpdateRequest(entity: IRequestEntity) {
      try {
         return await super.createOrUpdateEntity(entity as RequestEntity);
      }
      catch (error) {
         throw error;
      }
   }
}

/*
import { AzureNamedKeyCredential, odata, TableClient } from "@azure/data-tables";

export interface ITableRepo<T> {
    getEntity: (rowKey: string) => Promise<T>;
    getAllWithPartition: (partitionKey: string) => Promise<T[]>;
    createOrUpdateEntity: (entity: T) => Promise<T>;
    insertOrMergeEntity: (entity: T) => Promise<T>;
    deleteEntity: (rowKey: string) => Promise<boolean>;
}

export default class BaseRepo<T> implements ITableRepo<T> {
    client: TableClient;
    tableName: string;

*/