import { IBaseEntity } from "../baseEntity";

export interface ICommentEntity extends IBaseEntity {
   upn: string,
   comment: string,
   version: number,
}

export type CommentEntity = ICommentEntity;