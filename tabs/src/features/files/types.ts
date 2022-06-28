export interface IFileResult {
   id: string,
   downloadUrl: string,
   webUrl: string
}

export interface IBaseFile {
   id: string | number,
   title: string,
   uploaded: boolean,
   viewUrl: string,
   contentType?: string,
   size?: number,
   progress?: number,
}

export interface IFileModel extends IBaseFile {
   parentId: string,
   isTemporary?: boolean,
}

export interface IFile extends IBaseFile {
   file: File,
   parentId: string,
   docType?: string,
   downloadUrl?: string,
   createdTimestamp?: number;
   modifiedTimestamp?: number;
}

export interface IBaseFileRequestModel {
   file: File | string,
   name: string,
   parentId: string,
   contentType?: string,
   size?: number,
}

export interface IFileRequestModel extends IBaseFileRequestModel {
   file: string,
   isTemporary?: boolean,
   deleteExistingFiles: boolean,
   deleteExistingFileNames?: string[],
}

export interface IFileResponseModel extends IBaseFile {
}

export interface IAzureBlobFile extends IFileResponseModel {
}

export interface ISharePointFile extends IFileResponseModel {
   downloadUrl: string,
}

// export interface IFileX {
//    parentId: string,
//    prevFileName?: string,
//    file: File,
//    uploaded: boolean,
// }

// export interface IFileRequestModel {
//    fileBase64: string;
//    fileName: string;
//    contentType: string;
//    prevFileName: string;
// }

// export interface IFileResponseModel extends IBaseFile {
//    // id: string,
// }