export interface ITableEntity {
    partitionKey: string;
    rowKey: string;
    timestamp?: string;
}

export interface IBaseEntity extends ITableEntity {
    createdTimestamp: number;
}

export type BaseEntity = IBaseEntity;