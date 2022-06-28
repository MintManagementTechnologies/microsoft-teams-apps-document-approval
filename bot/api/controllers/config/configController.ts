import { distinct } from '../../../helpers/sharedFunctions';
import {
    IConfigEntity, ISiteConfigEntity, ITeamConfigEntity
} from '../../repositories/Config/ConfigEntity';
import { IConfigRepo } from '../../repositories/Config/ConfigRepo';
import { IBaseController } from '../baseController';
import { IApiResponse } from '../baseModel';
import {
    IConfigModel, IDocTypeConfigResponse, IRefNumberConfigModel, ISiteConfigModel, ITeamConfigModel
} from './configModel';

export default interface IConfigController {
   getNewRefNumber: (req, res, next) => Promise<IRefNumberConfigModel>;
   ensureRefNumberExists: () => Promise<boolean>;
   getAllConfig: (req, res, next) => Promise<IApiResponse>;
   getSiteConfig: (req, res, next) => Promise<ISiteConfigModel>;
   getTeamConfig: (req, res, next) => Promise<ITeamConfigModel>;
   createSiteConfig: (req, res, next) => Promise<IApiResponse>;
   updateSiteConfig: (req, res, next) => Promise<IApiResponse>;
   getDocTypeTeamConfig:(_docType: string) => Promise<ITeamConfigModel>;
}

export class ConfigController implements IConfigController {
   private static repo: IConfigRepo;

   constructor(_repo: IConfigRepo) {
      ConfigController.repo = _repo;
   }

