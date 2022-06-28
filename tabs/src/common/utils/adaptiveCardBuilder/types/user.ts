import { IBaseModel } from './';

export interface IBaseUserModel extends IBaseModel {
   upn: string,
}

export interface ISimpleUserModel extends IBaseUserModel {
   image?: string,
   availability?: string,
   activity?: string,
}

export interface IDetailedUserModel extends ISimpleUserModel {
   firstName: string,
   lastName: string,
   jobTitle: string,
   department: string,
}

export interface IUserModel extends IDetailedUserModel {
   personaTypes: string[],
}