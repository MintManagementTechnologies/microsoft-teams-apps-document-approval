import { IBaseEntity } from '../baseEntity';

export interface IUserEntity extends IBaseEntity {
   upn: string;
   firstName: string;
   lastName: string;
   jobTitle: string;
   department: string;
   personaTypes: string;
   title: string;
   active: boolean;
}