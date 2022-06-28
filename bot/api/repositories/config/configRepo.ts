import { odata, TableClient } from '@azure/data-tables';
import { setLogLevel } from '@azure/logger';

import BaseRepo, { IBaseRepo, TableClientOptions } from '../baseRepo';
import {
    IConfigEntity, IRefNumberConfigEntity, ISiteConfigEntity, ITeamConfigEntity
} from './configEntity';

export interface IConfigRepo extends IBaseRepo<IConfigEntity> {
   createNewRefNumber: () => Promise<IRefNumberConfigEntity>;
   ensureRefNumberExists: () => Promise<boolean>;
   getAllConfig:() => Promise<IConfigEntity[]>;
   createOrUpdateSiteConfig: (entity: ISiteConfigEntity) => Promise<boolean>;
   getAllSiteConfig: () => Promise<ISiteConfigEntity[]>;
   getSiteConfigForDocType: (docType: string) => Promise<ISiteConfigEntity>;
   createOrUpdateTeamConfig: (entity: ITeamConfigEntity) => Promise<boolean>;
   getAllTeamConfig: () => Promise<ITeamConfigEntity[]>;
   getTeamConfigForDocType: (docType: string) => Promise<ITeamConfigEntity>;
}

//constructor(serviceAccountUrl: string, tableName: string, credentials: AzureNamedKeyCredential, ensureTableExists: boolean = true)

export default class ConfigRepo extends BaseRepo<IConfigEntity> implements IConfigRepo {
   private refNumber_rowKey: string;
   private refNumber_partitionKey: string;
   private spSite_partitionKey: string;
   private team_partitionKey: string;

   constructor(options: TableClientOptions, ensureTableExists: boolean = true) {
      super({
         serviceAccountUrl: options.serviceAccountUrl,
         credentials: options.credentials,
         tableName: 'Config',
         ensureTableExists: ensureTableExists
      });
      this.refNumber_rowKey = 'incrementRefNumber';
      this.refNumber_partitionKey = 'refNumberConfig';
      this.spSite_partitionKey = 'spSiteConfig';
      this.team_partitionKey = 'teamConfig';
   }

   async ensureRefNumberExists() {
      try {
         const refNumber = await this.getRefNumber();
         return true;
      }
      catch (error) {
         const newRefNumber: IRefNumberConfigEntity = {
            value: 1000,
            createdTimestamp: new Date().getTime(),
            partitionKey: this.refNumber_partitionKey,
            rowKey: this.refNumber_rowKey
         }
         await super.createOrUpdateEntity(newRefNumber);
      }
   }

   async getRefNumber(): Promise<IRefNumberConfigEntity> {
      const result = await super.getEntity(this.refNumber_partitionKey, this.refNumber_rowKey);
      return result as IRefNumberConfigEntity;
   }

   async createNewRefNumber(): Promise<IRefNumberConfigEntity> {
      const refNumberEntity = await this.getRefNumber();
      refNumberEntity.value++;
      let itemChanged;
      for (let index = 0; index < 20; index++) {
         itemChanged = false;
         const dtm = new Date().getTime();

         try {
            await super.createOrUpdateEntity(refNumberEntity);
         }
         catch (error) {
            if (error.statusCode == 412) {
               console.error("Optimistic concurrency violation – entity has changed since it was retrieved.");
               itemChanged = true;
            }
            else {
               throw error;
            }
         }

         if (itemChanged) {
            continue;
         }
         const tsp = new Date().getTime() - dtm;

         const latest_refNumberEntity = await this.getRefNumber()
         if (latest_refNumberEntity) {
            console.error("Returning latest_refNumberEntity.");
            return latest_refNumberEntity;
         }
         console.error("No item found.");
         return;
      }
   }

   async getAllConfig(): Promise<IConfigEntity[]> {
      const result = await super.getAll();
      return result as IConfigEntity[];
   }

   async createOrUpdateSiteConfig(entity: ISiteConfigEntity): Promise<boolean> {
      try {
         await super.createOrUpdateEntity(entity);
         return true;
      }
      catch (error) {
         return false;
      }
   }

   async getAllSiteConfig(): Promise<ISiteConfigEntity[]> {
      const result = await super.getAllWithPartition(this.spSite_partitionKey);
      return result as ISiteConfigEntity[];
   }

   async getSiteConfigForDocType(docType: string): Promise<ISiteConfigEntity> {
      const result = await super.getEntity(this.spSite_partitionKey, docType);
      return result as ISiteConfigEntity;
   }

   async createOrUpdateTeamConfig(entity: ITeamConfigEntity): Promise<boolean> {
      try {
         await super.createOrUpdateEntity(entity);
         return true;
      }
      catch (error) {
         return false;
      }
   }

   async getAllTeamConfig(): Promise<ITeamConfigEntity[]> {
      const result = await super.getAllWithPartition(this.team_partitionKey);
      return result as ITeamConfigEntity[];
   }

   async getTeamConfigForDocType(docType: string): Promise<ITeamConfigEntity> {
      const result = await super.getEntity(this.team_partitionKey, docType);
      return result as ITeamConfigEntity;
   }
}