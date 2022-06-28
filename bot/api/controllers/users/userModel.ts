import { IBaseModel } from '../baseModel';

export interface IBaseUserModel extends IBaseModel {
   upn: string,
   active: boolean,
}

export interface ISimpleUserModel extends IBaseUserModel {
   image?: string,
   availability?: string,
   activity?: string,
}

export interface IDetailedUserModel extends ISimpleUserModel {
   title: string,
   firstName: string,
   lastName: string,
   jobTitle: string,
   department: string,
}

export interface IUserModel extends IDetailedUserModel {
   personaTypes: string[],
}