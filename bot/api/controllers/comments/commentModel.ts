import { IBaseModel } from "../baseModel";

export interface ICommentModel extends IBaseModel {
   requestId: string,
   upn: string,
   comment: string,
   version: number,
}

export type CommentModel = ICommentModel;