import { IBaseModel } from '../baseModel';

export interface IRequestModel extends IBaseModel {
   refNumber: number,
   createdByUPN: string,
   createdById: string,
   createdByDisplayName: string,
   subject: string,
   description: string,
   supportingDocsLink: string,
   docType: string,
   classificationType: string,
   docTemplate: string,
   totalLevels: number,
   currentLevel: number,
   currentApproversUPN: string[],
   prevApproversUPN: string[],
   status: string,
   outcome: string,
   version: number
}

export type RequestModel = IRequestModel;