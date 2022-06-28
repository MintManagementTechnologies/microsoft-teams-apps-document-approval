import { IBaseEntity } from "../baseEntity";

export interface IActorEntity extends IBaseEntity {
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

export type ActorEntity = IActorEntity;