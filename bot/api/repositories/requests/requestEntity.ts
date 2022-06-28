import { IBaseEntity } from '../baseEntity';

export interface IRequestEntity extends IBaseEntity {
   refNumber: number,
   createdByUPN: string,
   createdByDisplayName: string,
   subject: string,
   description: string,
   supportingDocsLink: string,
   docType: string,
   classificationType: string,
   docTemplate: string,
   totalLevels: number,
   currentLevel: number,
   currentApproversUPN: string,
   prevApproversUPN: string,
   status: string,
   outcome: string,
   version: number
}

export type RequestEntity = IRequestEntity;