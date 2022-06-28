export interface IBaseFileEntity {
   name: string,
   url: string,
   contentType: string,
   uploaded: boolean,
   size: number,
   // progress: number,
}

export interface IFileEntity extends IBaseFileEntity {
   file: string,
   folderPath: string,
}