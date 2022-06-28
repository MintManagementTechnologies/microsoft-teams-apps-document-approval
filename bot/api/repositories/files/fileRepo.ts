import { Readable } from 'stream';

import {
    BlobDownloadResponseParsed, BlobServiceClient, ContainerClient
} from '@azure/storage-blob';

import { IBaseFileEntity, IFileEntity } from './fileEntity';

export interface IBlobServiceClientOptions {
   connectionString: string,
   containerName: string,
}

export interface IFileRepo {
   getAllFolderFiles(_folderPath: string): Promise<IBaseFileEntity[]>
   uploadFile(_entity: IFileEntity): Promise<IBaseFileEntity>;
   deleteFile(_filePath: string): Promise<boolean>;
   deleteFolder(_filePath: string): Promise<boolean>;
   copyFilesToFolder(_sourceFolderPath: string, _destinationFolderPath: string, _fileDisplayName: string): Promise<boolean>;
   getFileStream(_filePath: string): Promise<any>;
}

export default class FileRepo implements IFileRepo {
   blobServiceClient: BlobServiceClient;
   containerClient: ContainerClient;

   constructor(_options: IBlobServiceClientOptions) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(_options.connectionString);
      this.createContainerIfNotExists(_options.containerName).then(() => {
         this.containerClient = this.blobServiceClient.getContainerClient(_options.containerName);
      });
   }

   async createContainerIfNotExists(_containerName: string) {
      try {
         const result = await this.blobServiceClient.createContainer(_containerName);
         return
      } catch (error) {
         return;
      }
   }

   async getAllFolderFiles(_folderPath: string): Promise<IBaseFileEntity[]> {
      const result = [];
      for await (const blob of this.containerClient.listBlobsByHierarchy("/", { prefix: `${_folderPath}/` })) {
         const fileName = blob.name.replace(`${_folderPath}/`, '');
         result.push({
            name: fileName,
            url: `${this.containerClient.url}/${blob.name}`,
            contentType: (blob as any).properties.contentType,
            uploaded: true,
            size: (blob as any).properties.contentLength,
            // progress: 100
         })
      }
      return result;
   }

   async uploadFile(_entity: IFileEntity): Promise<IBaseFileEntity> {
      const data = Buffer.from(_entity.file, "base64");
      const blockBlobClient = this.containerClient.getBlockBlobClient(`${_entity.folderPath}/${_entity.name}`);
      const blobResponse = await blockBlobClient.uploadData(data, {
         blobHTTPHeaders: {
            blobContentType: `${_entity.contentType}`,
         },
      });
      if (blobResponse._response.status !== 201) {
         throw new Error(
            `Error uploading document ${blockBlobClient.name} to container ${blockBlobClient.containerName}`
         );
      } else {
         return {
            name: _entity.name,
            url: blockBlobClient.url,
            contentType: _entity.contentType,
            uploaded: true,
            size: _entity.size,
            // progress: number,
         }
      }
   }

   async deleteFile(_filePath: string): Promise<boolean> {
      try {
         const response = await this.containerClient
            .getBlockBlobClient(_filePath)
            .deleteIfExists();
         // debugger;
         return true;
      } catch (error) {
         console.log(JSON.stringify(error.message));
         return false;
      }
   }

   async deleteFolder(_folderPath: string): Promise<boolean> {
      try {
         const sourceFiles = await this.getAllFolderFiles(_folderPath);
         for await (const srcFile of sourceFiles) {
            await this.deleteFile(`${_folderPath}/${srcFile.name}`);
         }
         return true;
      } catch (error) {
         console.log(JSON.stringify(error.message));
         return false;
      }
   }

   async copyFilesToFolder(_sourceFolderPath: string, _destinationFolderPath: string, _fileDisplayName?: string): Promise<boolean> {
      try {
         let fileIndex = 0;
         const sourceFiles = await this.getAllFolderFiles(_sourceFolderPath);
         for await (const srcFile of sourceFiles) {
            fileIndex++;
            const fileExtension = srcFile.name.substring(srcFile.name.lastIndexOf('.'));
            const fileName = _fileDisplayName ? `${_fileDisplayName}-${fileIndex}${fileExtension}` : srcFile.name;
            const destinationBlockBlobClient = this.containerClient.getBlockBlobClient(`${_destinationFolderPath}/${fileName}`);
            const copyPoller = await destinationBlockBlobClient.beginCopyFromURL(srcFile.url);
            const result = await copyPoller.pollUntilDone();
         }
         return true;
      } catch (error) {
         debugger;
         console.log(JSON.stringify(error.message));
         return false;
      }
   }


   async getFileStream(_filePath: string): Promise<any> {
      try {
         const blockBlobClient = await this.containerClient.getBlockBlobClient(_filePath);
         const downloadBlockBlobResponse = await blockBlobClient.downloadToBuffer();
         const stream = Readable.from(downloadBlockBlobResponse.toString());
         debugger;
         return stream;
      } catch (error) {
         console.log(JSON.stringify(error.message));
         return false;
      }
   }
}