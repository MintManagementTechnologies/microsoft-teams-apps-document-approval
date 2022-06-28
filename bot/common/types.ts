export interface IBaseModel {
   id: string;
   modifiedTimestamp?: number;
   createdTimestamp?: number;
}

export interface ICredentials {
   id: string;
   password: string;
}

export interface IBotConfig {
   id: string;
   password: string;
}