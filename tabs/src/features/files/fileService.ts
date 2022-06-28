import { baseApi } from '../../services';
import {
    IBaseFile, IFileModel, IFileRequestModel, IFileResponseModel, ISharePointFile
} from './types';

export const fileService = baseApi.injectEndpoints({
   endpoints: (build) => ({
      getFilesByFolderId: build.query<IFileResponseModel[], { isNew: boolean, requestId: string }>({
         query: (item) => `files/${item.requestId}?isTemporary=${item.isNew}`,
      }),
      uploadFile: build.mutation<IBaseFile, IFileRequestModel>({
         query(item) {
            const { file } = item;
            const base64ContentIndex = file.indexOf(";base64,") + 8;
            const body = {
               file: file.substring(base64ContentIndex),
               name: item.name,
               folderName: item.parentId,
               contentType: item.contentType,
               size: item.size,
               deleteExistingFiles: item.deleteExistingFiles,
               deleteExistingFileNames: item.deleteExistingFileNames,
            };

            return {
               url: `files/upload/${item.parentId}?isTemporary=${item.isTemporary}`,
               method: 'POST',
               body
            };
         },
      }),
      deleteFile: build.mutation<boolean, Partial<IFileModel>>({
         query(item) {
            return {
               url: `files/${item.parentId}/${item.title}?isTemporary=${item.isTemporary}`,
               method: 'DELETE'
            };
         },
      }),
      moveFiles: build.mutation<boolean, { isNew: boolean, requestId: string, refNumber: number, docType: string }>({
         query(item) {
            let body = {
               fromTemporary: item.isNew,
               sourceFolderName: item.requestId,
               destinationFolderName: item.isNew ? item.requestId : 'complete'
            }
            return {
               url: `files/move/${item.docType}/${item.refNumber}`,
               method: 'PUT',
               body: body
            };
         },
      }),
      getDocTypeTemplates: build.query<ISharePointFile[], string>({
         query: (docType) => `files/templates/${docType}`,
      }),
   }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
   endpoints: fileEndpoints,
   useGetFilesByFolderIdQuery,
   useUploadFileMutation,
   useDeleteFileMutation,
   useMoveFilesMutation,
   useGetDocTypeTemplatesQuery,
} = fileService


// uploadFile: build.mutation<IBaseFile, IFileRequestModel>({
//    async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
//       // let result: IFile;
//       // let formData = new FormData();
//       // formData.append('File-Name', file.name);
//       // formData.append('File', file);
//       // await axiosJWTDecoratorInstance.post(`${baseApiUrl}files/upload/${parentId}`, formData)
//       const {
//          file,
//          name,
//          parentId,
//          isTemporary,
//          deleteExistingFiles
//       } = _arg;
//       try {
//          if (!file)
//             throw new Error('fileService.uploadAttachment -> File Control is null!');
//          const reqFileB64 = await FileToBase64String(file) as string;
//          const base64ContentIndex = reqFileB64.indexOf(";base64,") + 8;
//          const fileRequestItem = {
//             file: reqFileB64.substring(base64ContentIndex),
//             name: name,
//             folderName: parentId,
//             contentType: _arg.contentType,
//             size: _arg.size,
//             deleteExistingFiles: _arg.deleteExistingFiles,
//             deleteExistingFileNames: _arg.deleteExistingFileNames,
//          };
//          const baseApiUrl = getApiBaseUrl();
//          const response: AxiosResponse<IFileResponseModel> = await axiosJWTDecoratorInstance.post(`${baseApiUrl}files/upload/${parentId}?isTemporary=${isTemporary}`, fileRequestItem);
//          return { data: response.data };
//       } catch (error: any) {
//          return {
//             error: {
//                status: error.statusCode,
//                error: error.message
//             }
//          }
//       }
//    },
// }),