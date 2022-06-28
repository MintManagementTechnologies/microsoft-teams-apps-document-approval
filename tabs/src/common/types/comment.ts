import { IBaseModel } from ".";

export interface ICommentModel extends IBaseModel {
   requestId: string,
   upn: string,
   comment: string,
   version: number,
}

export const newComment: ICommentModel = {
   requestId: "",
   upn: "",
   comment: "",
   version: 0,
   id: "",
   title: "",
   createdTimestamp: 0,
   modifiedTimestamp: 0,
   active: false
}