import { convertToBase64 } from 'common/utils/helpers/stringHelpers';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, Text } from '@fluentui/react-northstar';
import { skipToken } from '@reduxjs/toolkit/dist/query';

import Loader from '../../../components/common/Loader';
import { RootState, useAppDispatch, useTypedSelector } from '../../../store';
import FileList from '../FileList';
import {
    useDeleteFileMutation, useGetFilesByFolderIdQuery, useUploadFileMutation
} from '../fileService';
import {
    formStateChanged, itemAdded, itemChanged, itemDeleted, itemUploading, listChanged,
    selectAllFiles
} from '../fileSlice';
import FileUploader from '../parts/FileUploader';
import { IFileRequestModel } from '../types';

type AttachmentProps = {
   requestId: string,
   maxAttachments: number,
   overrideAttachment?: boolean,
   canDelete?: boolean,
   disabled?: boolean,
   isTemporary?: boolean
};

const Attachment = (props: AttachmentProps): JSX.Element => {
   const { maxAttachments, overrideAttachment, canDelete, requestId, disabled, isTemporary } = props;
   const isNew = isTemporary || false;
   const { t } = useTranslation();
   const dispatch = useAppDispatch();

   const selectedFile = useTypedSelector((state: RootState) => state.file.item);
   const selectedAllFiles = useTypedSelector(selectAllFiles);

   const { data: dataGetFilesByFolderId, isFetching: isFetchingGetFilesByFolderId, isLoading: isLoadingGetFilesByFolderId }
      = useGetFilesByFolderIdQuery(requestId ? { isNew: isNew, requestId: requestId } : skipToken);
   const [uploadFile, { data: dataUploadFile, isSuccess: isSuccessUploadFile }] = useUploadFileMutation();
   const [deleteFile, { data: dataDeleteFile, isSuccess: isSuccessDeleteFile }] = useDeleteFileMutation();


   useEffect(() => {
      if (!dataGetFilesByFolderId) return;
      dispatch(listChanged(dataGetFilesByFolderId));
      // if (dataGetFilesByFolderId.length > 0 && dataGetFilesByFolderId[0].uploaded)
      //    dispatch(formStateChanged('isValid'));
      // else
         dispatch(formStateChanged(''));
   }, [dataGetFilesByFolderId]);

   useEffect(() => {
      if (isSuccessUploadFile === false) {
         dispatch(formStateChanged(''));
         return;
      }
      if (!(selectedFile && dataUploadFile)) return;
      if (!overrideAttachment) {
         dispatch(itemAdded(dataUploadFile));
      } else {
         dispatch(listChanged([dataUploadFile]));
      }
      dispatch(itemChanged(null));
      dispatch(formStateChanged('isValid'));
   }, [dataUploadFile, isSuccessUploadFile]);

   useEffect(() => {
      if (isSuccessDeleteFile === false) {
         dispatch(formStateChanged(''));
         return;
      }
      if (!selectedFile) return;
      dispatch(itemDeleted(selectedFile));
      dispatch(itemChanged(null));
      dispatch(formStateChanged(''));
   }, [isSuccessDeleteFile]);

   const handleOnUpload = async (_file: File, _docType: string) => {
      if (!_file)
         throw new Error('fileService.uploadAttachment -> File Control is null!');
      dispatch(itemUploading(_file));
      const fileBase64 = await convertToBase64(_file) as string;
      let fileRequestItem: IFileRequestModel = {
         file: fileBase64,
         name: _file.name,
         parentId: requestId,
         contentType: _file.type,
         size: _file.size,
         isTemporary: isNew,
         deleteExistingFiles: overrideAttachment || false,
         deleteExistingFileNames: overrideAttachment ? selectedAllFiles.map(x => x.title) : [],
      }
      uploadFile(fileRequestItem);
   };

   const handleOnDelete = async (_id: string | number) => {
      const currentFile = selectedAllFiles.find(x => x.id === _id);
      if (!currentFile) {
         debugger;
         return;
      }
      dispatch(itemChanged(currentFile));
      deleteFile({
         title: currentFile.title,
         parentId: requestId,
         isTemporary: isNew,
      });
   };

   const isLoading = isLoadingGetFilesByFolderId || isFetchingGetFilesByFolderId;
   return (
      <Flex gap="gap.small" column>
         <Text content={`${t('form.docType.value.memo')} ${t('common:entity.attachment', { count: 1 })}`} weight={'semibold'} size={"large"} />
         {isLoading ? <Loader message={t('common:entity.attachment', { count: 1 })} />
            : <FileList uploadTrigger={"onAdd"}
               files={selectedAllFiles ? selectedAllFiles : []}
               onDeleteFile={canDelete ? handleOnDelete : undefined} />
         }
         {selectedAllFiles.length === 0 && <Text content={t('common:error.noItems', { entity: t('common:entity.attachment', { count: 0 }) })} />}
         {!disabled &&
            <Flex>
               <FileUploader
                  onChange={(file) => handleOnUpload(file, "memo")}
                  isDisabled={selectedAllFiles.length > maxAttachments}
                  maxAllowedSize={10}
                  label={t("common:button.attach")}
               />
            </Flex>
         }
      </Flex>
   );
}

export default Attachment;