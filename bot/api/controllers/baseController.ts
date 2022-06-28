import {BaseModel, IApiResponse} from "./baseModel";
import { IBaseModel } from "./baseModel";

export interface IBaseController<T extends IBaseModel> {
   createSingleItem(req, res, next): Promise<IApiResponse>,
   readManyItems(req, res, next): Promise<T[]>,
   readSingleItem(req, res, next): Promise<T>,
   updateManyItems(req, res, next): Promise<IApiResponse>,
   updateSingleItem(req, res, next): Promise<IApiResponse>,
   deleteManyItems(req, res, next): Promise<IApiResponse>,
   deleteSingleItem(req, res, next): Promise<IApiResponse>,
}