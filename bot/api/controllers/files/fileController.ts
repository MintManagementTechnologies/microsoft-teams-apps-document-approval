import { ISiteConfigEntity } from 'api/repositories/Config/ConfigEntity';
import { IConfigRepo } from 'api/repositories/Config/ConfigRepo';
import { IBaseFileEntity, IFileEntity } from 'api/repositories/files/fileEntity';
import GraphService from 'api/services/msGraph/graphService';
import { v4 as uuid } from 'uuid';

import { IFileRepo } from '../../repositories/files/fileRepo';
import { IApiResponse } from '../baseModel';
import { IFileBase64Model, IFileResponseModel } from './fileModel';

export default interface IFileController {
   getDocTypeTemplates(req, res, next): Promise<IApiResponse>,
   getFiles(req, res, next): Promise<IApiResponse>,
   uploadFile(req, res, next): Promise<IApiResponse>,
   downloadFile(req, res, next): Promise<IApiResponse>,
   deleteFile(req, res, next): Promise<IApiResponse>,
   moveFiles(req: any, res: any, next: any): Promise<IApiResponse>
}

export class FileController implements IFileController {
   private static tmpFolderName: string;
   private static repo: IFileRepo;
   private static configRepo: IConfigRepo;
   private static graphSvc: GraphService;

   constructor(_repo: IFileRepo, _configRepo: IConfigRepo, _tmpFolderName: string, _graphSvc: GraphService) {
      FileController.repo = _repo;
      FileController.configRepo = _configRepo;
      FileController.tmpFolderName = _tmpFolderName;
      FileController.graphSvc = _graphSvc;
   }

