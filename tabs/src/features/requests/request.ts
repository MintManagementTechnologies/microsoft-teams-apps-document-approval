import { IBaseModel } from 'common/types';

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

export const newRequest: IRequestModel = {
   refNumber: 0,
   createdByUPN: "",
   createdById: "",
   createdByDisplayName: "",
   subject: "",
   description: "",
   supportingDocsLink: "",
   docType: "memo",
   classificationType: "",
   docTemplate: "memoTemplate",
   totalLevels: 0,
   currentLevel: 1,
   currentApproversUPN: [],
   prevApproversUPN: [],
   status: "created",
   outcome: "pending",
   version: 0,
   id: "",
   title: "",
   createdTimestamp: 0,
   modifiedTimestamp: 0,
   active: true
}
