import './File.scss';

import { Flex } from '@fluentui/react-northstar';

import FileItem from './File';
import { IBaseFile } from './types';

type FileListProps = {
   compactView?: boolean;
   uploadTrigger: "onAdd" | "onButtonClick";
   files: IBaseFile[];
   onDeleteFile?: (fileId: string | number) => void;
};

const FileList = (props: FileListProps): JSX.Element => {
   let files = props.files ? props.files : ([] as IBaseFile[]);
   if (!Array.isArray(files)) {
      return <Flex column gap="gap.smaller" fill></Flex>
   }
   return (
      <Flex column gap="gap.smaller" fill>
         {files.map((x: IBaseFile, index: number) => {
            let fileSize = x.size || 0;
            let sizeAndUnits =
               fileSize / 1024 / 1024 < 1
                  ? Math.round(fileSize / 1024) + "KB"
                  : Math.round(fileSize / 1024 / 1024) + "MB";
            if (fileSize === 0) sizeAndUnits = "";
            const actions = ['view', 'download'];
            if (props.onDeleteFile !== undefined) actions.push('delete');
            return (<FileItem item={x} sizeAndUnits={sizeAndUnits} actions={actions} onDeleteFile={props.onDeleteFile} key={`fileItem-${index}`} />
            );
         })}
      </Flex>
   );
};

export default FileList;

/*

            // let file: any = x.file;
            // if (!file) {
            //    file = {
            //       name: 'No Name',
            //       size: 0
            //    };
            // }
               <Attachment
                  key={`attachment-${index}`}
                  className={`mmt-attachment attachment-${index}`}
                  icon={getFileIcon(x.title)}
                  header={x.title}
                  description={sizeAndUnits}
                  actionable
                  progress={x.progress}
                  disabled={!x.uploaded}
                  action={{
                     as: "span",
                     title: "Show more",
                     content: x.uploaded ? (<FileActionsPopup item={x} actions={actions} onDeleteAction={props.onDeleteFile} />) : (<Loader size="small" />),
                  }}
               />

               */