import { IBaseModel } from '../baseModel';

export interface IConfigModel extends IBaseModel {
   configType: string, // PartitionKey -> spSiteConfig, refNumberConfig, teamConfig
}

export interface IRefNumberConfigModel extends IConfigModel {
   refNumber: number,
   //id -> rowKey -> incrementRefNumber
   //value -> refNumber -> 1000
}

export interface ISiteConfigModel extends IConfigModel {
   //id -> rowKey -> docType -> memo
   //value -> siteId -> ...
   title: string,
   siteId: string,
   domainName: string,
   url: string,
   driveId: string,
   docLibId: string,
   docLibName: string,
   templateFolderName: string,
}

export interface ITeamConfigModel extends IConfigModel {
   //id -> rowKey -> docType -> memo
   //value -> Not using -> ...
   teamName: string,
   channelName: string,
   teamId: string,
   channelId: string,
}

export interface IDocTypeConfigResponse {
   docType: string;
   spConfig: ISiteConfigModel[];
   teamConfig: ITeamConfigModel[];
}