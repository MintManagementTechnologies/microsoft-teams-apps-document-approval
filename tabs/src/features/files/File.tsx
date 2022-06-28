import './File.scss';

import {
    Attachment, ExcelColorIcon, FilesGenericColoredIcon, FilesPdfColoredIcon, FilesZipIcon, Loader,
    PowerPointColorIcon, WordColorIcon
} from '@fluentui/react-northstar';

import FileActionsPopup from './parts/FileActionsPopup';
import { IBaseFile } from './types';

const FileItem = (props: {
   sizeAndUnits: string,
   actions: string[],
   item: IBaseFile;
   onDeleteFile?: (id: string | number) => void;
}): JSX.Element => {
   const { item, sizeAndUnits, actions } = props;

   const getFileIcon = (fileName: string) => {
      if(!fileName){
         return <FilesGenericColoredIcon />;
      }
      if (fileName.endsWith(".xlsx")) {
         return <ExcelColorIcon />;
      } else if (fileName.endsWith(".docx") || fileName.endsWith(".dotx")) {
         return <WordColorIcon />;
      } else if (fileName.endsWith(".pptx")) {
         return <PowerPointColorIcon />;
      } else if (fileName.endsWith(".zip")) {
         return <FilesZipIcon />;
      } else if (fileName.endsWith(".pdf")) {
         return <FilesPdfColoredIcon />;
      }

      return <FilesGenericColoredIcon />;
   };
   return (
      <Attachment
         className={`mmt-attachment`}
         icon={getFileIcon(item.title)}
         header={item.title}
         description={sizeAndUnits}
         actionable
         progress={item.progress}
         disabled={!item.uploaded}
         action={{
            as: "span",
            title: "Show more",
            content: item.uploaded ? (<FileActionsPopup item={item} actions={actions} onDeleteAction={props.onDeleteFile} />) : (<Loader size="small" />),
         }}
      />
   );
};

export default FileItem;