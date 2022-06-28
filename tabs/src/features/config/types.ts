export interface IConfigModel {
   id: string, // rowKey -> docType -> memo
   configType: string, // PartitionKey -> spSiteConfig
}

export interface ISiteFolderModel {
   driveId: string,
   docLibId: string,
   docLibName: string,
   templateFolderName: string,
}

export interface ISiteModel {
   title: string,
   siteId: string,
   domainName: string,
   url: string,
}

export interface ISiteConfigModel extends IConfigModel, ISiteFolderModel, ISiteModel {
   id: string, // rowKey -> docType -> memo
   configType: string, // PartitionKey -> spSiteConfig
}

export interface ITeamModel {
   teamName: string,
   channelName: string,
   teamId: string,
   channelId: string,
}

export interface ITeamConfigModel extends IConfigModel, ITeamModel {
   id: string, // rowKey -> docType -> memo
   configType: string, // PartitionKey -> teamChannelConfig
}

export interface IDocTypeConfigModel {
   docType: string;
   spConfig: ISiteConfigModel[];
   teamConfig: ITeamConfigModel[];
}