import { IBaseModel } from "../baseModel";

export interface IActorModel extends IBaseModel {
   requestId: string,
   userId: string,
   upn: string,
   personaType: string,
   endorsementType: string,
   level: number,
   completedTimestamp: number,
   status: string,
   outcome: string,
   version: number,
}

export type ActorModel = IActorModel;