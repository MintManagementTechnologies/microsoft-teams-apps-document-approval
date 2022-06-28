export interface IFileRequestModel {
   file: File | string,
   name: string,
   folderName: string,
   contentType: string,
   size: number,
   deleteExistingFiles: boolean,
   deleteExistingFileNames?: string[],
}

export interface IFileBase64Model extends IFileRequestModel {
   file: string,
}

export interface IFileResponseModel {
   id: string | number,
   title: string,
   uploaded: boolean,
   viewUrl: string,
   contentType?: string,
   size?: number,
   progress?: number,
}

export interface IAzureBlobFile extends IFileResponseModel {
}

export interface ISharePointFile extends IFileResponseModel {
   downloadUrl: string,
}