   async getFiles(req: any, res: any, next: any): Promise<IApiResponse> {
      const folderId = req.params.folderId || 'noID';
      const isTemporary = req.query && req.query.isTemporary ? req.query.isTemporary === 'true' : false;
      try {
         const folderPath = FileController.getFolderPath(folderId, isTemporary);
         const result = await FileController.repo.getAllFolderFiles(folderPath);
         const responseModels: IFileResponseModel[] = result.map(x => FileController.mapEntityToModel(x));
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: responseModels
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error getFiles',
            data: []
         });
      }
      finally {
         return next();
      }
   }

   async uploadFile(req, res, next): Promise<IApiResponse> {
      const folderId = req.params.folderId || 'noID';
      const isTemporary = req.query && req.query.isTemporary ? req.query.isTemporary === 'true' : false;
      const model = req.body as IFileBase64Model;
      try {
         const fileName = model.name;
         if (model.deleteExistingFiles) {
            for await (const existingFile of model.deleteExistingFileNames) {
               const prevFilePath = FileController.getFilePath({ name: existingFile, folderName: folderId }, isTemporary);
               await FileController.repo.deleteFile(prevFilePath);
            }
         }
         const result = await FileController.repo.uploadFile(FileController.mapModelToEntity(model, isTemporary));
         const responseModel: IFileResponseModel = FileController.mapEntityToModel(result);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: responseModel
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: `Error uploadFile: ${error.message}`,
            data: null
         });
      }
      finally {
         return next();
      }
   }

   async downloadFile(req: any, res: any, next: any): Promise<IApiResponse> {
      res.send({
         status: 'failed',
         statusCode: 412,
         message: 'Method not implemented.',
         data: false
      });
      return next();
   }

   async deleteFile(req: any, res: any, next: any): Promise<IApiResponse> {
      const folderId = req.params.folderId || 'noFolderId';
      const fileId = req.params.fileId || 'noFileId';
      const isTemporary = req.query && req.query.isTemporary ? req.query.isTemporary === 'true' : false;
      try {
         const filePath = FileController.getFilePath({ name: fileId, folderName: folderId }, isTemporary);
         const result = await FileController.repo.deleteFile(filePath);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: result
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error deleteFile',
            data: false
         });
      }
      finally {
         return next();
      }
   }

   async deleteFolder(req: any, res: any, next: any): Promise<IApiResponse> {
      const folderId = req.params.folderId || 'noFolderId';
      const isTemporary = req.query && req.query.isTemporary ? req.query.isTemporary === 'true' : false;
      try {
         const folderPath = FileController.getFolderPath(folderId, isTemporary);
         const result = await FileController.repo.deleteFile(folderPath);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: result
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error deleteFolder',
            data: false
         });
      }
      finally {
         return next();
      }
   }

   async getDocTypeTemplates(req: any, res: any, next: any): Promise<IApiResponse> {
      const docType = req.params.docType || 'noDocType';
      const siteConfigEntity: ISiteConfigEntity = await FileController.configRepo.getSiteConfigForDocType(docType);
      const { driveId, templateFolderName } = siteConfigEntity;
      try {
         const result = await FileController.graphSvc.getFolderDocuments(driveId, templateFolderName, docType);
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: result
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error getDocTypeTemplates',
            data: []
         });
      }
      finally {
         return next();
      }
   }

   async moveFiles(req: any, res: any, next: any): Promise<IApiResponse> {
      const model = req.body as { fromTemporary: boolean, sourceFolderName: string, destinationFolderName: string };
      const refNumber = req.params.refNumber || 'noRefNumber';
      const docType = req.params.docType || 'noDocType';

      let fileName;
      if(refNumber !== 'noRefNumber'){
         fileName = `${refNumber}-${docType}`
      }
      const fromTemporary = model.fromTemporary;
      try {
         const sourceFolderPath = FileController.getFolderPath(model.sourceFolderName, fromTemporary);
         const destinationFolderPath = FileController.getFolderPath(model.destinationFolderName);
         const result = await FileController.repo.copyFilesToFolder(sourceFolderPath, destinationFolderPath, fileName);
         if (result === true) {
            const deleteResult = await FileController.repo.deleteFolder(sourceFolderPath);
         }
         res.send({
            status: 'success',
            statusCode: 200,
            message: 'OK',
            data: true
         });
      }
      catch (error) {
         res.send({
            status: 'error',
            statusCode: 500,
            message: 'Error moveFiles',
            data: false
         });
      }
      finally {
         return next();
      }
   }

   async copyBlobToSP(): Promise<IApiResponse> {
      try {
         const filePath = FileController.getFilePath({ name: 'test.pdf', folderName: '460f505c-790f-476f-a0d1-18794945c6c8' }, true);
      }
      catch (error) {
      }
      finally {
         return {
            status: 'error',
            statusCode: 500,
            message: 'Error ',
            data: false
         }
      }
   }

   private static mapEntityToModel(_entity: IBaseFileEntity): IFileResponseModel {
      let item: IFileResponseModel = {
         id: uuid(),
         title: _entity.name,
         viewUrl: _entity.url,
         uploaded: _entity.uploaded,
         contentType: _entity.contentType,
         size: _entity.size,
         // progress?: result.progress,
      }
      return item;
   }

   private static mapModelToEntity(model: IFileBase64Model, _isTmpPath: boolean): IFileEntity {
      const folderPath = FileController.getFolderPath(model.folderName, _isTmpPath);
      let item: IFileEntity = {
         file: model.file,
         folderPath: folderPath,
         name: model.name,
         url: '',
         contentType: model.contentType,
         uploaded: false,
         size: model.size
      }
      return item;
   }

   private static getFilePath(_model: Partial<IFileBase64Model>, _isTmpPath: boolean = false): string {
      const tmpFolderName = FileController.tmpFolderName;
      const filePath = `${_isTmpPath ? `${tmpFolderName}/` : ''}${_model.folderName}/${_model.name}`;
      return filePath;
   }

   private static getFolderPath(_folderName: string, _isTmpPath: boolean = false): string {
      const tmpFolderName = FileController.tmpFolderName;
      const filePath = `${_isTmpPath ? `${tmpFolderName}/` : ''}${_folderName}`;
      return filePath;
   }
}