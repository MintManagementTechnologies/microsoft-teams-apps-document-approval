export type filterTypeOption = string | string[] | number | number[] | boolean;

export interface IBaseModel {
   id: string;
   title: string;
   createdTimestamp: number;
   modifiedTimestamp: number;
   active: boolean;
}

export const requiredPersonas = ['actor'];
export const availablePersonas = ['actor', 'pa'];