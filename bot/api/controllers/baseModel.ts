export interface IApiResponse {
   status: 'success' | 'error' | '',
   statusCode: number,
   message: string,
   data: any
}

export interface IBaseModel {
    id: string;
    modifiedTimestamp?: number;
    createdTimestamp?: number;
}

export type BaseModel<T extends IBaseModel> = IBaseModel;