   async getNewRefNumber(req, res, next): Promise<IRefNumberConfigModel> {
      try {
         const entity: IConfigEntity = await ConfigController.repo.createNewRefNumber();
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: { refNumber: entity.value }
         });
      }
      catch (error) {
         res.send({ status: 500, message: 'Error getNewRefNumber' });
      }
      finally {
         return next();
      }
   }

   async ensureRefNumberExists(): Promise<boolean> {
      try {
         const doesExist = await ConfigController.repo.ensureRefNumberExists();
         return doesExist;
      }
      catch (error) {
         return false;
      }
   }

   async ensureSiteConfigExists(): Promise<boolean> {
      try {
         const entities = await ConfigController.repo.getAllSiteConfig();
         return entities.length > 0;
      }
      catch (error) {
         // debugger;
         return false;
      }
   }

   async getAllConfig(req: any, res: any, next: any): Promise<IApiResponse> {
      try {
         const spConfigEntities: ISiteConfigEntity[] = await ConfigController.repo.getAllSiteConfig();
         const spConfigModels: ISiteConfigModel[] =  spConfigEntities.map(x => ConfigController.mapSiteEntityToModel(x));
         const teamConfigEntities: ITeamConfigEntity[] = await ConfigController.repo.getAllTeamConfig();
         const teamConfigModels: ITeamConfigModel[] =  teamConfigEntities.map(x => ConfigController.mapTeamEntityToModel(x));
         const docTypes = ConfigController.getDocTypesForConfig(spConfigModels, teamConfigModels);

         const results:IDocTypeConfigResponse[] = [];

         docTypes.forEach(docType => {
            const config = { 
               docType: docType,
               spConfig: spConfigModels.filter(x => x.id === docType),
               teamConfig: teamConfigModels.filter(x => x.id === docType),
            }
            results.push(config);
         })
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: results
         });
      }
      catch (error) {
         debugger;
         res.send({ status: 500, message: 'Error getSiteConfig' });
      }
      finally {
         return next();
      }
   }

   async getSiteConfig(req: any, res: any, next: any): Promise<ISiteConfigModel> {
      const docType = req.params.docType as string;
      try {
         const entity: ISiteConfigEntity = await ConfigController.repo.getSiteConfigForDocType(docType);
         const model: ISiteConfigModel = ConfigController.mapSiteEntityToModel(entity);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: model
         });
      }
      catch (error) {
         debugger;
         res.send({ status: 500, message: 'Error getSiteConfig' });
      }
      finally {
         return next();
      }
   }

   async createSiteConfig(req: any, res: any, next: any): Promise<IApiResponse> {
      const model = req.body as ISiteConfigModel;
      try {
         const entity: ISiteConfigEntity = ConfigController.mapSiteModelToEntity(model);
         await ConfigController.repo.createOrUpdateSiteConfig(entity);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: true
         });
      }
      catch (error) {
         debugger;
         res.send({ status: 500, message: 'Error createSiteConfig' });
      }
      finally {
         return next();
      }
   }

   async updateSiteConfig(req: any, res: any, next: any): Promise<IApiResponse> {
      const docType = req.params.docType as string;
      const model = req.body as ISiteConfigModel;
      try {
         res.send({
            status: 'error',
            statusCode: 412,
            message: 'Error updateSiteConfig - not Implemented',
            data: false
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error updateSiteConfig',
            data: false
         });
      }
      finally {
         return next();
      }
   }

   private static mapSiteEntityToModel(entity: ISiteConfigEntity): ISiteConfigModel {
      let item: ISiteConfigModel = {
         ...entity,
         configType: entity.partitionKey,
         id: entity.rowKey,
         siteId: entity.value,
         modifiedTimestamp: new Date(entity.timestamp).getTime(),
      }
      delete (item as any).value;
      delete (item as any).rowKey;
      delete (item as any).partitionKey;
      delete (item as any).timestamp;
      return item;
   }

   private static mapSiteModelToEntity(model: ISiteConfigModel): ISiteConfigEntity {
      let item: ISiteConfigEntity = {
         ...model,
         partitionKey: model.configType,
         rowKey: model.id,
         value: model.siteId,
         createdTimestamp: model.createdTimestamp ? model.createdTimestamp : new Date().getTime(),
      }
      delete (item as any).siteId;
      delete (item as any).id;
      delete (item as any).configType;
      delete (item as any).modifiedTimestamp;
      return item;
   }

   async getTeamConfig(req: any, res: any, next: any): Promise<ITeamConfigModel> {
      const docType = req.params.docType as string;
      try {
         const entity: ITeamConfigEntity = await ConfigController.repo.getTeamConfigForDocType(docType);
         const model: ITeamConfigModel = ConfigController.mapTeamEntityToModel(entity);
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
            message: 'Error getSiteConfig',
            data: null
         });
      }
      finally {
         return next();
      }
   }

   async getDocTypeTeamConfig(_docType: string): Promise<ITeamConfigModel> {
      try {
         const entity: ITeamConfigEntity = await ConfigController.repo.getTeamConfigForDocType(_docType);
         const model: ITeamConfigModel = ConfigController.mapTeamEntityToModel(entity);
         return model;
      }
      catch (error) {
         return null;
      }
   }

   async createTeamConfig(req: any, res: any, next: any): Promise<IApiResponse> {
      const model = req.body as ITeamConfigModel;
      try {
         const entity: ITeamConfigEntity = ConfigController.mapTeamModelToEntity(model);
         await ConfigController.repo.createOrUpdateTeamConfig(entity);
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
            message: 'Error createSiteConfig',
            data: false
         });
      }
      finally {
         return next();
      }
   }

   async updateTeamConfig(req: any, res: any, next: any): Promise<IApiResponse> {
      const docType = req.params.docType as string;
      const model = req.body as ITeamConfigModel;
      try {
         res.send({
            status: 'error',
            statusCode: 412,
            message: 'Error updateSiteConfig - not Implemented',
            data: false
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error updateTeamConfig',
            data: false
         });
      }
      finally {
         return next();
      }
   }

   private static mapTeamEntityToModel(entity: ITeamConfigEntity): ITeamConfigModel {
      let item: ITeamConfigModel = {
         ...entity,
         configType: entity.partitionKey,
         id: entity.rowKey,
         modifiedTimestamp: new Date(entity.timestamp).getTime(),
      }
      delete (item as any).value;
      delete (item as any).rowKey;
      delete (item as any).partitionKey;
      delete (item as any).timestamp;
      return item;
   }

   private static mapTeamModelToEntity(model: ITeamConfigModel): ITeamConfigEntity {
      let item: ITeamConfigEntity = {
         ...model,
         partitionKey: model.configType,
         rowKey: model.id,
         value: 'NA',
         createdTimestamp: model.createdTimestamp ? model.createdTimestamp : new Date().getTime(),
      }
      delete (item as any).id;
      delete (item as any).configType;
      delete (item as any).modifiedTimestamp;
      return item;
   }

   private static getDocTypesForConfig(_spConfigs: ISiteConfigModel[] = [], _teamConfigs: ITeamConfigModel[] = []): string[] {
      const spConfigDocTypes: string[] = _spConfigs.map(x => x.id);
      const teamConfigDocTypes: string[] = _teamConfigs.map(x => x.id);
      return [...spConfigDocTypes, ...teamConfigDocTypes].filter(distinct);
   }
}