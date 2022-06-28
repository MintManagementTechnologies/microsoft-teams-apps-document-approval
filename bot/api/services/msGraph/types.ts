import { IFileResponseModel } from 'api/controllers/files/fileModel';

export interface IClientConfig {
   auth: {
      clientId: string;
      clientSecret: string;
      tenantId: string;
   };
}

export interface IGraphSPSiteResult {
   createdDateTime: string;
   id: string;
   lastModifiedDateTime: string;
   name: string;
   webUrl: string;
   displayName: string;
   root: {};
   siteCollection: {
      hostname: string;
   };
}

export interface IGraphDriveResult {
   createdDateTime: string;
   description: string;
   id: string;
   lastModifiedDateTime: string;
   name: string;
   webUrl: string;
   driveType: string;
}

export interface ISharePointFile extends IFileResponseModel {
   downloadUrl: string,
}

export interface IGraphError {
   statusCode: number
}