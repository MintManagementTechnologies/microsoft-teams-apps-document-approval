import { IBaseModel } from '../../common/types';

export interface IActorModel extends IBaseModel {
   requestId: string,
   userId: string,
   upn: string,
   comments?: string,
   personaType: string,
   endorsementType: string,
   level: number,
   completedTimestamp: number,
   status: string,
   outcome: string,
   version: number,
   image?: string,
}

export const newActor: IActorModel = {
   requestId: "",
   userId: '',
   upn: "",
   personaType: "actor",
   endorsementType: "",
   level: 0,
   completedTimestamp: 0,
   status: "",
   outcome: "",
   version: 0,
   id: "",
   title: "",
   createdTimestamp: 0,
   modifiedTimestamp: 0,
   active: false
}

export interface IActorLevel {
   endorsementType: string,
   level: number,
   actors: IActorModel[],
   status: string,
   outcome: string,
   availablePersonas: string[],
   requiredPersonas: string[],
   id: string,
   title: string,
}

export const newActorLevel: IActorLevel = {
   endorsementType: "recommender",
   level: 1,
   availablePersonas: ['actor', 'pa'],
   requiredPersonas: ['actor'],
   actors: [],
   status: "",
   outcome: "",
   id: "",
   title: "Actor & PA",
   // isValid: false,
}


let defaultActorLevel = {
   endorsementType: "",
   level: 1,
   availablePersonas: ['actor', 'pa'],
   requiredPersonas: ['actor'],
   actors: [],
   status: "",
   outcome: "",
   id: "",
   title: "Actor & PA",
   createdTimestamp: 0,
   modifiedTimestamp: 0,
   active: false,
};