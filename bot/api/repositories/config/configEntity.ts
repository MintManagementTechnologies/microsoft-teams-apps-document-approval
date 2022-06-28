import { IBaseEntity } from '../baseEntity';

export interface IConfigEntity extends IBaseEntity {
   value: string | number,
}

export interface IRefNumberConfigEntity extends IConfigEntity {
   value: number,
}

export interface ISiteConfigEntity extends IConfigEntity {
   //id -> rowKey -> docType -> memo
   //value -> siteId -> ...
   value: string,
   title: string,
   domainName: string,
   url: string,
   driveId: string,
   docLibId: string,
   docLibName: string,
   templateFolderName: string,
}

export interface ITeamConfigEntity extends IConfigEntity {
   //id -> rowKey -> docType -> memo
   //value -> siteId -> ...
   value: string,
   teamName: string,
   channelName: string,
   teamId: string,
   channelId: string,
}